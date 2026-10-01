/* Trang cá nhân (index.html): thẻ chương/đề (từ curriculum + config/presets.json), thống kê,
   hồ sơ năng lực dạng radar theo chủ đề của từng chương, lịch sử kiểm tra, gợi ý ôn tập.
   Thống kê gộp theo id dạng bài qua js/runner/stats.js (đọc được cả doc cũ lẫn mới). */
import { currentStudent, logout } from '../core/auth.js';
import { escapeHtml } from '../core/escape.js';
import { allChapters, getChapter } from '../runner/registry.js';
import { aggregate, topicScores, chapterScores, classify, problemLabel, practiceHref } from '../runner/stats.js';
import {
  DAILY_GOALS, dayKey, daySeconds, goalsFromDoc, studyStars, streakDays, formatMinutes,
} from '../runner/study-time.js';
import { mergeLocalToday } from '../ui/study-timer.js';
import { loadWallet, storeCosmetics, cachedCosmetics, avatarHTML, titleHTML } from '../ui/cosmetics.js';
import { CARDS } from '../runner/shop.js';

const $ = (id) => document.getElementById(id);
const SVG_NS = 'http://www.w3.org/2000/svg';
const RADAR = { cx: 200, cy: 195, r: 110 };

let practiceByProblem = {};

/* ---------- thẻ chương & đề ---------- */
function renderChapterCards(presets, reviews = {}) {
  const listed = Object.entries(presets).filter(([, p]) => !p.hidden);
  const link = ([id, p], i) => '<a class="' + (i === 0 ? 'primary' : 'secondary') + '" href="exam.html?preset=' + encodeURIComponent(id) + '">' +
    escapeHtml((p.icon || '📝') + ' ' + p.examType) + '</a>';
  /* Thẻ có ô số chương bên trái; tông màu xoay vòng theo --tone (css trong index.html). */
  const card = (tone, badge, kicker, title, actions) => '<div class="chapter-card" data-tone="' + tone + '">' +
    '<div class="chap-num" aria-hidden="true">' + badge + '</div><div class="chap-main">' +
    (kicker ? '<div class="chap-kicker">' + escapeHtml(kicker) + '</div>' : '') + '<h3>' + escapeHtml(title) + '</h3>' +
    '<div class="chapter-actions">' + actions + '</div></div></div>';
  const cards = allChapters().map((ch, i) => {
    const exams = listed.filter(([, p]) => p.chapter === ch.chapter);
    const [kicker, name] = ch.title.includes(' — ') ? ch.title.split(' — ') : ['', ch.title];
    return card(i % 4, ch.chapter, kicker, name,
      '<a class="primary" href="practice.html?chapter=' + ch.chapter + '">✏️ Luyện tập</a>' + exams.map((e) => link(e, 1)).join(''));
  });
  /* Đề cương ôn tập (config/reviews.json) kèm đề thi thử của nó: khối riêng phía trên các chương. */
  const reviewCards = Object.entries(reviews).filter(([, r]) => !r.hidden).map(([id, r]) => {
    const exam = listed.find(([pid]) => pid === r.exam);
    return card('exam', '🎯', 'Ôn thi', r.title,
      '<a class="primary" href="review.html?id=' + encodeURIComponent(id) + '">📚 Đề cương ôn tập</a>' + (exam ? link(exam, 1) : ''));
  });
  $('reviewCards').innerHTML = reviewCards.join('');
  $('reviewSection').hidden = !reviewCards.length;
  const inReview = new Set(Object.values(reviews).map((r) => r.exam));
  const mixed = listed.filter(([id, p]) => p.chapter === undefined && !inReview.has(id));
  if (mixed.length) {
    cards.push(card('mix', '🏆', 'Nhiều chương', 'Đề tổng hợp', mixed.map(link).join('')));
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

/* chapterNo = 0: radar tổng hợp, mỗi trục là một chương. */
function renderRadar(chapterNo) {
  const chapter = chapterNo ? getChapter(chapterNo) : null;
  const scores = chapter ? topicScores(chapter, practiceByProblem) : chapterScores(allChapters(), practiceByProblem);
  $('masterySub').textContent = 'Điểm trung bình luyện tập theo từng ' + (chapter ? 'chủ đề' : 'chương') + ' (thang 0–10)';
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
  $('masteryEmpty').textContent = 'Luyện tập vài câu' + (chapter ? ' Chương ' + chapter.chapter : '') + ' để xem hồ sơ năng lực của bạn.';
}

/* ---------- thời gian học: hôm nay so với các mốc, chuỗi ngày, 7 ngày gần nhất ---------- */
const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function renderStudy(days) {
  const today = new Date();
  const todayDoc = days[dayKey(today)];
  const sec = daySeconds(todayDoc);
  const goals = goalsFromDoc(todayDoc);
  const maxMin = DAILY_GOALS[DAILY_GOALS.length - 1].min;
  $('studyToday').textContent = formatMinutes(sec);
  $('studyFill').style.width = Math.min(100, (sec / 60 / maxMin) * 100) + '%';
  $('studyMarks').innerHTML = DAILY_GOALS.map((g) => {
    const done = !!goals[g.min];
    return '<span class="study-mark' + (done ? ' done' : '') + '" style="left:' + (g.min / maxMin) * 100 + '%">' +
      '<span class="study-mark-tick"></span><span class="study-mark-label">' + (done ? '✓ ' : '') + g.min + '′ +' + g.stars + '⭐</span></span>';
  }).join('');

  const streak = streakDays(days, today);
  $('studyStreak').textContent = streak ? '🔥 ' + streak + ' ngày liên tiếp' : '';
  $('studyStreak').hidden = !streak;
  $('studyNote').textContent = '⭐ ' + studyStars(days) + ' sao từ thời gian học · Chuỗi ngày tính khi học ≥ ' + DAILY_GOALS[0].min + ' phút/ngày.';

  /* 7 ngày gần nhất: một dãy cột, đường nét đứt = mốc đầu tiên; chỉ ghi số ở cột hôm nay. */
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6 + i);
    return { d, min: daySeconds(days[dayKey(d)]) / 60 };
  });
  const top = Math.max(maxMin, ...week.map((w) => w.min));
  $('studyWeek').style.setProperty('--goal-y', String(DAILY_GOALS[0].min / top));
  $('studyWeek').innerHTML = week.map((w, i) => {
    const isToday = i === 6;
    const tip = w.d.toLocaleDateString('vi-VN') + ': ' + formatMinutes(w.min * 60);
    return '<div class="study-col' + (isToday ? ' today' : '') + '" title="' + tip + '">' +
      '<span class="study-col-bar"><span class="study-col-fill" style="height:' + (w.min > 0 ? Math.max(3, (w.min / top) * 100) : 0) + '%">' +
        (isToday && w.min >= 1 ? '<em class="study-col-value">' + Math.floor(w.min) + '′</em>' : '') + '</span></span>' +
      '<span class="study-col-day">' + (isToday ? 'Nay' : WEEKDAYS[w.d.getDay()]) + '</span></div>';
  }).join('') + '<span class="study-goal-line"><span>' + DAILY_GOALS[0].min + '′</span></span>';
}

async function loadStudy(name) {
  try {
    const { loadStudyDays } = await import('../core/firebase.js');
    renderStudy(mergeLocalToday(await loadStudyDays(name), name));
  } catch (err) {
    console.error('Lỗi tải thời gian học:', err);
    renderStudy(mergeLocalToday({}, name));
  }
}

/* ---------- Tiệm Phép Thuật: avatar, danh hiệu, số sao còn lại ---------- */
function renderIdentity(name, c) {
  $('pfAvatar').innerHTML = avatarHTML(name, c, 'lg');
  $('pfTitle').innerHTML = titleHTML(c);
}

async function loadShopCard(name) {
  try {
    const { earned, inv, balance } = await loadWallet(name);
    renderIdentity(name, storeCosmetics(inv));
    $('shopBalance').textContent = '⭐ ' + balance;
    $('shopBalance').title = 'Đã nhận ' + earned + ' ⭐ · Đã tiêu ' + inv.spent + ' ⭐';
    $('shopNote').textContent = 'Đã nhận ' + earned + ' ⭐, đã tiêu ' + inv.spent + ' ⭐ · ' + inv.owned.length + ' vật phẩm · ' +
      Object.keys(inv.cards).length + '/' + CARDS.length + ' thẻ sưu tầm.';
  } catch (err) {
    console.error('Lỗi tải Tiệm Phép Thuật:', err);
    $('shopBalance').textContent = '⭐ —';
  }
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
  const hour = new Date().getHours();
  $('pfGreet').textContent = hour < 11 ? 'Chào buổi sáng' : hour < 14 ? 'Chào buổi trưa' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  $('pfClass').textContent = student.className || '—';
  renderIdentity(student.displayName, cachedCosmetics());
  $('logoutLink').addEventListener('click', (e) => { e.preventDefault(); logout(); });

  $('masteryChapterSelect').innerHTML = '<option value="0">Tất cả chương</option>' + allChapters().map((c) => '<option value="' + c.chapter + '">Chương ' + c.chapter + '</option>').join('');
  $('masteryChapterSelect').addEventListener('change', (e) => renderRadar(Number(e.target.value)));
  renderRadar(0);

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
  loadStudy(student.displayName);
  loadShopCard(student.displayName);
}

init();
