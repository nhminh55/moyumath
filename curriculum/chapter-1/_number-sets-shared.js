/* Helper dùng chung cho ch1.number-sets và ch1.number-sets-fraction (không phải dạng bài —
   file bắt đầu bằng "_" không được đăng ký trong index.js). */
import { regionOf, sameIndexSet } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

export const SET_QUESTIONS = [
  { field: 'a', label: 'a. Các số tự nhiên:', inSet: (r) => r === 'N' },
  { field: 'b', label: 'b. Các số nguyên:', inSet: (r) => r === 'N' || r === 'Z' },
  { field: 'c', label: 'c. Các số hữu tỉ:', inSet: () => true },
];

export function numberStrip(nums) {
  return '<div class="number-strip">' + nums.map((n) => '<span>' + n.label + '</span>').join('') + '</div>';
}

export function renderSetCheckboxes(nums, ui) {
  const labels = nums.map((n) => n.label);
  return SET_QUESTIONS.map((q) =>
    '<div class="sub"><span class="sub-label">' + q.label + '</span>' +
      ui.checkboxes(q.field, labels) + ui.feedback(q.field) + '</div>').join('');
}

export function expectedIndices(nums, q) {
  return nums.map((n, i) => i).filter((i) => q.inSet(regionOf(nums[i].value)));
}

/* points: [điểm a, điểm b, điểm c] */
export function gradeSetCheckboxes(nums, ans, points) {
  return SET_QUESTIONS.map((q, k) => {
    const want = expectedIndices(nums, q);
    const expected = want.length === nums.length ? 'cả ' + nums.length + ' số'
      : want.map((i) => nums[i].label).join(' ; ') || 'không có số nào';
    return part(q.field, sameIndexSet(ans[q.field] || [], want), points[k], expected, { expectedChecked: want });
  });
}

export function solveSetCheckboxes(nums) {
  const out = {};
  for (const q of SET_QUESTIONS) out[q.field] = expectedIndices(nums, q);
  return out;
}

export function setsOf(v) {
  const r = regionOf(v);
  return r === 'N' ? ['N', 'Z', 'Q'] : r === 'Z' ? ['Z', 'Q'] : ['Q'];
}

/* Lời giải từng bước cho ý a, b, c: định nghĩa → phân loại từng số → đọc ra đáp án. */
export function explainSetSteps(nums) {
  const reason = { N: 'số tự nhiên → thuộc cả N, Z và Q', Z: 'số nguyên âm → thuộc Z và Q, không thuộc N',
    Q: 'không phải số nguyên (phân số/số thập phân) → chỉ thuộc Q' };
  return [
    '<p><b>Bước 1 — Nhớ lại các tập hợp:</b></p>' +
      '<p>• <b>N</b> (số tự nhiên) = {0; 1; 2; 3; ...}</p>' +
      '<p>• <b>Z</b> (số nguyên) = {...; −2; −1; 0; 1; 2; ...}</p>' +
      '<p>• <b>Q</b> (số hữu tỉ) = các số viết được dạng a/b (a, b ∈ Z, b ≠ 0)</p>' +
      '<p>Quan hệ: N ⊂ Z ⊂ Q — mọi số tự nhiên cũng là số nguyên, mọi số nguyên cũng là số hữu tỉ.</p>',
    '<p><b>Bước 2 — Xét từng số:</b></p>' +
      nums.map((n) => '<p>&nbsp;&nbsp;• ' + n.label + ': ' + reason[regionOf(n.value)] + '</p>').join(''),
    '<p><b>Bước 3 — Đọc ra đáp án:</b></p>' + SET_QUESTIONS.map((q) => {
      const picked = expectedIndices(nums, q).map((i) => nums[i].label);
      return '<p>&nbsp;&nbsp;' + q.label + ' <b>' + (picked.join(' ; ') || 'không có số nào') + '</b></p>';
    }).join(''),
  ];
}
