/* Helper cho các dạng "nối cột A với cột B" (không phải dạng bài — không đăng ký trong index.js).
   params: { left: [{ id, text, key }], right: [{ id, text, key }] } — hai phần tử cùng `key` là một cặp đúng.
   Đáp án của học sinh (runner thu từ ui.matching): { [leftId]: rightId }. */
import { part } from '../../js/core/grading.js';

export function makePairs(rng, pairs) {
  return {
    left: rng.shuffle(pairs.map((p, i) => ({ id: 'L' + i, text: p.left, key: i }))),
    right: rng.shuffle(pairs.map((p, i) => ({ id: 'R' + i, text: p.right, key: i }))),
  };
}

export function renderMatching(p, ui, { leftMarkers, rightMarkers }) {
  return ui.matching('m', {
    left: p.left.map((it, i) => ({ id: it.id, marker: leftMarkers[i], html: it.text })),
    right: p.right.map((it, i) => ({ id: it.id, marker: rightMarkers[i], html: it.text })),
  });
}

export function gradeMatching(p, ans, { rightMarkers, pointsEach }) {
  const conns = ans.m || {};
  return p.left.map((it) => {
    const chosen = p.right.find((r) => r.id === conns[it.id]);
    const target = p.right.findIndex((r) => r.key === it.key);
    return part('m.' + it.id, !!chosen && chosen.key === it.key, pointsEach, 'nối với ' + rightMarkers[target]);
  });
}

export function solveMatching(p) {
  const m = {};
  for (const it of p.left) m[it.id] = p.right.find((r) => r.key === it.key).id;
  return { m };
}

/* Các cặp theo thứ tự cột A, cho phần lời giải. */
export function pairsInLeftOrder(p) {
  return p.left.map((it) => ({ left: it, right: p.right.find((r) => r.key === it.key) }));
}
