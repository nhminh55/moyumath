/* Gộp thống kê từ doc Firestore (cả định dạng cũ lẫn mới) theo id dạng bài — thuần, test được bằng Node.
   - Doc mới có byProblem → dùng trực tiếp.
   - Doc cũ chỉ có byQuestion theo nhãn ("Câu 1", "1T-Câu 3", "Nối phát biểu"...) → map qua registry,
     có xét field `chapter` (bài kiểm tra cũ không có chapter là Chương 1; doc luyện tập cũ không lưu chương).
   Nhãn không map được bị bỏ qua. */
import { problemFromLegacyLabel, getProblem, listProblems } from './registry.js';

/* Bài kiểm tra: [{ problem, earned, max }] */
export function examEntries(doc) {
  if (doc.byProblem) {
    return Object.entries(doc.byProblem).map(([id, v]) => ({ problem: getProblem(id), earned: v.earned || 0, max: v.max || 0 }))
      .filter((e) => e.problem);
  }
  return Object.entries(doc.byQuestion || {}).map(([label, v]) => ({
    problem: problemFromLegacyLabel(doc.chapter || 'Chương 1', label), label, earned: v.earned || 0, max: v.max || 0,
  })).filter((e) => e.problem);
}

/* Phiên luyện tập: [{ problem, earned, max, count, correct }] — max là tổng điểm tối đa của mọi lượt. */
export function practiceEntries(doc) {
  const map = doc.byProblem || doc.byQuestion || {};
  return Object.entries(map).map(([key, v]) => ({
    problem: doc.byProblem ? getProblem(key) : problemFromLegacyLabel(doc.chapter, key),
    label: key,
    earned: v.totalEarned || 0,
    max: (v.max || 0) * (v.count || 0),
    count: v.count || 0,
    correct: v.correct || 0,
  })).filter((e) => e.problem);
}

function add(map, id, earned, max) {
  if (max <= 0) return;
  const e = (map[id] ||= { earned: 0, max: 0 });
  e.earned += earned;
  e.max += max;
}

/* → { all: {id: {earned, max}} (kiểm tra + luyện tập), practice: {id: {earned, max}} (chỉ luyện tập) } */
export function aggregate(examDocs, practiceDocs) {
  const all = {}, practice = {};
  for (const d of examDocs) for (const e of examEntries(d)) add(all, e.problem.id, e.earned, e.max);
  for (const d of practiceDocs) {
    for (const e of practiceEntries(d)) {
      add(all, e.problem.id, e.earned, e.max);
      add(practice, e.problem.id, e.earned, e.max);
    }
  }
  return { all, practice };
}

export function pctOf(e) {
  return e && e.max > 0 ? (e.earned / e.max) * 100 : null;
}

/* Điểm theo chủ đề của một chương (trục radar): [{ topic, earned, max, pct }] */
export function topicScores(chapterDef, byProblem) {
  return chapterDef.topics.map((topic) => {
    let earned = 0, max = 0;
    for (const p of listProblems({ chapter: chapterDef.chapter, topic: topic.id })) {
      const e = byProblem[p.id];
      if (e) { earned += e.earned; max += e.max; }
    }
    return { topic, earned, max, pct: max > 0 ? (earned / max) * 100 : null };
  });
}

/* Chia các dạng bài có dữ liệu thành mạnh (≥ 80%), khá, yếu (< 60%). */
export function classify(byProblem, filter = () => true) {
  const out = { strong: [], mid: [], weak: [] };
  for (const [id, e] of Object.entries(byProblem)) {
    const problem = getProblem(id);
    const pct = pctOf(e);
    if (!problem || pct === null || !filter(problem)) continue;
    const item = { problem, pct };
    if (pct >= 80) out.strong.push(item);
    else if (pct < 60) out.weak.push(item);
    else out.mid.push(item);
  }
  for (const k of Object.keys(out)) out[k].sort((a, b) => a.problem.chapter - b.problem.chapter || a.pct - b.pct);
  return out;
}

/* "C2 · Nhân tử chung" — tên dạng bài ngắn gọn, phân biệt chương. */
export function problemLabel(problem) {
  return 'C' + problem.chapter + ' · ' + (problem.shortTitle || problem.title);
}

export function practiceHref(problem) {
  return 'practice.html?chapter=' + problem.chapter + '&problem=' + encodeURIComponent(problem.id);
}
