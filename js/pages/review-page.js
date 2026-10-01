/* Trang ôn tập (review.html?id=<id>, xem config/reviews.json): liệt kê từng câu của đề cương,
   mỗi câu trỏ tới các dạng luyện tập tương ứng (kèm số lượt đã làm) và nút làm đề thi thử.
   Chỉ đọc Firestore (số lượt luyện tập); không tải được thì trang vẫn dùng bình thường. */
import { currentStudent } from '../core/auth.js';
import { local } from '../core/storage.js';
import { escapeHtml, escapeAttr } from '../core/escape.js';
import { getChapter, getProblem, practiceNumber, storageKeyOf } from '../runner/registry.js';
import { statFromDoc, BASE_GOAL } from '../runner/stars.js';

const $ = (id) => document.getElementById(id);
const SORT_KEY = 'moyumath_review_sort';
let attempts = null;

const [reviews, presets] = await Promise.all([
  fetch('config/reviews.json', { cache: 'no-cache' }).then((r) => r.json()),
  fetch('config/presets.json', { cache: 'no-cache' }).then((r) => r.json()).catch(() => ({})),
]);
const reviewId = new URLSearchParams(location.search).get('id') || Object.keys(reviews)[0];
const review = reviews[reviewId];

function problemLink(problem) {
  return '<a class="review-problem" data-key="' + escapeAttr(storageKeyOf(problem)) + '" href="practice.html?chapter=' + problem.chapter +
    '&problem=' + encodeURIComponent(problem.id) + '">' +
    '<span class="review-problem-name">Chương ' + problem.chapter + ' · Dạng ' + practiceNumber(problem) + ' — ' +
      escapeHtml(problem.shortTitle || problem.title) + '</span><span class="review-attempts"></span></a>';
}

function render() {
  document.title = review.title + ' — Toán 7';
  $('reviewTitle').textContent = review.title;
  $('reviewSubtitle').textContent = review.subtitle || '';
  if (review.source) {
    $('sourceLink').innerHTML = '<a href="' + escapeAttr(encodeURI(review.source)) + '" target="_blank" rel="noopener">Xem đề cương gốc (PDF)</a>';
  }

  const exam = presets[review.exam];
  if (exam) {
    $('examCard').hidden = false;
    $('examNote').textContent = (exam.subtitle || '') + ' · ' + exam.items.length + ' câu, ' + exam.totalPoints + ' điểm.';
    $('examLink').href = 'exam.html?preset=' + encodeURIComponent(review.exam);
  }

  const sortSwitch = $('sortSwitch');
  sortSwitch.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-sort]');
    if (!btn) return;
    local.set(SORT_KEY, btn.dataset.sort);
    renderItems(btn.dataset.sort);
  });
  renderItems(local.get(SORT_KEY) === 'pdf' ? 'pdf' : 'topic');
}

const itemHtml = ({ item, problems }) =>
  '<div class="review-item"><div class="review-item-head"><span class="review-label">' + escapeHtml(item.label) + '</span>' +
    '<span>' + escapeHtml(item.text) + '</span></div>' +
    '<div class="review-links">' + problems.map(problemLink).join('') + '</div></div>';

/* sort = 'topic': gom theo chương của dạng bài đầu tiên, trong chương xếp theo thứ tự chủ đề (cùng chủ đề giữ
   thứ tự trong reviews.json); sort = 'pdf': một danh sách theo số câu trong đề cương gốc (Câu 1 → Câu 25). */
function renderItems(sort) {
  for (const btn of $('sortSwitch').querySelectorAll('button')) btn.setAttribute('aria-pressed', String(btn.dataset.sort === sort));
  const entries = review.items
    .map((item) => ({ item, problems: item.problems.map(getProblem).filter((p) => p && p.practice !== false) }))
    .filter((e) => e.problems.length);
  if (sort === 'pdf') {
    const no = (e) => Number(/\d+/.exec(e.item.label)?.[0] ?? Infinity);
    $('reviewGroups').innerHTML = '<section class="review-group">' + entries.sort((a, b) => no(a) - no(b)).map(itemHtml).join('') + '</section>';
  } else {
    const groups = new Map();
    for (const e of entries) {
      const ch = e.problems[0].chapter;
      if (!groups.has(ch)) groups.set(ch, []);
      groups.get(ch).push(e);
    }
    const topicRank = (p) => getChapter(p.chapter).topics.findIndex((t) => t.id === p.topic);
    for (const list of groups.values()) list.sort((a, b) => topicRank(a.problems[0]) - topicRank(b.problems[0]));
    $('reviewGroups').innerHTML = [...groups.keys()].sort((a, b) => a - b).map((ch) =>
      '<section class="review-group"><h3>' + escapeHtml(getChapter(ch).title) + '</h3>' + groups.get(ch).map(itemHtml).join('') + '</section>').join('');
  }
  paintAttempts();
}

/* Số lượt đã luyện của từng dạng (tải 1 lần, vẽ lại mỗi khi đổi cách sắp xếp). */
function paintAttempts() {
  if (!attempts) return;
  document.querySelectorAll('.review-problem').forEach((a) => {
    const n = attempts[a.dataset.key] || 0;
    const span = a.querySelector('.review-attempts');
    span.textContent = n + '/' + BASE_GOAL + ' lượt';
    span.classList.toggle('done', n >= BASE_GOAL);
  });
}

async function showAttempts() {
  const name = currentStudent().displayName;
  if (!name) return;
  try {
    const { loadPracticeLimits } = await import('../core/firebase.js');
    const map = {};
    for (const { id, data } of await loadPracticeLimits(name)) map[id] = statFromDoc(data).attempts;
    attempts = map;
    paintAttempts();
  } catch (err) {
    console.error('Không tải được số lượt luyện tập:', err);
  }
}

if (review) {
  render();
  showAttempts();
} else {
  $('reviewTitle').textContent = 'Không tìm thấy đề cương ôn tập';
}
