/* Trang ôn tập (review.html?id=<id>, xem config/reviews.json): liệt kê từng câu của đề cương,
   mỗi câu trỏ tới các dạng luyện tập tương ứng (kèm số lượt đã làm) và nút làm đề thi thử.
   Chỉ đọc Firestore (số lượt luyện tập); không tải được thì trang vẫn dùng bình thường. */
import { currentStudent } from '../core/auth.js';
import { escapeHtml, escapeAttr } from '../core/escape.js';
import { getChapter, getProblem, practiceNumber, storageKeyOf } from '../runner/registry.js';
import { statFromDoc, BASE_GOAL } from '../runner/stars.js';

const $ = (id) => document.getElementById(id);

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

  /* Gom các câu theo chương của dạng bài đầu tiên, giữ thứ tự chương. */
  const groups = new Map();
  for (const item of review.items) {
    const problems = item.problems.map(getProblem).filter((p) => p && p.practice !== false);
    if (!problems.length) continue;
    const ch = problems[0].chapter;
    if (!groups.has(ch)) groups.set(ch, []);
    groups.get(ch).push({ item, problems });
  }
  $('reviewGroups').innerHTML = [...groups.keys()].sort((a, b) => a - b).map((ch) =>
    '<section class="review-group"><h3>' + escapeHtml(getChapter(ch).title) + '</h3>' +
      groups.get(ch).map(({ item, problems }) =>
        '<div class="review-item"><div class="review-item-head"><span class="review-label">' + escapeHtml(item.label) + '</span>' +
          '<span>' + escapeHtml(item.text) + '</span></div>' +
          '<div class="review-links">' + problems.map(problemLink).join('') + '</div></div>').join('') +
    '</section>').join('');
}

async function showAttempts() {
  const name = currentStudent().displayName;
  if (!name) return;
  try {
    const { loadPracticeLimits } = await import('../core/firebase.js');
    const attempts = {};
    for (const { id, data } of await loadPracticeLimits(name)) attempts[id] = statFromDoc(data).attempts;
    document.querySelectorAll('.review-problem').forEach((a) => {
      const n = attempts[a.dataset.key] || 0;
      const span = a.querySelector('.review-attempts');
      span.textContent = n + '/' + BASE_GOAL + ' lượt';
      span.classList.toggle('done', n >= BASE_GOAL);
    });
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
