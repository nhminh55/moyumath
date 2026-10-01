/* Tiến độ luyện tập & thưởng sao cho từng dạng bài — thuần, test được bằng Node.
   Quy tắc (CLAUDE.md):
   - Mỗi phần (part) chấm đúng: +1⭐, không giới hạn, cộng dồn vào answerStars.
   - Mốc 10 lượt: +5⭐. Mốc 20 lượt: +10⭐. Mỗi mốc chỉ thưởng một lần, không xét điểm.
   Doc Firestore "Đã làm/{tên}/giới hạn luyện tập/{key}":
   { attempts, scores[], answerStars, reward10, reward20, reward10Amount, reward20Amount, label, problemId?, updatedAt } */

export const BASE_GOAL = 10;
export const MILESTONE_2 = 20;
export const ROLLING_WINDOW = 10;
export const REWARD_10 = 5;
export const REWARD_20 = 10;

export function emptyStat() {
  return { attempts: 0, scores: [], answerStars: 0, reward10: false, reward20: false, reward20Amount: 0, reward10Amount: 0 };
}

/* Điểm phong độ: trung bình 10 lượt gần nhất (hoặc tất cả nếu chưa đủ 10). */
export function avgOfScores(scores) {
  if (!scores || !scores.length) return 0;
  const slice = scores.slice(-ROLLING_WINDOW);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

/* Mốc tính theo quy tắc hiện hành (không đọc reward10Amount/reward20Amount cũ — 2⭐/0⭐ theo luật cũ
   được nâng lên đủ 5⭐/10⭐). */
export function starsForStat(stat) {
  return (stat.reward10 ? REWARD_10 : 0) + (stat.reward20 ? REWARD_20 : 0) + (stat.answerStars || 0);
}

export function statFromDoc(d) {
  return {
    attempts: d.attempts || 0,
    scores: Array.isArray(d.scores) ? d.scores : [],
    answerStars: Math.max(0, Math.floor(Number(d.answerStars) || 0)),
    reward10: !!d.reward10,
    reward20: !!d.reward20,
    reward10Amount: d.reward10 ? REWARD_10 : 0,
    reward20Amount: d.reward20 ? REWARD_20 : 0,
  };
}

/* Doc từ trước khi có hệ thống sao (không có field reward10): nếu đã vượt mốc thì gắn cờ một lần.
   Không bao giờ reset tiến độ ở đây. */
export function isLegacyDoc(d) {
  return d.reward10 === undefined;
}

export function migrateLegacy(stat) {
  const s = { ...stat };
  if (!s.reward10 && s.attempts >= BASE_GOAL) {
    s.reward10 = true;
    s.reward10Amount = REWARD_10;
  }
  if (!s.reward20 && s.attempts >= MILESTONE_2) {
    s.reward20 = true;
    s.reward20Amount = REWARD_20;
  }
  return s;
}

/* Ghi nhận một lượt (pct: 0–100, correctParts: số phần chấm đúng). Trả { stat, event }:
   event = null | { type: 'reward', milestone: 10|20, stars } (chỉ sao mốc; sao từng phần đúng caller tự biết). */
export function recordAttempt(stat, pct, correctParts = 0) {
  const s = {
    ...stat,
    scores: [...stat.scores, pct],
    attempts: stat.attempts + 1,
    answerStars: (stat.answerStars || 0) + Math.max(0, Math.floor(correctParts)),
  };
  if (!s.reward10 && s.attempts >= BASE_GOAL) {
    return { stat: { ...s, reward10: true, reward10Amount: REWARD_10 }, event: { type: 'reward', milestone: 10, stars: REWARD_10 } };
  }
  if (!s.reward20 && s.attempts >= MILESTONE_2) {
    return { stat: { ...s, reward20: true, reward20Amount: REWARD_20 }, event: { type: 'reward', milestone: 20, stars: REWARD_20 } };
  }
  return { stat: s, event: null };
}

/* "Luyện lại từ đầu": xoá lượt và điểm, GIỮ sao đã nhận (mỗi mốc chỉ thưởng một lần). */
export function resetStat(stat) {
  return { ...stat, attempts: 0, scores: [] };
}

export function totalStars(stats) {
  return Object.values(stats).reduce((s, st) => s + starsForStat(st), 0);
}
