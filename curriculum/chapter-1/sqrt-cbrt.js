/* Căn bậc hai và căn bậc ba (Câu 5 — Kiểm tra 1 tiết). */
import { minus, signStr } from '../../js/core/mathfmt.js';
import { num, sameNumber, parseNumberSet, sameNumberSet } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const SQUARES = [0, 1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225];

/* "Căn bậc hai của n" (không phải căn bậc hai số học): n > 0 có hai căn ±√n, n = 0 có một căn. */
const roots = (p) => (p.n === 0 ? [0] : [Math.sqrt(p.n), -Math.sqrt(p.n)]);

export default {
  id: 'ch1.sqrt-cbrt',
  chapter: 1,
  topic: '1.3',
  title: 'Căn bậc hai, căn bậc ba',
  shortTitle: 'Căn bậc hai & bậc ba',
  points: 1,
  difficulties: ['medium'],
  legacy: {
    labels: [{ chapter: 1, label: 'Căn bậc hai & bậc ba' }, { chapter: 1, label: '1T-Câu 5' }],
    practiceKey: '9',
  },

  generate({ rng }) {
    let m;
    do { m = rng.int(-6, 6); } while (m === 0);
    return { n: rng.pick(SQUARES), m };
  },

  render(p, ui) {
    return '<div class="sub"><span class="sub-label">a.</span> Tìm căn bậc hai của ' + p.n + ': ' +
        ui.blank('a', { placeholder: 'vd: 5 ; -5' }) +
        ui.hint('Nếu có nhiều giá trị, cách nhau bằng dấu chấm phẩy ";".') + ui.feedback('a') + '</div>' +
      '<div class="sub"><span class="sub-label">b.</span> Giải phương trình: x³ = ' + minus(p.m ** 3) + ' &nbsp;→&nbsp; x = ' +
        ui.blank('b', { width: 70 }) + ui.feedback('b') + '</div>';
  },

  grade(p, ans) {
    const r = roots(p);
    return {
      parts: [
        part('a', sameNumberSet(parseNumberSet(ans.a), r), 0.5, r.map(minus).join(' ; ')),
        part('b', sameNumber(num(ans.b), p.m), 0.5, 'x = ' + minus(p.m)),
      ],
    };
  },

  solve(p) {
    return { a: roots(p).join(' ; '), b: String(p.m) };
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return 'Căn bậc hai của ' + p.n + ' ; x³ = ' + minus(p.m ** 3);
  },

  explain(p) {
    const s = Math.sqrt(p.n), k = p.m ** 3, m = signStr(p.m);
    const a = p.n === 0
      ? '<p>&nbsp;&nbsp;Số 0 chỉ có một căn bậc hai là <b>0</b>.</p>'
      : '<p>&nbsp;&nbsp;Căn bậc hai của ' + p.n + ' là các số a sao cho a² = ' + p.n + '.</p>' +
        '<p>&nbsp;&nbsp;Thử: ' + s + '² = ' + p.n + ' ✓ và (−' + s + ')² = ' + p.n + ' ✓</p>' +
        '<p>&nbsp;&nbsp;⟹ Số dương ' + p.n + ' có hai căn bậc hai: <b>' + s + '</b> và <b>−' + s + '</b> ' +
        '(√' + p.n + ' = ' + s + ' là căn bậc hai số học).</p>';
    return [
      '<p><b>a) Căn bậc hai của ' + p.n + ':</b></p>' + a,
      '<p><b>b) Tìm x biết x³ = ' + minus(k) + ':</b></p>' +
        '<p>&nbsp;&nbsp;Ta cần tìm số nào lập phương bằng ' + minus(k) + '.</p>' +
        '<p>&nbsp;&nbsp;Thử: ' + m + '³ = ' + m + ' × ' + m + ' × ' + m + ' = ' + minus(k) + ' ✓</p>' +
        '<p>&nbsp;&nbsp;⟹ x = <b>' + minus(p.m) + '</b></p>',
    ];
  },
};
