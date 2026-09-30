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
