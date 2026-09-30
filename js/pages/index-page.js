/* Trang cá nhân (index.html): thẻ chương/đề (từ curriculum + config/presets.json), thống kê,
   hồ sơ năng lực dạng radar theo chủ đề của từng chương, lịch sử kiểm tra, gợi ý ôn tập.
   Thống kê gộp theo id dạng bài qua js/runner/stats.js (đọc được cả doc cũ lẫn mới). */
import { currentStudent, logout } from '../core/auth.js';
import { escapeHtml } from '../core/escape.js';
import { allChapters, getChapter } from '../runner/registry.js';
import { aggregate, topicScores, classify, problemLabel, practiceHref } from '../runner/stats.js';

const $ = (id) => document.getElementById(id);
const SVG_NS = 'http://www.w3.org/2000/svg';
const RADAR = { cx: 200, cy: 195, r: 110 };

let practiceByProblem = {};

/* ---------- thẻ chương & đề ---------- */
function renderChapterCards(presets, reviews = {}) {
  const listed = Object.entries(presets).filter(([, p]) => !p.hidden);
  const link = ([id, p], i) => '<a class="' + (i === 0 ? 'primary' : 'secondary') + '" href="exam.html?preset=' + encodeURIComponent(id) + '">' +
    escapeHtml((p.icon || '📝') + ' ' + p.examType) + '</a>';
  const cards = allChapters().map((ch) => {
    const exams = listed.filter(([, p]) => p.chapter === ch.chapter);
    return '<div class="chapter-card"><div class="chap-head"><h3>' + escapeHtml(ch.title) + '</h3></div>' +
      '<div class="chapter-actions">' + exams.map(link).join('') +
      '<a class="secondary" href="practice.html?chapter=' + ch.chapter + '">✏️ Luyện tập Chương ' + ch.chapter + '</a></div></div>';
  });
  /* Đề cương ôn tập (config/reviews.json) đứng đầu, kèm đề thi thử của nó. */
  const reviewCards = Object.entries(reviews).filter(([, r]) => !r.hidden).map(([id, r]) => {
    const exam = listed.find(([pid]) => pid === r.exam);
    return '<div class="chapter-card"><div class="chap-head"><h3>' + escapeHtml(r.title) + '</h3></div>' +
      '<div class="chapter-actions"><a class="primary" href="review.html?id=' + encodeURIComponent(id) + '">📚 Đề cương ôn tập</a>' +
      (exam ? link(exam, 1) : '') + '</div></div>';
  });
  cards.unshift(...reviewCards);
  const inReview = new Set(Object.values(reviews).map((r) => r.exam));
  const mixed = listed.filter(([id, p]) => p.chapter === undefined && !inReview.has(id));
  if (mixed.length) {
    cards.push('<div class="chapter-card"><div class="chap-head"><h3>Đề tổng hợp</h3></div><div class="chapter-actions">' +
      mixed.map(link).join('') + '</div></div>');
  }
  $('chapterCards').innerHTML = cards.join('');
}

/* ---------- radar: N trục = N chủ đề của chương ---------- */
function el(tag, attrs, text) {
  const e = document.createElementNS(SVG_NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (text !== undefined) e.textContent = text;
  return e;
}

function axisPoint(i, n, ratio) {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
  return { x: RADAR.cx + Math.cos(a) * RADAR.r * ratio, y: RADAR.cy + Math.sin(a) * RADAR.r * ratio, cos: Math.cos(a), sin: Math.sin(a) };
}

function renderRadar(chapterNo) {
  const chapter = getChapter(chapterNo);
  const scores = topicScores(chapter, practiceByProblem);
  const n = scores.length;
  const svg = $('radarSvg');
  svg.replaceChildren();
  /* Dưới 3 chủ đề thì radar suy biến thành đoạn thẳng / một điểm — chỉ hiện danh sách phần trăm. */
  svg.style.display = n < 3 ? 'none' : '';
  const poly = (ratio) => Array.from({ length: n }, (_, i) => { const p = axisPoint(i, n, ratio); return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' ');

  for (const level of [2, 4, 6, 8, 10]) {
    svg.append(el('polygon', { points: poly(level / 10), fill: 'none', stroke: 'var(--rule)', 'stroke-width': level === 10 ? 1.5 : 1 }));
    svg.append(el('text', { class: 'radar-tick-label', x: RADAR.cx + 6, y: (RADAR.cy - (RADAR.r * level) / 10 + 3).toFixed(1) }, String(level)));
  }
  scores.forEach((s, i) => {
    const end = axisPoint(i, n, 1);
    svg.append(el('line', { x1: RADAR.cx, y1: RADAR.cy, x2: end.x.toFixed(1), y2: end.y.toFixed(1), stroke: 'var(--rule)', 'stroke-width': 1 }));
    const lp = axisPoint(i, n, 1.28);
    const anchor = lp.cos > 0.2 ? 'start' : lp.cos < -0.2 ? 'end' : 'middle';
    const label = el('text', { class: 'radar-axis-label', x: lp.x.toFixed(1), y: (lp.y + (lp.sin > 0.5 ? 10 : 4)).toFixed(1), 'text-anchor': anchor });
    label.append(el('title', {}, s.topic.full), document.createTextNode(s.topic.short));
    svg.append(label);
  });

  const pts = scores.map((s, i) => axisPoint(i, n, s.pct === null ? 0 : s.pct / 100));
  svg.append(el('polygon', { class: 'radar-fill', points: pts.map((p) => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ') }));
  pts.forEach((p, i) => {
    const dot = el('circle', { class: 'radar-dot', cx: p.x.toFixed(1), cy: p.y.toFixed(1), r: 4 });
    dot.append(el('title', {}, scores[i].topic.full + ': ' + (scores[i].pct === null ? '—' : Math.round(scores[i].pct) + '%')));
    svg.append(dot);
  });

  $('radarList').innerHTML = scores.map((s) =>
    '<li><span>' + escapeHtml(s.topic.short) + '</span><span class="radar-list-value">' + (s.pct === null ? '—' : Math.round(s.pct) + '%') + '</span></li>').join('');
  const hasData = scores.some((s) => s.pct !== null);
  $('masteryEmpty').hidden = hasData;
  $('masteryEmpty').textContent = 'Luyện tập vài câu Chương ' + chapter.chapter + ' để xem hồ sơ năng lực của bạn.';
}

/* ---------- lịch sử, thống kê, gợi ý ---------- */
function formatTime(ts) {
  return ts && ts.toDate ? ts.toDate().toLocaleString('vi-VN') : '';
}

function renderHistory(exams) {
  if (!exams.length) { $('examHistory').innerHTML = '<p class="empty-note">Chưa làm bài kiểm tra nào.</p>'; return; }
  $('examHistory').innerHTML = '<table class="mini-table"><thead><tr><th>Thời gian</th><th>Loại</th><th>Điểm</th></tr></thead><tbody>' +
    exams.slice(0, 10).map((s) => '<tr><td>' + formatTime(s.createdAt) + '</td><td>' +
      escapeHtml((s.examType || 'Kiểm tra 15 phút') + ' — ' + (s.chapter || 'Chương 1')) + '</td><td class="score">' +
      escapeHtml(s.score || '') + '</td></tr>').join('') + '</tbody></table>';
}

function renderSuggestions(all) {
  const c = classify(all, (p) => p.practice !== false);
  const btn = (item, cls) => '<a class="suggest-btn ' + cls + '" href="' + practiceHref(item.problem) + '">' +
    escapeHtml(problemLabel(item.problem)) + ' (' + Math.round(item.pct) + '%) →</a>';
  const group = (items, cls, titleCls, title) => items.length
    ? '<div class="comment-group"><div class="comment-group-title ' + titleCls + '">' + title + '</div><div class="suggest-btns">' +
      items.map((i) => btn(i, cls)).join('') + '</div></div>' : '';
  const html = group(c.weak, 'weak', 'bad', '⚠ Cần ôn lại — bấm để luyện ngay') + group(c.mid, 'mid', 'mid', 'Ở mức khá') +
    group(c.strong, 'strong', 'good', 'Điểm mạnh');
  if (html) $('commentBox').innerHTML = html;
  else $('commentBox').textContent = 'Chưa có đủ dữ liệu (bài kiểm tra hoặc luyện tập) để nhận xét.';
}

async function loadData(name) {
  try {
    const { loadStudentHistory } = await import('../core/firebase.js');
    const { exams, practice } = await loadStudentHistory(name);
    exams.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    $('statExamCount').textContent = exams.length;
    $('statPracticeCount').textContent = practice.reduce((s, d) => s + (d.totalQuestions || 0), 0);
    const agg = aggregate(exams, practice);
    practiceByProblem = agg.practice;
    let earned = 0, max = 0;
    for (const e of Object.values(agg.all)) { earned += e.earned; max += e.max; }
    $('statMastery').textContent = max > 0 ? Math.round((earned / max) * 100) + '%' : '—';
    renderRadar(Number($('masteryChapterSelect').value));
    renderHistory(exams);
    renderSuggestions(agg.all);
  } catch (err) {
    console.error(err);
    $('examHistory').innerHTML = '<p class="empty-note">Lỗi tải dữ liệu: ' + escapeHtml(err.message) + '</p>';
    $('commentBox').textContent = 'Lỗi tải dữ liệu.';
  }
}

async function init() {
  const student = currentStudent();
  $('pfName').textContent = student.displayName || '—';
  $('pfClass').textContent = student.className || '—';
  $('logoutLink').addEventListener('click', (e) => { e.preventDefault(); logout(); });

  $('masteryChapterSelect').innerHTML = allChapters().map((c) => '<option value="' + c.chapter + '">Chương ' + c.chapter + '</option>').join('');
  $('masteryChapterSelect').addEventListener('change', (e) => renderRadar(Number(e.target.value)));
  renderRadar(1);

  const [presets, reviews] = await Promise.all(['config/presets.json', 'config/reviews.json'].map((u) =>
    fetch(u, { cache: 'no-cache' }).then((r) => r.json()).catch(() => ({}))));
  renderChapterCards(presets, reviews);

  if (!student.displayName) {
    $('examHistory').innerHTML = '<p class="empty-note">Không xác định được học sinh.</p>';
    $('commentBox').textContent = 'Không xác định được học sinh.';
    $('masteryEmpty').textContent = 'Không xác định được học sinh.';
    return;
  }
  loadData(student.displayName);
}

init();
