/* Kết quả chấm của một dạng bài: { parts: [Part] }.
   Part = { field, earned, max, correct, expected, note }
   - field:    tên ô feedback (ui.feedback(field)) mà runner sẽ tô ✓/✗
   - expected: đáp án hiển thị khi sai
   - note:     ghi chú luôn hiển thị (vd "Đúng 3/5")
   - marks:    (tuỳ chọn) { [inputField]: true|false } — runner tô viền từng ô nhập
   - expectedChecked: (tuỳ chọn, cho ui.checkboxes) chỉ số các ô lẽ ra phải tick
   - hits:     (tuỳ chọn) số ý con làm đúng trong một phần chấm gộp nhiều ý mà không có marks */

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

/* Số ý làm đúng (mỗi ý +1⭐ khi luyện tập): phần có marks → số ô đúng, có hits → hits,
   còn lại → 1 nếu cả phần đúng. */
export function correctCount(result) {
  return result.parts.reduce((n, p) => {
    if (p.marks) return n + Object.values(p.marks).filter(Boolean).length;
    if (p.hits !== undefined) return n + p.hits;
    return n + (p.correct ? 1 : 0);
  }, 0);
}

export function totalMax(result) {
  return round2(result.parts.reduce((s, p) => s + p.max, 0));
}

/* Đề gán cho dạng bài số điểm khác `problem.points` → co giãn điểm từng phần theo tỉ lệ.
   Không làm tròn từng phần (3 × 0,4167 phải ra 1,25 chứ không phải 1,26) — totalEarned và
   phần hiển thị sẽ làm tròn. */
export function scaleResult(result, points, problemPoints) {
  if (points === problemPoints) return result;
  const k = points / problemPoints;
  return { ...result, parts: result.parts.map((p) => ({ ...p, earned: p.earned * k, max: p.max * k })) };
}
