/* Registry các dạng bài: tra cứu theo id / chương / chủ đề, và map dữ liệu Firestore cũ
   (nhãn "Câu 1", "1T-Câu 3", "Nối phát biểu"… và key luyện tập "1", "ch2_3"…) sang id mới. */
import chapters from '../../curriculum/index.js';

const byId = new Map();
const byLegacyLabel = new Map();   // "1|Câu 1" -> problem
const byPracticeKey = new Map();   // "ch2_3" -> problem
const byLabelAnyChapter = new Map(); // "Nối phát biểu" -> problem

for (const ch of chapters) {
  for (const p of ch.problems) {
    byId.set(p.id, p);
    for (const { chapter, label } of p.legacy?.labels || []) {
      byLegacyLabel.set(chapter + '|' + label, p);
      if (!byLabelAnyChapter.has(label)) byLabelAnyChapter.set(label, p);
    }
    if (p.legacy?.practiceKey) byPracticeKey.set(p.legacy.practiceKey, p);
  }
}

export function allChapters() {
  return chapters;
}

export function getChapter(n) {
  return chapters.find((c) => c.chapter === Number(n)) || null;
}

export function getProblem(id) {
  return byId.get(id) || null;
}

/* filter: { chapter, chapters: [..], topic, topics: [..], ids: [..], practice: true } */
export function listProblems(filter = {}) {
  return chapters.flatMap((c) => c.problems).filter((p) =>
    (filter.chapter === undefined || p.chapter === Number(filter.chapter)) &&
    (!filter.chapters || filter.chapters.includes(p.chapter)) &&
    (filter.topic === undefined || p.topic === filter.topic) &&
    (!filter.topics || filter.topics.includes(p.topic)) &&
    (!filter.ids || filter.ids.includes(p.id)) &&
    (!filter.practice || p.practice !== false));
}

/* Dạng bài chỉ có trong luyện tập được đánh số "Dạng 1, 2, ..." theo thứ tự trong index.js. */
export function practiceNumber(problem) {
  return listProblems({ chapter: problem.chapter, practice: true }).indexOf(problem) + 1;
}

/* "Chương 2" / 2 / "2" -> 2; không xác định -> 1 (dữ liệu cũ mặc định là Chương 1). */
export function chapterFromLegacy(value) {
  const m = /\d+/.exec(String(value ?? ''));
  return m ? Number(m[0]) : 1;
}

/* Doc luyện tập cũ không lưu chương: thử Chương 1 trước (nhãn "Câu n" cũ chỉ có ở luyện tập
   Chương 1), rồi tới nhãn ở bất kỳ chương nào (nhãn luyện tập Chương 2 không trùng). */
export function problemFromLegacyLabel(chapter, label) {
  if (chapter === undefined || chapter === null || chapter === '') {
    return byLegacyLabel.get('1|' + label) || byLabelAnyChapter.get(label) || null;
  }
  return byLegacyLabel.get(chapterFromLegacy(chapter) + '|' + label) || null;
}

export function problemFromPracticeKey(key) {
  return byPracticeKey.get(String(key)) || null;
}

/* Key của doc "giới hạn luyện tập/{key}" — giữ key cũ để không mất tiến độ sao. */
export function storageKeyOf(problem) {
  return problem.legacy?.practiceKey || problem.id;
}
