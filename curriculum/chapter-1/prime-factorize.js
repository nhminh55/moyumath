/* Phân tích ra thừa số nguyên tố và tìm ước nguyên tố (Câu 1 — Kiểm tra 1 tiết). */
import { factorize, formatFactorization, divisionSteps } from '../../js/core/mathfmt.js';
import { parseFactorization, factorizationMatches, parseNumberSet, sameNumberSet } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const POOL_FACTORIZE = [70, 115, 300, 432, 145, 204, 180, 252, 315, 275, 168, 225, 96, 140, 240];
const POOL_PRIME_FACTORS = [28, 120, 90, 84, 150, 196, 225, 252, 132, 168, 140, 110, 105, 72, 60];

const primesOf = (n) => Object.keys(factorize(n)).map(Number);

export default {
  id: 'ch1.prime-factorize',
  chapter: 1,
  topic: '1.1',
  title: 'Ước, bội và số nguyên tố',
  shortTitle: 'Ước & số nguyên tố',
  points: 1.5,
  difficulties: ['medium'],
  legacy: {
    labels: [{ chapter: 1, label: 'Ước & số nguyên tố' }, { chapter: 1, label: '1T-Câu 1' }],
    practiceKey: '6',
  },

  generate({ rng }) {
    const n1 = rng.pick(POOL_FACTORIZE);
    let n2;
    do { n2 = rng.pick(POOL_PRIME_FACTORS); } while (n2 === n1);
    return { n1, n2 };
  },

  render(p, ui) {
    return '<div class="sub"><span class="sub-label">a.</span> Phân tích số ' + p.n1 + ' ra thừa số nguyên tố: ' +
        ui.blank('a', { placeholder: 'vd: 2^2 x 3 x 5' }) +
        ui.hint('Nhập dạng lũy thừa dùng dấu ^ , ví dụ 2^2 x 3 x 5 — thứ tự các thừa số không quan trọng.') +
        ui.feedback('a') + '</div>' +
      '<div class="sub"><span class="sub-label">b.</span> Tìm các ước nguyên tố của ' + p.n2 + ': ' +
        ui.blank('b', { placeholder: 'vd: 2 ; 3 ; 5' }) + ui.feedback('b') + '</div>';
  },

  grade(p, ans) {
    const f1 = factorize(p.n1), primes = primesOf(p.n2);
    return {
      parts: [
        part('a', factorizationMatches(parseFactorization(ans.a), f1), 0.75, p.n1 + ' = ' + formatFactorization(f1)),
        part('b', sameNumberSet(parseNumberSet(ans.b), primes), 0.75, primes.join(' ; ')),
      ],
    };
  },

  solve(p) {
    return { a: formatFactorization(factorize(p.n1), { ascii: true }), b: primesOf(p.n2).join(' ; ') };
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return 'Phân tích ' + p.n1 + ' ra thừa số nguyên tố; ước nguyên tố của ' + p.n2 + '.';
  },

  explain(p) {
    return '<p><b>Bước 1 — Phân tích ' + p.n1 + ' ra thừa số nguyên tố:</b></p>' +
      '<p>' + divisionSteps(p.n1).map((s) => '&nbsp;&nbsp;' + s).join('<br>') +
      '<br>&nbsp;&nbsp;⟹ ' + p.n1 + ' = ' + formatFactorization(factorize(p.n1)) + '</p>' +
      '<p><b>Bước 2 — Tìm các ước nguyên tố của ' + p.n2 + ':</b></p>' +
      '<p>Ước nguyên tố là các số nguyên tố mà ' + p.n2 + ' chia hết cho chúng.</p>' +
      '<p>Các ước nguyên tố của ' + p.n2 + ' là: <b>' + primesOf(p.n2).join(', ') + '</b>.</p>';
  },
};
