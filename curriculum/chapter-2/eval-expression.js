/* Tính giá trị biểu thức đại số (Câu 1 — Kiểm tra 15 phút Chương 2). */
import { minus } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const ansA = (p) => p.a1 * p.A - p.b1 * p.B;
const ansB = (p) => p.c * p.X * p.X + p.d * p.X;

export default {
  id: 'ch2.eval-expression',
  chapter: 2,
  topic: '2.2',
  title: 'Tính giá trị biểu thức',
  points: 2,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 2, label: 'Tính giá trị biểu thức' }, { chapter: 2, label: 'Câu 1' }], practiceKey: 'ch2_3' },

  generate({ rng }) {
    return {
      a1: rng.int(2, 7), b1: rng.int(2, 5), A: rng.int(2, 5), B: rng.int(2, 5),
      c: rng.int(2, 5), d: rng.int(2, 5), X: rng.int(2, 5),
    };
  },

  render(p, ui) {
    return '<div class="sub"><span class="sub-label">a.</span> ' + p.a1 + 'a − ' + p.b1 + 'b khi a = ' + p.A + '; b = ' + p.B +
        '<br>' + ui.blank('a', { width: 80 }) + ui.feedback('a') + '</div>' +
      '<div class="sub"><span class="sub-label">b.</span> ' + p.c + 'x² + ' + p.d + 'x khi x = ' + p.X +
        '<br>' + ui.blank('b', { width: 80 }) + ui.feedback('b') + '</div>';
  },

  grade(p, ans) {
    return {
      parts: [
        part('a', sameNumber(num(ans.a), ansA(p)), 1, minus(ansA(p))),
        part('b', sameNumber(num(ans.b), ansB(p)), 1, String(ansB(p))),
      ],
    };
  },

  solve(p) {
    return { a: String(ansA(p)), b: String(ansB(p)) };
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return p.a1 + 'a − ' + p.b1 + 'b (a = ' + p.A + ', b = ' + p.B + ') ; ' + p.c + 'x² + ' + p.d + 'x (x = ' + p.X + ')';
  },

  explain(p) {
    return '<p><b>a) Tính ' + p.a1 + 'a − ' + p.b1 + 'b khi a = ' + p.A + ', b = ' + p.B + ':</b></p>' +
      '<p>&nbsp;&nbsp;Bước 1 — Thay số: ' + p.a1 + '·' + p.A + ' − ' + p.b1 + '·' + p.B + '</p>' +
      '<p>&nbsp;&nbsp;Bước 2 — Nhân: ' + p.a1 * p.A + ' − ' + p.b1 * p.B + '</p>' +
      '<p>&nbsp;&nbsp;Bước 3 — Trừ: = <b>' + minus(ansA(p)) + '</b></p>' +
      '<p><b>b) Tính ' + p.c + 'x² + ' + p.d + 'x khi x = ' + p.X + ':</b></p>' +
      '<p>&nbsp;&nbsp;Bước 1 — Thay số: ' + p.c + '·' + p.X + '² + ' + p.d + '·' + p.X + '</p>' +
      '<p>&nbsp;&nbsp;Bước 2 — Tính lũy thừa: ' + p.X + '² = ' + p.X * p.X + '</p>' +
      '<p>&nbsp;&nbsp;Bước 3 — Nhân: ' + p.c + '·' + p.X * p.X + ' + ' + p.d + '·' + p.X + ' = ' + p.c * p.X * p.X + ' + ' + p.d * p.X + '</p>' +
      '<p>&nbsp;&nbsp;Bước 4 — Cộng: = <b>' + ansB(p) + '</b></p>';
  },
};
