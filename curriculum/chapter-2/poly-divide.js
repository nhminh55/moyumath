/* Chia đa thức cho đơn thức (chỉ luyện tập).
   Sửa so với bản cũ: lời giải ghi "− bx²" trong khi đề là "+ bx²". */
import { formatPoly } from '../../js/core/mathfmt.js';
import { polynomialMatches } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const terms = (p) => [[p.a / p.k, 2], [p.b / p.k, 1], [p.c / p.k, 0]];

export default {
  id: 'ch2.poly-divide',
  chapter: 2,
  topic: '2.4',
  title: 'Chia đa thức',
  points: 1,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 2, label: 'Chia đa thức' }], practiceKey: 'ch2_7' },

  generate({ rng }) {
    const k = rng.int(2, 5);
    return { k, a: rng.int(2, 5) * k, b: rng.int(2, 6) * k, c: rng.int(2, 7) * k };
  },

  render(p, ui) {
    return '<div class="sub"><span class="sub-label">Thực hiện phép chia:</span> (' +
      p.a + 'x³ + ' + p.b + 'x² + ' + p.c + 'x) : ' + p.k + 'x = ' +
      ui.blank('r', { width: 180 }) + ui.feedback('r') + '</div>';
  },

  grade(p, ans) {
    return { parts: [part('r', polynomialMatches(ans.r, terms(p)), 1, formatPoly(terms(p)))] };
  },

  solve(p) {
    return { r: formatPoly(terms(p), { ascii: true }) };
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return '(' + p.a + 'x³ + ' + p.b + 'x² + ' + p.c + 'x) : ' + p.k + 'x';
  },

  explain(p) {
    const [x2, x1, x0] = terms(p).map((t) => t[0]);
    return '<p><b>Chia đa thức cho đơn thức — chia từng hạng tử:</b></p>' +
      '<p>(' + p.a + 'x³ + ' + p.b + 'x² + ' + p.c + 'x) : ' + p.k + 'x</p>' +
      '<p><b>Bước 1:</b> ' + p.a + 'x³ : ' + p.k + 'x = ' + x2 + 'x² &nbsp;(hệ số: ' + p.a + ' : ' + p.k + ' = ' + x2 + ', bậc: x³ : x = x²)</p>' +
      '<p><b>Bước 2:</b> ' + p.b + 'x² : ' + p.k + 'x = ' + x1 + 'x &nbsp;(hệ số: ' + p.b + ' : ' + p.k + ' = ' + x1 + ', bậc: x² : x = x)</p>' +
      '<p><b>Bước 3:</b> ' + p.c + 'x : ' + p.k + 'x = ' + x0 + ' &nbsp;(hệ số: ' + p.c + ' : ' + p.k + ' = ' + x0 + ', bậc: x : x = 1)</p>' +
      '<p>⟹ Kết quả: <b>' + formatPoly(terms(p)) + '</b></p>';
  },
};
