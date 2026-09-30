/* Phân tích hai số ra thừa số nguyên tố, tìm ƯCLN và BCNN (Câu 1 — Kiểm tra 15 phút). */
import { factorize, gcd, lcm, formatFactorization, divisionSteps, gcdFactorization, lcmFactorization } from '../../js/core/mathfmt.js';
import { num, sameNumber, parseFactorization, factorizationMatches } from '../../js/core/evaluator.js';
import { part, partial } from '../../js/core/grading.js';

const PAIRS = [[60, 72], [24, 36], [18, 48], [45, 60], [36, 90], [16, 40], [28, 42],
  [50, 75], [32, 48], [20, 30], [12, 18], [27, 36], [40, 60], [54, 72], [35, 105],
  [24, 60], [30, 45], [42, 63], [24, 40], [36, 48], [18, 30], [45, 75], [21, 28],
  [16, 24], [36, 60], [48, 72], [20, 50], [27, 45], [32, 80], [24, 90], [15, 40],
  [56, 84], [42, 70], [36, 54], [63, 84], [30, 72], [48, 60], [18, 45], [20, 36], [28, 70]];

function derive({ n1, n2 }) {
  return { f1: factorize(n1), f2: factorize(n2), g: gcd(n1, n2), l: lcm(n1, n2) };
}

export default {
  id: 'ch1.gcd-lcm',
  chapter: 1,
  topic: '1.1',
  title: 'Phân tích thừa số nguyên tố, ƯCLN, BCNN',
  shortTitle: 'ƯCLN/BCNN',
  points: 3,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 1, label: 'Câu 1' }], practiceKey: '1' },

  generate({ rng }) {
    const [n1, n2] = rng.pick(PAIRS);
    return { n1, n2 };
  },

  render(p, ui) {
    return (
      '<div class="sub"><span class="sub-label">a.</span> Phân tích số ' + p.n1 + ' và ' + p.n2 + ' ra thừa số nguyên tố.' +
        '<div class="factor-row" style="margin-top:8px;">' + p.n1 + ' &nbsp;=&nbsp; ' + ui.blank('a1', { placeholder: 'vd: 2^2 x 3 x 5' }) + '</div>' +
        '<div class="factor-row">' + p.n2 + ' &nbsp;=&nbsp; ' + ui.blank('a2', { placeholder: 'vd: 2^3 x 3^2' }) + '</div>' +
        ui.hint('Nhập dạng lũy thừa dùng dấu ^ , ví dụ 2^2 x 3 x 5 — thứ tự các thừa số không quan trọng.') +
        ui.feedback('a') +
      '</div>' +
      '<div class="sub"><span class="sub-label">b.</span> Tìm ước chung lớn nhất (ƯCLN) của ' + p.n1 + ' và ' + p.n2 + ': ' +
        ui.blank('b', { width: 80 }) + ui.feedback('b') + '</div>' +
      '<div class="sub"><span class="sub-label">c.</span> Tìm bội chung nhỏ nhất (BCNN) của ' + p.n1 + ' và ' + p.n2 + ': ' +
        ui.blank('c', { width: 80 }) + ui.feedback('c') + '</div>'
    );
  },

  grade(p, ans) {
    const d = derive(p);
    const ok1 = factorizationMatches(parseFactorization(ans.a1), d.f1);
    const ok2 = factorizationMatches(parseFactorization(ans.a2), d.f2);
    return {
      parts: [
        partial('a', (ok1 ? 0.5 : 0) + (ok2 ? 0.5 : 0), 1,
          p.n1 + ' = ' + formatFactorization(d.f1) + ' ; ' + p.n2 + ' = ' + formatFactorization(d.f2)),
        part('b', sameNumber(num(ans.b), d.g), 1, String(d.g)),
        part('c', sameNumber(num(ans.c), d.l), 1, String(d.l)),
      ],
    };
  },

  solve(p) {
    const d = derive(p);
    return {
      a1: formatFactorization(d.f1, { ascii: true }),
      a2: formatFactorization(d.f2, { ascii: true }),
      b: String(d.g),
      c: String(d.l),
    };
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return 'Phân tích ' + p.n1 + ' và ' + p.n2 + ' ra thừa số nguyên tố; ƯCLN, BCNN của ' + p.n1 + ' và ' + p.n2 + '.';
  },

  explain(p) {
    const d = derive(p);
    const steps = (n) => divisionSteps(n).map((s) => '&nbsp;&nbsp;' + s).join('<br>');
    return '<p><b>Bước 1 — Phân tích ra thừa số nguyên tố:</b></p>' +
      '<p>• ' + p.n1 + ':<br>' + steps(p.n1) + '<br>&nbsp;&nbsp;⟹ ' + p.n1 + ' = ' + formatFactorization(d.f1) + '</p>' +
      '<p>• ' + p.n2 + ':<br>' + steps(p.n2) + '<br>&nbsp;&nbsp;⟹ ' + p.n2 + ' = ' + formatFactorization(d.f2) + '</p>' +
      '<p><b>Bước 2 — Tìm ƯCLN:</b></p>' +
      '<p>ƯCLN = tích các thừa số nguyên tố <i>chung</i> với số mũ <i>nhỏ nhất</i>.<br>' +
      'ƯCLN(' + p.n1 + ', ' + p.n2 + ') = ' + gcdFactorization(d.f1, d.f2) + ' = <b>' + d.g + '</b>.</p>' +
      '<p><b>Bước 3 — Tìm BCNN:</b></p>' +
      '<p>BCNN = tích các thừa số nguyên tố <i>chung và riêng</i> với số mũ <i>lớn nhất</i>.<br>' +
      'BCNN(' + p.n1 + ', ' + p.n2 + ') = ' + lcmFactorization(d.f1, d.f2) + ' = <b>' + d.l + '</b>.</p>';
  },
};
