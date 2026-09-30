/* Biến một preset trong config/presets.json thành danh sách câu hỏi cụ thể của một đề.
   Thuần (không DOM) — test được bằng Node.
   - items:    đề cố định  [{ problem: id, points, difficulty? }]
   - sections: bốc ngẫu nhiên theo seed [{ pool: { chapters, topics, ids }, count, pointsEach, difficulty: { easy: 0.5, ... } }]
   Kết quả: [{ problem, points, difficulty, label }] */
import { getProblem, listProblems } from './registry.js';

const DIFFICULTY_ORDER = ['easy', 'medium', 'hard'];

/* Mức gần nhất mà dạng bài hỗ trợ (hoà thì lấy mức dễ hơn). */
export function nearestDifficulty(problem, wanted = 'medium') {
  if (problem.difficulties.includes(wanted)) return wanted;
  const w = DIFFICULTY_ORDER.indexOf(wanted);
  return [...problem.difficulties].sort((a, b) =>
    Math.abs(DIFFICULTY_ORDER.indexOf(a) - w) - Math.abs(DIFFICULTY_ORDER.indexOf(b) - w) ||
    DIFFICULTY_ORDER.indexOf(a) - DIFFICULTY_ORDER.indexOf(b))[0];
}

/* Chia `count` câu theo tỉ lệ { easy: 0.5, medium: 0.5 } bằng phương pháp phần dư lớn nhất. */
export function distributeDifficulty(ratio, count) {
  const entries = Object.entries(ratio || { medium: 1 });
  const sum = entries.reduce((s, [, r]) => s + r, 0) || 1;
  const exact = entries.map(([d, r]) => [d, (r / sum) * count]);
  const out = exact.map(([d, x]) => [d, Math.floor(x)]);
  let left = count - out.reduce((s, [, n]) => s + n, 0);
  exact.map(([, x], i) => [x - Math.floor(x), i]).sort((a, b) => b[0] - a[0])
    .forEach(([, i]) => { if (left > 0) { out[i][1]++; left--; } });
  return out.flatMap(([d, n]) => Array(n).fill(d));
}

function poolOf(section) {
  const pool = section.pool || {};
  return listProblems({ chapters: pool.chapters, topics: pool.topics, ids: pool.ids });
}

export function resolvePreset(preset, rng) {
  let questions = [];
  if (preset.items) {
    questions = preset.items.map((it) => {
      const problem = getProblem(it.problem);
      if (!problem) throw new Error('Preset trỏ tới dạng bài không tồn tại: ' + it.problem);
      return { problem, points: it.points ?? problem.points, difficulty: nearestDifficulty(problem, it.difficulty) };
    });
  } else {
    const used = new Set();
    for (const s of preset.sections || []) {
      const candidates = rng.shuffle(poolOf(s).filter((p) => !used.has(p.id)));
      if (candidates.length < s.count) throw new Error('Không đủ dạng bài trong pool cho section');
      const levels = rng.shuffle(distributeDifficulty(s.difficulty, s.count));
      candidates.slice(0, s.count).forEach((problem, i) => {
        used.add(problem.id);
        questions.push({ problem, points: s.pointsEach ?? problem.points, difficulty: nearestDifficulty(problem, levels[i]) });
      });
    }
  }
  if (preset.shuffle) questions = rng.shuffle(questions);
  return questions.map((q, i) => ({
    ...q,
    label: preset.labelTemplate ? preset.labelTemplate.replace('{n}', i + 1) : q.problem.id,
  }));
}

/* Trả về danh sách lỗi (rỗng = hợp lệ). */
export function validatePreset(id, preset) {
  const errors = [];
  const err = (m) => errors.push(id + ': ' + m);
  for (const f of ['title', 'heading', 'examType', 'durationMin', 'totalPoints']) if (preset[f] === undefined) err('thiếu ' + f);
  if (!preset.items === !preset.sections) err('phải có đúng một trong hai: items hoặc sections');
  if (preset.chapter === undefined && !preset.chapterLabel) err('thiếu chapter hoặc chapterLabel');
  let total = 0;
  for (const it of preset.items || []) {
    const p = getProblem(it.problem);
    if (!p) err('dạng bài không tồn tại: ' + it.problem);
    total += it.points ?? p?.points ?? 0;
  }
  const taken = new Set();
  for (const s of preset.sections || []) {
    const pool = poolOf(s).filter((p) => !taken.has(p.id));
    if (!(s.count > 0)) err('section thiếu count');
    /* Section sau chỉ chắc chắn đủ nếu pool trừ đi toàn bộ pool của các section trước vẫn đủ. */
    if (pool.length < s.count) err('pool chỉ có ' + pool.length + ' dạng bài, cần ' + s.count);
    for (const p of poolOf(s)) taken.add(p.id);
    if (s.pointsEach === undefined) err('section thiếu pointsEach');
    total += (s.pointsEach || 0) * (s.count || 0);
    for (const d of Object.keys(s.difficulty || {})) if (!DIFFICULTY_ORDER.includes(d)) err('độ khó lạ: ' + d);
  }
  if (Math.abs(total - preset.totalPoints) > 1e-9) err('tổng điểm ' + total + ' ≠ totalPoints ' + preset.totalPoints);
  return errors;
}

/* ?preset=15m-ch2  hoặc  ?type=15m&chapter=2  (không có gì → mặc định). */
export function presetIdFromParams(params, fallback = '15m-ch1') {
  if (params.get('preset')) return params.get('preset');
  if (params.get('type')) return params.get('type') + '-ch' + (params.get('chapter') || '1');
  return fallback;
}

/* Tên chương lưu vào Firestore (admin/index cũ gom nhóm theo chuỗi này). */
export function chapterLabelOf(preset) {
  return preset.chapterLabel || 'Chương ' + preset.chapter;
}
