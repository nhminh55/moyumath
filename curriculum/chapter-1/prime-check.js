/* Chọn các số nguyên tố trong một danh sách (Đề cương giữa kỳ I — Câu 1).
   Chấm từng số: tick đúng số nguyên tố / bỏ trống đúng hợp số đều được điểm. */
import { isPrime, factorize } from '../../js/core/mathfmt.js';
import { part, partial } from '../../js/core/grading.js';

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
/* Hợp số "dễ nhầm" (lẻ, không chia hết cho 5) và vài số chẵn / số 1. */
const TRICKY = [1, 9, 21, 27, 33, 39, 49, 51, 57, 63, 69, 77, 81, 87, 91, 93, 99];
const EASY = [4, 6, 12, 15, 25, 35, 45, 55, 60, 72, 85, 100];
const COUNT = 8;

const smallestFactor = (n) => Number(Object.keys(factorize(n))[0]);

export default {
  id: 'ch1.prime-check',
  chapter: 1,
  topic: '1.1',
  title: 'Nhận biết số nguyên tố',
  shortTitle: 'Nhận biết số nguyên tố',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    const k = rng.int(3, 5);
    const tricky = rng.int(2, COUNT - k);
    const nums = [
      ...rng.shuffle(PRIMES).slice(0, k),
      ...rng.shuffle(TRICKY).slice(0, tricky),
      ...rng.shuffle(EASY).slice(0, COUNT - k - tricky),
    ];
    return { nums: rng.shuffle(nums) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Chọn tất cả các số là <b>số nguyên tố</b>:</p>' +
      '<div class="sub">' + ui.checkboxes('p', p.nums.map(String)) + ui.feedback('p') + '</div>';
  },

  grade(p, ans) {
    const chosen = ans.p || [];
    const want = p.nums.map((n, i) => i).filter((i) => isPrime(p.nums[i]));
    const hit = p.nums.filter((n, i) => chosen.includes(i) === isPrime(n)).length;
    const r = partial('p', hit / COUNT, 1, want.map((i) => p.nums[i]).join(' ; '), { expectedChecked: want });
    r.note = 'Đúng ' + hit + '/' + COUNT + ' số';
    return { parts: [chosen.length ? r : part('p', false, 1, r.expected, { expectedChecked: want })] };
  },

  solve(p) {
    return { p: p.nums.map((n, i) => i).filter((i) => isPrime(p.nums[i])) };
  },

  describe(p) {
    return 'Chọn số nguyên tố: ' + p.nums.join(', ');
  },

  explain(p) {
    const why = (n) => {
      if (n === 1) return '1 chỉ có một ước → <b>không</b> phải số nguyên tố';
      if (!isPrime(n)) { const d = smallestFactor(n); return n + ' = ' + d + ' × ' + n / d + ' → có ước ' + d + ' → <b>hợp số</b>'; }
      const tried = PRIMES.filter((q) => q * q <= n);
      return tried.length
        ? 'không chia hết cho ' + tried.join(', ') + ' → <b>số nguyên tố</b>'
        : 'chỉ có hai ước là 1 và ' + n + ' → <b>số nguyên tố</b>';
    };
    return [
      '<p><b>Bước 1 — Nhớ định nghĩa:</b> số nguyên tố là số tự nhiên lớn hơn 1, chỉ có đúng hai ước là 1 và chính nó.</p>' +
        '<p>Cách kiểm tra số n: thử chia n cho các số nguyên tố 2, 3, 5, 7, … (chỉ cần thử các số p có p × p ≤ n). ' +
        'Nếu chia hết cho một số nào đó thì n là hợp số.</p>',
      '<p><b>Bước 2 — Xét từng số:</b></p>' +
        p.nums.map((n) => '<p>&nbsp;&nbsp;• ' + n + ': ' + why(n) + '</p>').join(''),
      '<p><b>Bước 3 — Kết luận:</b> các số nguyên tố là <b>' + p.nums.filter(isPrime).join(' ; ') + '</b>.</p>',
    ];
  },
};
