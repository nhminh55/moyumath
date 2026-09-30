/* Kết quả chấm của một dạng bài: { parts: [Part] }.
   Part = { field, earned, max, correct, expected, note }
   - field:    tên ô feedback (ui.feedback(field)) mà runner sẽ tô ✓/✗
   - expected: đáp án hiển thị khi sai
   - note:     ghi chú luôn hiển thị (vd "Đúng 3/5")
   - marks:    (tuỳ chọn) { [inputField]: true|false } — runner tô viền từng ô nhập
   - expectedChecked: (tuỳ chọn, cho ui.checkboxes) chỉ số các ô lẽ ra phải tick */

export function round2(x) {
  return Math.round(x * 100) / 100;
}

export function part(field, correct, max, expected = '', extra = {}) {
  return { field, correct: !!correct, earned: correct ? max : 0, max, expected, note: '', ...extra };
}

export function partial(field, earned, max, expected = '', extra = {}) {
  earned = round2(earned);
  return { field, correct: earned >= max, earned, max, expected, note: '', ...extra };
}

export function totalEarned(result) {
  return round2(result.parts.reduce((s, p) => s + p.earned, 0));
}

export function totalMax(result) {
  return round2(result.parts.reduce((s, p) => s + p.max, 0));
}
