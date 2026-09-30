/* Tính a² + √b × (c − d) (Câu 4 — Kiểm tra 15 phút). */
import { sup, minus, signStr } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

function result(p) {
  return p.a * p.a + p.s * (p.c - p.d);
}

export default {
  id: 'ch1.eval-sqrt-expr',
  chapter: 1,
  topic: '1.3',
  title: 'Căn bậc hai, thứ tự thực hiện phép tính',
  points: 2,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 1, label: 'Câu 4' }], practiceKey: '4' },

  /* s = √b */
  generate({ rng }) {
    return { a: rng.int(2, 12), s: rng.pick([1, 2, 3, 4, 5, 6, 7, 8]), c: rng.int(1, 15), d: rng.int(1, 15) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Thực hiện phép tính:</p>' +
      '<p style="text-align:center; font-size:19px; color:var(--ink); margin:0 0 14px;">' +
        p.a + sup(2) + ' + √' + p.s * p.s + ' × (' + p.c + ' − ' + p.d + ')</p>' +
      '<div class="sub"><span class="sub-label">Kết quả =</span> ' + ui.blank('r', { width: 90 }) + ui.feedback('r') + '</div>';
  },

  grade(p, ans) {
    const r = result(p);
    const work = p.a + '² + √' + p.s * p.s + ' × (' + p.c + ' − ' + p.d + ') = ' +
      p.a * p.a + ' + ' + p.s + ' × ' + signStr(p.c - p.d) + ' = ' + minus(r);
    return { parts: [part('r', sameNumber(num(ans.r), r), 2, minus(r) + ' (' + work + ')')] };
  },

  solve(p) {
    return { r: String(result(p)) };
  },

  explain(p) {
    const diff = p.c - p.d, mul = p.s * diff, b = p.s * p.s;
    return '<p><b>Biểu thức:</b> ' + p.a + '² + √' + b + ' × (' + p.c + ' − ' + p.d + ')</p>' +
      '<p><b>Bước 1 — Tính lũy thừa:</b> ' + p.a + '² = ' + p.a + ' × ' + p.a + ' = ' + p.a * p.a + '</p>' +
      '<p><b>Bước 2 — Tính căn bậc hai:</b> √' + b + ' = ' + p.s + ' (vì ' + p.s + ' × ' + p.s + ' = ' + b + ')</p>' +
      '<p><b>Bước 3 — Tính trong ngoặc:</b> ' + p.c + ' − ' + p.d + ' = ' + minus(diff) + '</p>' +
      '<p><b>Bước 4 — Nhân:</b> ' + p.s + ' × ' + signStr(diff) + ' = ' + minus(mul) + '</p>' +
      '<p><b>Bước 5 — Cộng:</b> ' + p.a * p.a + ' + ' + signStr(mul) + ' = <b>' + minus(result(p)) + '</b></p>';
  },
};
