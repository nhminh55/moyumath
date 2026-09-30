/* Phân loại số (có phân số) vào N, Z, Q (Câu 7 — Kiểm tra 1 tiết). */
import { gcd } from '../../js/core/mathfmt.js';
import { numberStrip, renderSetCheckboxes, gradeSetCheckboxes, solveSetCheckboxes, setsOf } from './_number-sets-shared.js';

export default {
  id: 'ch1.number-sets-fraction',
  chapter: 1,
  topic: '1.5',
  title: 'Tập hợp N, Z, Q (có phân số)',
  points: 1,
  difficulties: ['medium'],
  practice: false,
  legacy: { labels: [{ chapter: 1, label: '1T-Câu 7' }] },

  generate({ rng }) {
    const neg = -rng.int(1, 50);
    const nat1 = rng.int(1, 50);
    const nat2 = rng.intExcept(1, 50, [nat1]);
    const decInt = rng.int(1, 12);
    const fb = rng.pick([3, 4, 5, 7]);
    let fa;
    do { fa = rng.int(1, fb - 1); } while (gcd(fa, fb) !== 1);
    return {
      nums: rng.shuffle([
        { value: neg, label: '−' + Math.abs(neg) },
        { value: decInt + 0.5, label: decInt + ',5' },
        { value: fa / fb, label: fa + '/' + fb },
        { value: nat1, label: String(nat1) },
        { value: nat2, label: String(nat2) },
      ]),
    };
  },

  render(p, ui) {
    return '<p class="q-prompt">Cho danh sách các số sau:</p>' + numberStrip(p.nums) + renderSetCheckboxes(p.nums, ui);
  },

  grade(p, ans) {
    return { parts: gradeSetCheckboxes(p.nums, ans, [0.34, 0.33, 0.33]) };
  },

  solve(p) {
    return solveSetCheckboxes(p.nums);
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return p.nums.map((n) => n.label).join(', ');
  },

  explain(p) {
    return '<p><b>Phân loại:</b> N ⊂ Z ⊂ Q.</p><ul>' +
      p.nums.map((n) => '<li>' + n.label + ' ∈ ' + setsOf(n.value).join(', ') + '</li>').join('') + '</ul>';
  },
};
