/* ƯCLN và BCNN của hai số (Câu 2 — Kiểm tra 1 tiết). */
import { factorize, gcd, lcm, formatFactorization, divisionSteps, gcdFactorization, lcmFactorization } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const PAIRS = [[96, 27], [60, 150], [28, 40], [50, 72], [112, 280], [54, 36], [36, 90], [56, 45], [126, 90], [77, 56],
  [45, 60], [24, 90], [63, 105], [48, 180], [75, 100]];

export default {
  id: 'ch1.gcd-lcm-pair',
  chapter: 1,
  topic: '1.1',
  title: 'ƯCLN và BCNN',
  points: 1.5,
  difficulties: ['medium'],
  practice: false,
  legacy: { labels: [{ chapter: 1, label: '1T-Câu 2' }] },

  generate({ rng }) {
    const [n1, n2] = rng.pick(PAIRS);
    return { n1, n2 };
  },

  render(p, ui) {
    return '<p class="q-prompt">Cho hai số ' + p.n1 + ' và ' + p.n2 + '.</p>' +
      '<div class="sub"><span class="sub-label">a. ƯCLN =</span> ' + ui.blank('a', { width: 80 }) + ui.feedback('a') + '</div>' +
      '<div class="sub"><span class="sub-label">b. BCNN =</span> ' + ui.blank('b', { width: 80 }) + ui.feedback('b') + '</div>';
  },

  grade(p, ans) {
    const g = gcd(p.n1, p.n2), l = lcm(p.n1, p.n2);
    return {
      parts: [
        part('a', sameNumber(num(ans.a), g), 0.75, String(g)),
        part('b', sameNumber(num(ans.b), l), 0.75, String(l)),
      ],
    };
  },

  solve(p) {
    return { a: String(gcd(p.n1, p.n2)), b: String(lcm(p.n1, p.n2)) };
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return 'ƯCLN, BCNN của ' + p.n1 + ' và ' + p.n2;
  },

  explain(p) {
    const f1 = factorize(p.n1), f2 = factorize(p.n2);
    const steps = (n) => divisionSteps(n).map((s) => '&nbsp;&nbsp;' + s).join('<br>');
    return '<p><b>Bước 1 — Phân tích ra thừa số nguyên tố:</b></p>' +
      '<p>• ' + p.n1 + ':<br>' + steps(p.n1) + '<br>&nbsp;&nbsp;⟹ ' + p.n1 + ' = ' + formatFactorization(f1) + '</p>' +
      '<p>• ' + p.n2 + ':<br>' + steps(p.n2) + '<br>&nbsp;&nbsp;⟹ ' + p.n2 + ' = ' + formatFactorization(f2) + '</p>' +
      '<p><b>Bước 2 — ƯCLN</b> (thừa số chung, mũ nhỏ nhất):<br>' +
      'ƯCLN(' + p.n1 + ', ' + p.n2 + ') = ' + gcdFactorization(f1, f2) + ' = <b>' + gcd(p.n1, p.n2) + '</b></p>' +
      '<p><b>Bước 3 — BCNN</b> (tất cả thừa số, mũ lớn nhất):<br>' +
      'BCNN(' + p.n1 + ', ' + p.n2 + ') = ' + lcmFactorization(f1, f2) + ' = <b>' + lcm(p.n1, p.n2) + '</b></p>';
  },
};
