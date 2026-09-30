/* Lập công thức biểu diễn x theo y (nối) (Câu 6 — Kiểm tra 15 phút Chương 2). */
import { makePairs, renderMatching, gradeMatching, solveMatching, pairsInLeftOrder } from './_matching-shared.js';

const LEFT_MARKERS = ['1)', '2)', '3)', '4)'];
const RIGHT_MARKERS = ['A', 'B', 'C', 'D'];
const WHY = [
  'x đang được cộng thêm → chuyển vế, phép cộng đổi thành phép <b>trừ</b>',
  'x đang được nhân với p → chia cả hai vế cho p',
  'x đang bị trừ đi → chuyển vế, phép trừ đổi thành phép <b>cộng</b>',
  'x đang bị chia cho q → nhân cả hai vế với q',
];

export default {
  id: 'ch2.formula-transform',
  chapter: 2,
  topic: '2.2',
  title: 'Lập công thức',
  points: 2,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 2, label: 'Lập công thức' }, { chapter: 2, label: 'Câu 6' }], practiceKey: 'ch2_4' },

  generate({ rng }) {
    const A = rng.int(5, 15), B = rng.int(5, 15);
    return makePairs(rng, [
      { left: 'y = x + ' + A, right: 'x = y − ' + A },
      { left: 'y = px', right: 'x = y : p' },
      { left: 'y = x − ' + B, right: 'x = y + ' + B },
      { left: 'y = x : q', right: 'x = yq' },
    ]);
  },

  render(p, ui) {
    return '<p class="q-prompt">Lập công thức biểu diễn chữ x (nối thông tin ở Cột A với Cột B):</p>' +
      renderMatching(p, ui, { leftMarkers: LEFT_MARKERS, rightMarkers: RIGHT_MARKERS.map((r) => r + '.') });
  },

  grade(p, ans) {
    return { parts: gradeMatching(p, ans, { rightMarkers: RIGHT_MARKERS, pointsEach: 0.5 }) };
  },

  solve: solveMatching,

  explain(p) {
    return '<p><b>Lập công thức — biểu diễn x theo y:</b></p>' +
      pairsInLeftOrder(p).map(({ left, right }, i) =>
        '<p>' + (i + 1) + ') <b>' + left.text + '</b></p>' +
        '<p>&nbsp;&nbsp;' + WHY[left.key] + '</p>' +
        '<p>&nbsp;&nbsp;⟹ nối với <b>' + right.text + '</b></p>').join('') +
      '<p><i>Quy tắc chung: khi chuyển vế, phép cộng đổi thành phép trừ (và ngược lại), phép nhân đổi thành phép chia (và ngược lại).</i></p>';
  },
};
