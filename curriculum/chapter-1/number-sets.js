/* Phân loại số vào N, Z, Q và biểu đồ Venn (Câu 5 — Kiểm tra 15 phút). */
import { regionOf } from '../../js/core/evaluator.js';
import { partial } from '../../js/core/grading.js';
import { numberStrip, renderSetCheckboxes, gradeSetCheckboxes, solveSetCheckboxes, setsOf } from './_number-sets-shared.js';

const VENN_SVG =
  '<svg class="venn-svg" width="180" height="200" viewBox="0 0 180 200" style="color:var(--ink)">' +
    '<circle cx="90" cy="105" r="90" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<circle cx="90" cy="112" r="60" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<circle cx="90" cy="122" r="32" fill="none" stroke="currentColor" stroke-width="2"/>' +
    '<text x="90" y="30" text-anchor="middle" font-family="Lora, serif" font-weight="600" font-size="18" fill="currentColor">Q</text>' +
    '<text x="90" y="65" text-anchor="middle" font-family="Lora, serif" font-weight="600" font-size="16" fill="currentColor">Z</text>' +
    '<text x="90" y="98" text-anchor="middle" font-family="Lora, serif" font-weight="600" font-size="15" fill="currentColor">N</text>' +
  '</svg>';

const REGIONS = [{ value: 'N', label: 'N' }, { value: 'Z', label: 'Z' }, { value: 'Q', label: 'Q' }];

export default {
  id: 'ch1.number-sets',
  chapter: 1,
  topic: '1.5',
  title: 'Tập hợp N, Z, Q',
  shortTitle: 'Tập hợp số',
  points: 2,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 1, label: 'Câu 5' }], practiceKey: '5' },

  generate({ rng }) {
    const neg = -rng.int(1, 25);
    const decInt = rng.int(1, 12);
    const mixInt = rng.intExcept(1, 12, [decInt]);
    const nat1 = rng.int(1, 30);
    const nat2 = rng.intExcept(1, 30, [nat1]);
    return {
      nums: rng.shuffle([
        { value: neg, label: '−' + Math.abs(neg) },
        { value: decInt + 0.5, label: decInt + ',5' },
        { value: nat1, label: String(nat1) },
        { value: mixInt + 0.5, label: mixInt + ' ½' },
        { value: nat2, label: String(nat2) },
      ]),
    };
  },

  render(p, ui) {
    const rows = p.nums.map((n, i) =>
      '<div class="venn-row">' + n.label + ' ' + ui.select('v' + i, REGIONS, { placeholder: '— chọn —' }) + '</div>').join('');
    return '<p class="q-prompt">Cho danh sách các số sau:</p>' +
      numberStrip(p.nums) + renderSetCheckboxes(p.nums, ui) +
      '<div class="sub"><span class="sub-label">d. Sắp xếp vào biểu đồ Venn — chọn tập hợp nhỏ nhất mà mỗi số thuộc về:</span>' +
        '<div class="venn-wrap">' + VENN_SVG + '<div class="venn-selects">' + rows + '</div></div>' +
        ui.feedback('d') + '</div>';
  },

  /* a, b, c: 0,5 điểm mỗi ý; d: 0,1 điểm mỗi số đặt đúng vùng. */
  grade(p, ans) {
    const marks = {};
    let hit = 0;
    p.nums.forEach((n, i) => {
      marks['v' + i] = ans['v' + i] === regionOf(n.value);
      if (marks['v' + i]) hit++;
    });
    const d = partial('d', hit * 0.1, 0.5, p.nums.map((n) => n.label + '→' + regionOf(n.value)).join(', '), { marks });
    d.note = 'Đúng ' + hit + '/' + p.nums.length;
    return { parts: [...gradeSetCheckboxes(p.nums, ans, [0.5, 0.5, 0.5]), d] };
  },

  solve(p) {
    const out = solveSetCheckboxes(p.nums);
    p.nums.forEach((n, i) => { out['v' + i] = regionOf(n.value); });
    return out;
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return p.nums.map((n) => n.label).join(', ');
  },

  explain(p) {
    const lines = p.nums.map((n) => {
      const sets = setsOf(n.value);
      return '<li>' + n.label + ' ∈ ' + sets.join(', ') +
        (sets.length === 3 ? ' (số tự nhiên → thuộc cả ba tập)'
          : sets.length === 2 ? ' (số nguyên âm → thuộc Z và Q, không thuộc N)'
            : ' (số thập phân/phân số → chỉ thuộc Q)') + '</li>';
    });
    return '<p><b>Phân loại từng số vào các tập hợp:</b></p>' +
      '<p>• <b>N</b> (Số tự nhiên) = {0, 1, 2, 3, ...}</p>' +
      '<p>• <b>Z</b> (Số nguyên) = {..., −2, −1, 0, 1, 2, ...}</p>' +
      '<p>• <b>Q</b> (Số hữu tỉ) = các số viết được dạng a/b (b ≠ 0)</p>' +
      '<p>Quan hệ: N ⊂ Z ⊂ Q (mọi số tự nhiên cũng là số nguyên, cũng là số hữu tỉ).</p>' +
      '<ul>' + lines.join('') + '</ul>';
  },
};
