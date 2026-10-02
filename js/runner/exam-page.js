/* Runner chung cho mọi đề kiểm tra: exam.html?preset=<id> (xem config/presets.json).
   - Đề sinh từ seed → tải lại trang (F5) vẫn đúng đề, đúng đáp án đang làm, đúng giờ còn lại.
   - Nộp bài (bấm nút hoặc hết giờ) → khoá bài, chấm, hiện lời giải, lưu Firestore (có nút thử lại).
   - Doc Firestore giữ các field cũ (score, byQuestion, examType, chapter, image) và thêm
     presetId, seed, byProblem. */
import { createRng, randomSeed } from '../core/rng.js';
import { round2, scaleResult } from '../core/grading.js';
import { session } from '../core/storage.js';
import { currentStudent, logout } from '../core/auth.js';
import { escapeHtml } from '../core/escape.js';
import { resolvePreset, presetIdFromParams, chapterLabelOf } from './preset-resolver.js';
import { mountQuestion, fmtPoints } from '../ui/question-view.js';
import { startCountdown, formatClock } from '../ui/timer.js';
import { showToast } from '../ui/toast.js';
import { playSound, bindClickSounds } from '../ui/sound.js';
import { celebrate } from '../ui/confetti.js';
import { startStudyTimer } from '../ui/study-timer.js';

const $ = (id) => document.getElementById(id);
const MAX_IMAGE_CHARS = 900000; // Firestore giới hạn 1 MiB mỗi doc

const presets = await fetch('config/presets.json', { cache: 'no-cache' }).then((r) => r.json());
const presetId = presetIdFromParams(new URLSearchParams(location.search));
const preset = presets[presetId];
const STATE_KEY = 'moyumath_exam_' + presetId;

let state = null;      // { seed, variant, deadline, answers: [], graded, saved }
let exam = null;       // { questions, params, views }
let timer = null;
let lastSummary = null;
/* Trình duyệt nhớ lỗi import() của một module tới khi tải lại trang, nên nếu không tải được
   Firebase thì "Lưu lại" phải tải lại trang (bài đã nộp vẫn nằm trong sessionStorage và được lưu tự động). */
let firebaseModule = null;
let firebaseUnavailable = false;
function loadFirebase() {
  firebaseModule ||= import('../core/firebase.js').catch((err) => { firebaseUnavailable = true; throw err; });
  return firebaseModule;
}

/* Bài đang làm thuộc về học sinh nào — đổi tài khoản trên cùng tab thì bỏ bài của người trước. */
const studentKey = () => currentStudent().username || currentStudent().displayName;

function persist() {
  session.setJSON(STATE_KEY, state);
}

function newState(variant) {
  return { seed: randomSeed(), variant, deadline: Date.now() + preset.durationMin * 60000, answers: [], graded: false, saved: false, student: studentKey() };
}

function renderHeader() {
  document.title = preset.title;
  $('examHeading').textContent = preset.heading;
  $('examSubtitle').textContent = preset.subtitle || '';
  $('studentName').value = currentStudent().displayName;

  const links = ['<a href="index.html">Trang cá nhân</a>'];
  for (const [id, p] of Object.entries(presets)) {
    if (id !== presetId && !p.hidden && p.chapter === preset.chapter) {
      links.push('<a href="exam.html?preset=' + encodeURIComponent(id) + '">' + escapeHtml(p.examType) + '</a>');
    }
  }
  if (preset.chapter) links.push('<a href="practice.html?chapter=' + preset.chapter + '">Luyện tập Chương ' + preset.chapter + '</a>');
  if (preset.review) links.push('<a href="review.html?id=' + encodeURIComponent(preset.review) + '">Đề cương ôn tập</a>');
  links.push('<a href="#" id="logoutLink">Đăng xuất</a>');
  $('footerLinks').innerHTML = links.join(' · ');
  $('logoutLink').addEventListener('click', (e) => { e.preventDefault(); logout(); });
}

function buildExam() {
  const rng = createRng(state.seed);
  const questions = resolvePreset(preset, rng);
  const params = questions.map((q) => q.problem.generate({ rng, difficulty: q.difficulty }));
  const host = $('questions');
  host.innerHTML = '';
  const views = questions.map((q, i) => {
    const section = document.createElement('section');
    section.className = 'question';
    section.innerHTML = '<div class="q-head">Câu ' + (i + 1) + ' <span class="pts">' + fmtPoints(q.points) + ' điểm</span></div>';
    const body = document.createElement('div');
    body.className = 'q-body';
    section.append(body);
    host.append(section);
    const view = mountQuestion(body, q.problem, params[i], 'q' + (i + 1));
    view.restore(state.answers[i]);
    return view;
  });
  exam = { questions, params, views };
  $('variantTag').textContent = 'Đề số ' + state.variant;
  $('scoreValue').innerHTML = '—<span class="max">/' + fmtPoints(preset.totalPoints) + '</span>';
  $('summaryNote').textContent = '';
  if (window.clearScratchpad) window.clearScratchpad();
}

function saveAnswers() {
  if (!exam || state.graded) return;
  state.answers = exam.views.map((v) => v.collect());
  persist();
}

function setButtons() {
  $('gradeBtn').hidden = state.graded;
  $('clearBtn').hidden = state.graded;
  $('retrySaveBtn').hidden = !(state.graded && !state.saved);
  $('timerBox').hidden = state.graded;
}

function startTimer() {
  timer?.stop();
  timer = startCountdown({
    deadline: state.deadline,
    onTick(left) {
      $('timerValue').textContent = formatClock(left);
      $('timerBox').classList.toggle('warning', left <= (preset.warnAtSec ?? 60));
    },
    onEnd() {
      showToast('⏰ Hết giờ! Bài đã được tự động nộp.', { error: true });
      finish();
      $('summaryNote').textContent = '⏰ Hết giờ, bài đã được tự động nộp. ' + $('summaryNote').textContent;
    },
  });
}

/* Chấm và hiển thị kết quả từ state.answers (dùng cả khi tải lại trang sau khi đã nộp). */
function showGraded() {
  const byQuestion = {}, byProblem = {};
  let total = 0;
  exam.questions.forEach((q, i) => {
    const view = exam.views[i];
    const result = scaleResult(q.problem.grade(exam.params[i], state.answers[i] || {}), q.points, q.problem.points);
    const earned = result.parts.reduce((s, p) => s + p.earned, 0);
    total += earned;
    view.restore(state.answers[i]);
    view.setDisabled(true);
    view.showResult(result);
    view.showExplanation(q.problem.explain(exam.params[i]));
    byQuestion[q.label] = { earned: round2(earned), max: q.points };
    const bp = (byProblem[q.problem.id] ||= { earned: 0, max: 0 });
    bp.earned = round2(bp.earned + earned);
    bp.max = round2(bp.max + q.points);
  });
  total = round2(total);
  const max = preset.totalPoints;
  $('scoreValue').innerHTML = fmtPoints(total) + '<span class="max">/' + fmtPoints(max) + '</span>';
  const t = fmtPoints(total) + '/' + fmtPoints(max);
  const ratio = total / max;
  $('summaryNote').textContent =
    ratio >= 0.9 ? 'Xuất sắc! ' + t + ' điểm.'
      : ratio >= 0.7 ? 'Khá tốt — ' + t + ' điểm. Xem lại các câu có dấu ✗ nhé.'
        : ratio >= 0.5 ? 'Đạt yêu cầu — ' + t + ' điểm. Cần ôn lại một số phần.'
          : 'Cần cố gắng hơn — ' + t + ' điểm. Xem lại đáp án ở từng câu.';
  setButtons();
  return { total, byQuestion, byProblem };
}

function finish() {
  if (state.graded) return;
  timer?.stop();
  saveAnswers();
  state.graded = true;
  persist();
  lastSummary = showGraded();
  playSound('submit');
  const ratio = lastSummary.total / preset.totalPoints;
  setTimeout(() => cheer(ratio), 450);
  save(lastSummary);
}

/* Chỉ chúc mừng ngay lúc nộp bài (không lặp lại khi tải lại trang đã chấm). */
function cheer(ratio) {
  if (ratio >= 0.9) {
    playSound('celebrate');
    celebrate();
  } else if (ratio >= 0.5) {
    playSound('correct');
  }
}

/* html2canvas 1.4 không đọc được màu color(srgb …) mà trình duyệt trả về cho color-mix() (ném lỗi cả lần chụp)
   → trên bản sao dùng để chụp, đổi các màu đó sang rgba(). */
const COLOR_PROPS = ['color', 'background-color', 'background-image', 'border-top-color', 'border-right-color',
  'border-bottom-color', 'border-left-color', 'outline-color', 'text-decoration-color', 'box-shadow', 'fill', 'stroke'];
const toRgba = (value) => value.replace(/color\(srgb ([\d.e+-]+) ([\d.e+-]+) ([\d.e+-]+)(?: \/ ([\d.e+-]+))?\)/g, (_, r, g, b, a) =>
  'rgba(' + [r, g, b].map((v) => Math.round(Math.min(1, Math.max(0, Number(v))) * 255)).join(', ') + ', ' + (a ?? 1) + ')');

function normalizeColors(doc) {
  const win = doc.defaultView;
  for (const el of doc.querySelectorAll('.sheet, .sheet *')) {
    const cs = win.getComputedStyle(el);
    for (const p of COLOR_PROPS) {
      const v = cs.getPropertyValue(p);
      if (v.includes('color(')) el.style.setProperty(p, toRgba(v));
    }
  }
}

/* Ảnh chụp bài làm cho admin — giảm chất lượng nếu quá giới hạn kích thước doc.
   Chụp lỗi thì lưu bài không kèm ảnh: điểm của bé quan trọng hơn ảnh. */
async function captureSheet() {
  if (typeof window.html2canvas !== 'function') return '';
  try {
    for (const [scale, quality] of [[1.5, 0.8], [1, 0.6], [0.75, 0.5]]) {
      const canvas = await window.html2canvas(document.querySelector('.sheet'), { backgroundColor: '#FFFFFF', scale, onclone: normalizeColors });
      const url = canvas.toDataURL('image/jpeg', quality);
      if (url.length <= MAX_IMAGE_CHARS) return url;
    }
  } catch (err) {
    console.error('Không chụp được ảnh bài làm (bài vẫn được lưu, không kèm ảnh):', err);
  }
  return '';
}

async function save(summary, { auto = false } = {}) {
  const name = currentStudent().displayName;
  if (!name) {
    if (!auto) alert('Không tìm thấy họ tên học sinh — hãy đăng nhập lại để bài làm được lưu.');
    return;
  }
  $('retrySaveBtn').hidden = true;
  showToast('Đang lưu bài làm...');
  try {
    const [{ saveExamSubmission }, image] = await Promise.all([loadFirebase(), captureSheet()]);
    await saveExamSubmission(name, {
      score: summary.total + '/' + preset.totalPoints,
      image,
      byQuestion: summary.byQuestion,
      byProblem: summary.byProblem,
      examType: preset.examType,
      chapter: chapterLabelOf(preset),
      presetId,
      seed: state.seed,
    });
    state.saved = true;
    persist();
    showToast('✓ Đã lưu bài làm của ' + name + '!');
  } catch (err) {
    console.error('Lỗi khi lưu bài làm:', err);
    showToast(firebaseUnavailable
      ? '✗ Không kết nối được máy chủ — bấm "Lưu lại" để tải lại trang (bài làm vẫn được giữ).'
      : '✗ Lưu bài làm thất bại — bấm "Lưu lại" để thử lại.', { error: true, duration: 6000 });
  }
  setButtons();
}

function start(fresh) {
  if (fresh || !state) {
    state = newState((state?.variant || 0) + 1);
    persist();
  }
  buildExam();
  setButtons();
  if (state.graded) {
    lastSummary = showGraded();
    if (!state.saved) save(lastSummary, { auto: true }); // lần trước nộp nhưng chưa lưu được
  } else {
    startTimer();
  }
}

function init() {
  if (!preset) {
    $('questions').innerHTML = '<p class="q-prompt">Không tìm thấy đề "' + escapeHtml(presetId) + '". ' +
      '<a href="index.html">Quay lại trang cá nhân</a>.</p>';
    ['gradeBtn', 'shuffleBtn', 'clearBtn', 'timerBox'].forEach((id) => { $(id).hidden = true; });
    return;
  }
  renderHeader();
  state = session.getJSON(STATE_KEY);
  if (state?.student && state.student !== studentKey()) state = null;
  start(false);

  $('questions').addEventListener('input', saveAnswers);
  $('questions').addEventListener('change', saveAnswers);
  $('gradeBtn').addEventListener('click', () => {
    if (confirm('Nộp bài và chấm điểm? Sau khi nộp sẽ không sửa được đáp án.')) finish();
  });
  $('shuffleBtn').addEventListener('click', () => {
    if (!state.graded && !confirm('Đổi sang đề khác? Bài đang làm sẽ bị huỷ và tính giờ lại từ đầu.')) return;
    start(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  $('clearBtn').addEventListener('click', () => {
    if (!confirm('Xoá hết đáp án đã nhập? (Đồng hồ vẫn tiếp tục chạy.)')) return;
    exam.views.forEach((v) => v.clearAnswers());
    saveAnswers();
  });
  $('retrySaveBtn').addEventListener('click', () => {
    if (firebaseUnavailable) location.reload();
    else if (lastSummary) save(lastSummary);
  });
  if (window.Scratchpad) window.Scratchpad.init(document.querySelector('.sheet'));
  bindClickSounds();
  startStudyTimer({ mode: 'exam', studentName: currentStudent().displayName, isBusy: () => !!state && !state.graded });
}

init();
