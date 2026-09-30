/* Thu gọn đa thức một biến và tìm bậc (chỉ luyện tập).
   Sửa so với bản cũ: điểm tối đa = 1 (bản cũ khai báo 1,5 nhưng chỉ chấm được 1 → luyện tập
   không bao giờ quá 67%); hệ số x² luôn khác 0; chấp nhận "x^3", thứ tự hạng tử tuỳ ý. */
import { formatPoly } from '../../js/core/mathfmt.js';
import { num, polynomialMatches } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const terms = (p) => [[p.a + p.d, 3], [p.b - p.e, 2], [-p.c, 1], [p.f, 0]];

export default {
  id: 'ch2.poly-simplify',
  chapter: 2,
  topic: '2.3',
  title: 'Đa thức một biến',
  points: 1,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 2, label: 'Đa thức một biến' }], practiceKey: 'ch2_5' },

  generate({ rng }) {
    const b = rng.int(2, 6);
    return { a: rng.int(2, 5), b, c: rng.int(2, 7), d: rng.int(2, 5), e: rng.intExcept(2, 6, [b]), f: rng.int(2, 9) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Cho đa thức P(x) = ' + p.a + 'x³ + ' + p.b + 'x² − ' + p.c + 'x + ' + p.d + 'x³ − ' + p.e + 'x² + ' + p.f + '</p>' +
      '<div class="sub"><span class="sub-label">a.</span> Thu gọn đa thức P(x): P(x) = ' +
        ui.blank('a', { width: 180 }) + ui.feedback('a') + '</div>' +
      '<div class="sub"><span class="sub-label">b.</span> Bậc của đa thức là: ' +
        ui.blank('b', { width: 40 }) + ui.feedback('b') + '</div>';
  },

  grade(p, ans) {
    return {
      parts: [
        part('a', polynomialMatches(ans.a, terms(p)), 0.5, formatPoly(terms(p))),
        part('b', num(ans.b) === 3, 0.5, '3'),
      ],
    };
  },

  solve(p) {
    return { a: formatPoly(terms(p), { ascii: true }), b: '3' };
  },

  explain(p) {
    const t = terms(p);
    return '<p><b>Thu gọn đa thức bằng cách gộp các hạng tử đồng dạng:</b></p>' +
      '<p>Đa thức: ' + p.a + 'x³ + ' + p.b + 'x² − ' + p.c + 'x + ' + p.d + 'x³ − ' + p.e + 'x² + ' + p.f + '</p>' +
      '<p><b>Bước 1 — Nhóm hạng tử đồng dạng:</b></p>' +
      '<p>&nbsp;&nbsp;x³: ' + p.a + 'x³ + ' + p.d + 'x³ = (' + p.a + ' + ' + p.d + ')x³ = <b>' + formatPoly([t[0]]) + '</b></p>' +
      '<p>&nbsp;&nbsp;x²: ' + p.b + 'x² − ' + p.e + 'x² = (' + p.b + ' − ' + p.e + ')x² = <b>' + formatPoly([t[1]]) + '</b></p>' +
      '<p>&nbsp;&nbsp;x: −' + p.c + 'x (không có hạng tử đồng dạng)</p>' +
      '<p>&nbsp;&nbsp;Hệ số tự do: ' + p.f + '</p>' +
      '<p><b>Bước 2 — Viết đa thức thu gọn:</b> ' + formatPoly(t) + '</p>' +
      '<p><b>Bậc</b> của đa thức = 3 (bậc cao nhất có hệ số ≠ 0).</p>';
  },
};
