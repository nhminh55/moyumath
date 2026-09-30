/* Tiến độ luyện tập & thưởng sao cho từng dạng bài — thuần, test được bằng Node.
   Quy tắc (CLAUDE.md), tối đa 2 mốc mỗi dạng bài:
   - Mốc 10 lượt: +5⭐.
   - Mốc 20 lượt: điểm TB 10 lượt gần nhất ≥ 80% → +5⭐, ngược lại +2⭐.
   - Điểm TB 10 lượt gần nhất < 50% khi chạm mốc: không thưởng, làm lại chu kỳ (attempts = 0, scores = []).
   Doc Firestore "Đã làm/{tên}/giới hạn luyện tập/{key}":
   { attempts, scores[], reward10, reward20, reward20Amount, reward10Amount?, label, problemId?, updatedAt } */

export const BASE_GOAL = 10;
export const MILESTONE_2 = 20;
export const ROLLING_WINDOW = 10;
export const MIN_PASS_AVG = 50;

export function emptyStat() {
  return { attempts: 0, scores: [], reward10: false, reward20: false, reward20Amount: 0, reward10Amount: 0 };
}

/* Điểm phong độ: trung bình 10 lượt gần nhất (hoặc tất cả nếu chưa đủ 10). */
export function avgOfScores(scores) {
  if (!scores || !scores.length) return 0;
  const slice = scores.slice(-ROLLING_WINDOW);
  return slice.reduce((a, b) => a + b, 0) / slice.length;
}

/* Doc cũ (trước khi có reward10Amount) có reward10 = true nghĩa là đã nhận 5⭐. */
export function starsForStat(stat) {
  const r10 = stat.reward10 ? (stat.reward10Amount ?? 5) : 0;
  return r10 + (stat.reward20 ? stat.reward20Amount || 0 : 0);
}

export function statFromDoc(d) {
  return {
    attempts: d.attempts || 0,
    scores: Array.isArray(d.scores) ? d.scores : [],
    reward10: !!d.reward10,
    reward20: !!d.reward20,
    reward20Amount: d.reward20Amount || 0,
    reward10Amount: d.reward10 ? (d.reward10Amount ?? 5) : 0,
  };
}

/* Doc từ trước khi có hệ thống sao (không có field reward10): nếu đã vượt mốc thì gắn cờ một lần,
   chỉ cộng sao khi điểm trung bình cũ (earnedSum/maxSum, không có thì coi là đạt) đủ ngưỡng.
   Không bao giờ reset tiến độ ở đây. */
export function isLegacyDoc(d) {
  return d.reward10 === undefined;
}

export function migrateLegacy(stat, d) {
  const s = { ...stat };
  const avg = d.maxSum > 0 ? (d.earnedSum / d.maxSum) * 100 : 100;
  if (!s.reward10 && s.attempts >= BASE_GOAL) {
    s.reward10 = true;
    s.reward10Amount = avg >= MIN_PASS_AVG ? 5 : 0;
  }
  if (!s.reward20 && s.attempts >= MILESTONE_2) {
    s.reward20 = true;
    s.reward20Amount = avg >= 80 ? 5 : avg >= MIN_PASS_AVG ? 2 : 0;
  }
  return s;
}

/* Ghi nhận một lượt (pct: 0–100). Trả { stat, event }:
   event = null | { type: 'reward', milestone: 10|20, stars, avg } | { type: 'redo', milestone: 10|20, avg } */
export function recordAttempt(stat, pct) {
  const s = { ...stat, scores: [...stat.scores, pct], attempts: stat.attempts + 1 };
  if (!s.reward10 && s.attempts >= BASE_GOAL) {
    const avg = avgOfScores(s.scores);
    if (avg < MIN_PASS_AVG) return { stat: { ...s, attempts: 0, scores: [] }, event: { type: 'redo', milestone: 10, avg } };
    return { stat: { ...s, reward10: true, reward10Amount: 5 }, event: { type: 'reward', milestone: 10, stars: 5, avg } };
  }
  if (!s.reward20 && s.attempts >= MILESTONE_2) {
    const avg = avgOfScores(s.scores);
    if (avg < MIN_PASS_AVG) return { stat: { ...s, attempts: 0, scores: [] }, event: { type: 'redo', milestone: 20, avg } };
    const stars = avg >= 80 ? 5 : 2;
    return { stat: { ...s, reward20: true, reward20Amount: stars }, event: { type: 'reward', milestone: 20, stars, avg } };
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
