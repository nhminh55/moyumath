/* Runner luyện tập chung: practice.html?chapter=N&problem=<id>  (link cũ ?q=1 / ?q=ch2_3 vẫn chạy).
   Danh sách dạng bài lấy từ curriculum/ (practice !== false), tiến độ & sao theo js/runner/stars.js.
   Firestore (giữ nguyên cấu trúc cũ):
   - "Đã làm/{tên}/luyện tập/{sessionId}"         — tổng kết phiên (byQuestion theo nhãn cũ + byProblem, chapter)
   - "Đã làm/{tên}/giới hạn luyện tập/{key cũ}"   — lượt, điểm, cờ thưởng của từng dạng bài */
import { createRng, randomSeed } from '../core/rng.js';
import { totalEarned, totalMax, correctCount } from '../core/grading.js';
import { local } from '../core/storage.js';
import { currentStudent, logout } from '../core/auth.js';
import { escapeHtml } from '../core/escape.js';
import {
  allChapters, getChapter, getProblem, listProblems, problemFromPracticeKey, practiceNumber, storageKeyOf, statLabelOf,
} from './registry.js';
import {
  BASE_GOAL, emptyStat, avgOfScores, starsForStat, statFromDoc, isLegacyDoc, migrateLegacy, recordAttempt, resetStat, totalStars,
} from './stars.js';
import { mountQuestion, fmtPoints } from '../ui/question-view.js';
import { showToast } from '../ui/toast.js';
import { playSound, bindClickSounds } from '../ui/sound.js';
import { burstFrom, celebrate } from '../ui/confetti.js';
import { rewardStars, countTo } from '../ui/star-reward.js';
import { startStudyTimer } from '../ui/study-timer.js';
import { syncCosmetics, identityHTML, cachedCosmetics } from '../ui/cosmetics.js';

const $ = (id) => document.getElementById(id);
const STARS_KEY = 'moyumath_stars';
const MAX_WRONG_DETAILS = 50;
const STREAK_STEP = 5; // mỗi 5 câu đúng liên tiếp được chúc mừng một lần

const url = new URLSearchParams(location.search);
const wanted = getProblem(url.get('problem')) || (url.get('q') ? problemFromPracticeKey(url.get('q')) : null);
const chapter = getChapter(url.get('chapter') || wanted?.chapter || 1) || getChapter(1);
const problems = listProblems({ chapter: chapter.chapter, practice: true });
const student = currentStudent();

let presets = {};
let current = null;          // { problem, params, view, locked }
const limits = {};           // storageKey -> stat
let limitsState = 'loading'; // 'loading' | 'ready' | 'failed'
const sessionLog = [];       // { problem, earned, max, text }
let sessionId = null;
let streak = 0;              // số câu đúng trọn vẹn liên tiếp trong phiên
let studyTimer = null;
let shopInv;                 // kho Tiệm Phép Thuật: undefined = đang tải, null = không tải được
const saveChains = {};

/* ---------- Firebase (nạp động: trang vẫn luyện được khi mất mạng, chỉ là không lưu) ---------- */
let firebaseModule = null;
function loadFirebase() {
  firebaseModule ||= import('../core/firebase.js');
  return firebaseModule;
}

/* Các lần ghi cùng một doc được xếp hàng để không ghi đè lộn thứ tự.
   Mỗi lần ghi gửi trọn trạng thái hiện tại, nên lần ghi sau thành công cũng lưu bù lượt trước bị lỗi.
   Lỗi thì báo bé một lần (đến khi lưu lại được) — không để bé tưởng sao đã được ghi. */
let saveFailing = false;
function queueWrite(key, fn) {
  saveChains[key] = (saveChains[key] || Promise.resolve())
    .then(fn)
    .then(() => {
      if (!saveFailing) return;
      saveFailing = false;
      showToast('✓ Đã lưu lại tiến độ luyện tập.');
    })
    .catch((err) => {
      console.error('Lỗi lưu luyện tập (' + key + '):', err);
      if (saveFailing) return;
      saveFailing = true;
      showToast('⚠ Chưa lưu được lượt làm vừa rồi — kiểm tra mạng rồi tải lại trang, nếu không sao của lượt này sẽ bị mất.', { error: true, duration: 7000 });
    });
  return saveChains[key];
}

/* ---------- tên hiển thị ---------- */
const cardName = (p) => 'Dạng ' + practiceNumber(p) + ' · ' + (p.shortTitle || p.title);
const sheetTitle = (p) => p.topic + ' · Dạng ' + practiceNumber(p) + ' — ' + p.title;

function statOf(problem) {
  return limits[storageKeyOf(problem)] || emptyStat();
}

function examBadges(problem) {
  return Object.values(presets)
    .filter((ps) => !ps.hidden && ps.badge && (ps.items || []).some((it) => it.problem === problem.id))
    .map((ps) => ps.badge)
    .filter((b, i, arr) => arr.indexOf(b) === i);
}

/* ---------- cột trái: danh sách dạng bài ---------- */
function renderPicker() {
  const html = chapter.topics.map((t) => {
    const ps = problems.filter((p) => p.topic === t.id);
    if (!ps.length) return '';
    return '<div class="picker-group"><h2 class="picker-group-title">' + escapeHtml(t.full) + '</h2><div class="picker-grid">' +
      ps.map((p) => {
        const badges = examBadges(p);
        const badge = badges.length
          ? '<span class="topic-badge exam">' + escapeHtml(badges.join(' · ')) + '</span>'
          : '<span class="topic-badge extra">Rèn thêm</span>';
        return '<button class="picker-btn" type="button" data-id="' + escapeHtml(p.id) + '">' +
          '<span class="picker-card-head">' +
            '<span class="picker-btn-title">' + escapeHtml(cardName(p)) + badge + '</span>' +
            '<span class="picker-card-stats">' +
              '<span class="picker-star-badge" hidden></span>' +
              '<span class="picker-score-badge">—</span>' +
              '<span class="picker-turns-count">0/' + BASE_GOAL + ' lượt</span>' +
            '</span>' +
          '</span>' +
          '<span class="picker-progress-track"><span class="picker-progress-fill picker-turns-fill"></span></span>' +
        '</button>';
      }).join('') + '</div></div>';
  }).join('');
  $('pickerGrid').innerHTML = html;
}

/* Mức theo % — khớp ngưỡng "điểm mạnh/khá/cần cải thiện" ở trang cá nhân; màu ở css/pages/practice.css. */
function toneForPct(pct) {
  if (pct >= 80) return 'good';
  if (pct >= 60) return 'mid';
  return 'low';
}

function renderCard(problem) {
  const btn = $('pickerGrid').querySelector('.picker-btn[data-id="' + CSS.escape(problem.id) + '"]');
  if (!btn) return;
  const stat = statOf(problem);
  const stars = starsForStat(stat);
  const starBadge = btn.querySelector('.picker-star-badge');
  starBadge.hidden = stars === 0;
  starBadge.textContent = '⭐ ' + stars;
  btn.querySelector('.picker-turns-count').textContent = stat.attempts + '/' + BASE_GOAL + ' lượt';
  const fill = btn.querySelector('.picker-turns-fill');
  fill.style.width = Math.min(100, Math.round((stat.attempts / BASE_GOAL) * 100)) + '%';
  fill.style.background = stat.attempts >= BASE_GOAL ? 'var(--success)' : 'var(--gold)';
  const badge = btn.querySelector('.picker-score-badge');
  if (!stat.scores.length) {
    badge.textContent = '—';
    delete badge.dataset.tone;
  } else {
    const avg = Math.round(avgOfScores(stat.scores));
    badge.textContent = avg + '%';
    badge.dataset.tone = toneForPct(avg);
  }
}

/* Sao còn lại = đã nhận (tiến độ + thời gian học) − đã tiêu ở Tiệm Phép Thuật. */
function renderStarTotal() {
  if (limitsState !== 'ready' || shopInv === undefined) return;
  const earned = totalStars(limits) + (studyTimer?.stars() || 0);
  const spent = shopInv?.spent || 0;
  local.set(STARS_KEY, String(earned - spent));
  countTo($('starTotal'), earned - spent, (n) => '⭐ ' + n);
  $('starTotal').title = shopInv
    ? 'Đã nhận ' + earned + ' ⭐ · Đã tiêu ' + spent + ' ⭐ — bấm để vào Tiệm Phép Thuật'
    : 'Đã nhận ' + earned + ' ⭐ (chưa tải được số sao đã tiêu) — bấm để vào Tiệm Phép Thuật';
  $('starTotal').hidden = false;
}

function renderIdentity() {
  $('whoIdentity').innerHTML = identityHTML({ displayName: student.displayName, cosmetics: cachedCosmetics(), size: 'sm' });
}

function updateStatusBar() {
  if (!current) return;
  if (limitsState === 'loading') { $('statusBarLine').textContent = 'Đang tải tiến độ...'; return; }
  if (limitsState === 'failed') { $('statusBarLine').textContent = 'Không tải được tiến độ — lượt làm lúc này không được tính sao.'; return; }
  const stat = statOf(current.problem);
  const avg = stat.scores.length ? Math.round(avgOfScores(stat.scores)) + '%' : '—';
  $('statusBarLine').textContent = 'Lượt: ' + stat.attempts + ' · Điểm phong độ: ' + avg + ' · ⭐ Đã nhận: ' + starsForStat(stat);
}

function refreshAll() {
  problems.forEach(renderCard);
  renderStarTotal();
  updateStatusBar();
  setCheckEnabled();
}

function setCheckEnabled() {
  $('checkBtn').disabled = !current || current.locked || limitsState === 'loading';
  $('continueSameBtn').disabled = !current || !current.locked;
}

/* ---------- tiến độ (giới hạn luyện tập) ---------- */
function saveLimit(key, problem) {
  const name = student.displayName;
  if (!name || limitsState !== 'ready') return;
  const stat = limits[key];
  const data = { ...stat, label: problem ? statLabelOf(problem) : key };
  if (problem) data.problemId = problem.id;
  queueWrite('limit:' + key, async () => (await loadFirebase()).savePracticeLimit(name, key, data));
}

async function loadLimits() {
  if (!student.displayName) { limitsState = 'failed'; refreshAll(); return; }
  try {
    const docs = await (await loadFirebase()).loadPracticeLimits(student.displayName);
    for (const { id, data } of docs) {
      let stat = statFromDoc(data);
      const legacy = isLegacyDoc(data) && stat.attempts >= BASE_GOAL;
      if (legacy) stat = migrateLegacy(stat);
      limits[id] = stat;
      if (legacy) {
        limitsState = 'ready';
        saveLimit(id, problemFromPracticeKey(id) || getProblem(id));
      }
    }
    limitsState = 'ready';
  } catch (err) {
    console.error('Lỗi tải tiến độ luyện tập:', err);
    limitsState = 'failed';
    showToast('Không tải được tiến độ luyện tập — kiểm tra mạng rồi tải lại trang.', { error: true, duration: 5000 });
  }
  refreshAll();
}

/* ---------- phiên luyện tập ---------- */
function buildSummary() {
  const byQuestion = {}, byProblem = {};
  let sumEarned = 0, sumMax = 0, totalCorrect = 0;
  for (const item of sessionLog) {
    const ok = item.earned >= item.max - 1e-9;
    for (const [map, key] of [[byQuestion, statLabelOf(item.problem)], [byProblem, item.problem.id]]) {
      const e = (map[key] ||= { count: 0, correct: 0, totalEarned: 0, max: item.max });
      e.count++;
      e.totalEarned = Math.round((e.totalEarned + item.earned) * 100) / 100;
      if (ok) e.correct++;
    }
    sumEarned += item.earned;
    sumMax += item.max;
    if (ok) totalCorrect++;
  }
  const wrongDetails = sessionLog.filter((i) => i.earned < i.max - 1e-9).slice(-MAX_WRONG_DETAILS)
    .map((i) => ({ q: statLabelOf(i.problem), problemId: i.problem.id, text: i.text, earned: i.earned, max: i.max }));
  return {
    chapter: 'Chương ' + chapter.chapter,
    totalQuestions: sessionLog.length,
    totalCorrect,
    score: (sumMax > 0 ? Math.round((sumEarned / sumMax) * 100) : 0) + '%',
    byQuestion,
    byProblem,
    wrongDetails,
  };
}

function saveSession() {
  const name = student.displayName;
  if (!name || !sessionLog.length) return;
  const first = !sessionId;
  if (first) sessionId = 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const id = sessionId, summary = buildSummary();
  queueWrite('session', async () => (await loadFirebase()).savePracticeSession(name, id, summary, first));
}

/* ---------- câu hỏi ---------- */
function newQuestion(problem) {
  const prev = current && current.problem === problem ? JSON.stringify(current.params) : null;
  let params;
  for (let i = 0; i < 5; i++) {
    params = problem.generate({ rng: createRng(randomSeed()), difficulty: problem.difficulties[0] });
    if (JSON.stringify(params) !== prev) break;
  }
  const body = $('qBody');
  current = { problem, params, view: mountQuestion(body, problem, params, 'p'), locked: false };
  $('summaryNote').textContent = '';
  if (window.clearScratchpad) window.clearScratchpad();
  updateStatusBar();
  setCheckEnabled();
  body.querySelector('input.blank, select')?.focus({ preventScroll: true });
}

function selectProblem(problem) {
  $('pickerGrid').querySelectorAll('.picker-btn').forEach((b) => b.classList.toggle('active', b.dataset.id === problem.id));
  $('workPlaceholder').hidden = true;
  $('sheet').hidden = false;
  $('actionsWrap').hidden = false;
  $('questionTitle').textContent = sheetTitle(problem);
  history.replaceState(null, '', 'practice.html?chapter=' + chapter.chapter + '&problem=' + encodeURIComponent(problem.id));
  newQuestion(problem);
}

function showStarModal(message) {
  $('starModalText').textContent = message;
  $('starModalOverlay').classList.add('show');
}

function announce(event, problem) {
  const name = cardName(problem);
  if (event.type === 'reward') {
    playSound('celebrate');
    celebrate();
  }
  if (event.milestone === 10) {
    showStarModal('🎉 Xuất sắc! Bé đã hoàn thành 10 lượt luyện tập "' + name + '" và nhận được +' + event.stars + ' ⭐!');
  } else {
    showStarModal('🏆 Bậc thầy kiên trì! Bé vừa hoàn thành 20 lượt luyện tập "' + name + '" và nhận thêm +' + event.stars + ' ⭐!');
  }
}

function checkAnswer() {
  if (!current || current.locked || limitsState === 'loading') return;
  const { problem, params, view } = current;
  current.locked = true;
  const result = problem.grade(params, view.collect());
  const earned = totalEarned(result), max = totalMax(result);
  view.showResult(result);
  view.setDisabled(true);
  view.showExplanation(problem.explain(params));
  sessionLog.push({ problem, earned, max, text: problem.describe ? problem.describe(params) : problem.title });

  const pct = max > 0 ? (earned / max) * 100 : 0;
  let rewarded = false;
  let note = 'Đúng ' + Math.round(pct) + '% (' + fmtPoints(earned) + '/' + fmtPoints(max) + ' điểm) cho câu này';
  if (limitsState === 'ready') {
    const key = storageKeyOf(problem);
    const correctParts = correctCount(result);
    const { stat, event } = recordAttempt(statOf(problem), pct, correctParts);
    limits[key] = stat;
    note += ' — lượt ' + stat.attempts + (correctParts ? ' · +' + correctParts + ' ⭐' : '') + '.';
    saveLimit(key, problem);
    if (event) announce(event, problem);
    rewardStars({ source: $('checkBtn'), target: $('starTotal'), amount: correctParts + (event?.stars || 0) });
    rewarded = event?.type === 'reward';
  } else {
    note += '.';
  }
  feedback(pct, rewarded);
  $('summaryNote').textContent = note;
  saveSession();
  refreshAll();
}

/* Âm thanh + pháo giấy theo kết quả; chuỗi đúng liên tiếp được chúc mừng to hơn.
   rewarded: lượt này vừa chạm mốc sao — announce() đã chúc mừng rồi nên chỉ đếm chuỗi. */
function feedback(pct, rewarded) {
  const correct = pct >= 100 - 1e-9;
  streak = correct ? streak + 1 : 0;
  if (rewarded) return;
  if (!correct) {
    playSound(pct > 0 ? 'partial' : 'wrong');
  } else if (streak % STREAK_STEP === 0) {
    playSound('celebrate');
    celebrate();
    showToast('🔥 ' + streak + ' câu đúng liên tiếp — giỏi quá!', { duration: 4000 });
  } else {
    playSound('correct');
    burstFrom($('checkBtn'));
  }
}

function resetProblem() {
  if (!current) return;
  const { problem } = current;
  if (!confirm('Xóa lịch sử luyện tập của "' + cardName(problem) + '" và làm lại từ đầu (10 lượt mới)? Sao đã nhận sẽ được giữ nguyên.')) return;
  if (limitsState === 'ready') {
    const key = storageKeyOf(problem);
    limits[key] = resetStat(statOf(problem));
    saveLimit(key, problem);
  }
  refreshAll();
  newQuestion(problem);
}

/* ---------- danh sách dạng bài thu gọn được ---------- */
const TOC_KEY = 'moyumath_toc';                                            // 'open' | 'closed' (chỉ nhớ trên màn rộng)
const tocSmall = matchMedia('(max-width: 1100px)');                        // mặc định thu gọn
const tocOverlay = matchMedia('(min-width: 769px) and (max-width: 1100px)'); // mở ra thì nổi đè lên tờ đề
const tocCrowded = matchMedia('(min-width: 1101px) and (max-width: 1439px)'); // chật khi mở cả bảng nháp

function setTocOpen(open, remember) {
  $('prGrid').classList.toggle('toc-open', open);
  $('tocToggle').setAttribute('aria-expanded', String(open));
  $('tocToggle').title = open ? 'Thu gọn danh sách dạng bài' : 'Mở danh sách dạng bài';
  if (remember && !tocSmall.matches) local.set(TOC_KEY, open ? 'open' : 'closed');
}

function initToc() {
  // chưa chọn dạng bài nào thì luôn mở để bé chọn
  setTocOpen(!wanted || (!tocSmall.matches && local.get(TOC_KEY) !== 'closed'));
  requestAnimationFrame(() => $('prGrid').classList.add('toc-anim')); // không chạy hiệu ứng ở lần dựng đầu
  $('tocToggle').addEventListener('click', () => setTocOpen(!$('prGrid').classList.contains('toc-open'), true));
  // màn nhỏ: chọn xong một dạng thì thu lại; danh sách đang nổi đè thì bấm ra ngoài hoặc Esc cũng thu lại
  $('pickerGrid').addEventListener('click', (e) => { if (tocSmall.matches && e.target.closest('.picker-btn')) setTocOpen(false); });
  const closeOverlay = (e) => {
    if (!tocOverlay.matches || !$('prGrid').classList.contains('toc-open')) return;
    if (e.type === 'keydown' ? e.key === 'Escape' : !e.target.closest('.col-picker')) setTocOpen(false);
  };
  document.addEventListener('pointerdown', closeOverlay);
  document.addEventListener('keydown', closeOverlay);
}

/* ---------- khởi động ---------- */
function renderHeader() {
  document.title = 'Luyện tập Chương ' + chapter.chapter + ' — Toán 7';
  $('pageTitle').textContent = 'Luyện tập ' + chapter.title;
  $('whoami').textContent = student.displayName;
  renderIdentity();
  $('chapterSwitch').innerHTML = allChapters().map((c) =>
    '<a href="practice.html?chapter=' + c.chapter + '"' + (c === chapter ? ' class="current"' : '') + '>Chương ' + c.chapter + '</a>').join('');
}

async function init() {
  renderHeader();
  initToc();
  presets = await fetch('config/presets.json', { cache: 'no-cache' }).then((r) => r.json()).catch(() => ({}));
  renderPicker();
  refreshAll();

  $('pickerGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('.picker-btn');
    if (btn) selectProblem(getProblem(btn.dataset.id));
  });
  $('checkBtn').addEventListener('click', checkAnswer);
  $('continueSameBtn').addEventListener('click', () => current && newQuestion(current.problem));
  $('resetBtn').addEventListener('click', resetProblem);
  $('qBody').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input.blank')) { e.preventDefault(); checkAnswer(); }
  });
  $('starModalCloseBtn').addEventListener('click', () => $('starModalOverlay').classList.remove('show'));
  $('starModalOverlay').addEventListener('click', (e) => { if (e.target === e.currentTarget) e.currentTarget.classList.remove('show'); });
  $('logoutLink').addEventListener('click', (e) => { e.preventDefault(); logout(); });
  // màn 1101–1439px: mở bảng nháp thì thu gọn danh sách dạng bài để tờ đề không bị ép hẹp
  $('sheet').addEventListener('scratchpad:toggle', (e) => { if (e.detail.open && tocCrowded.matches) setTocOpen(false); });
  if (window.Scratchpad) window.Scratchpad.init($('sheet'));
  bindClickSounds();
  studyTimer = startStudyTimer({ mode: 'practice', studentName: student.displayName, onStars: renderStarTotal });
  syncCosmetics(student.displayName).then((inv) => {
    shopInv = inv;
    renderIdentity();
    renderStarTotal();
  });

  if (wanted && wanted.chapter === chapter.chapter && wanted.practice !== false) selectProblem(wanted);
  loadLimits();
}

init();
