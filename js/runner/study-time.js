/* Thời gian học mỗi ngày & mốc thưởng sao — thuần, test được bằng Node.
   Doc Firestore "Đã làm/{tên}/thời gian học/{YYYY-MM-DD}":
   { day, practiceSec, examSec, goal15?, goal30?, goal60?, studentName, updatedAt }
   goalN = số sao đã nhận ở mốc N phút (mỗi mốc chỉ thưởng một lần mỗi ngày). */

export const DAILY_GOALS = [
  { min: 15, stars: 1 },
  { min: 30, stars: 2 },
  { min: 60, stars: 3 },
];
export const IDLE_LIMIT_SEC = 180; // không chạm/gõ quá 3 phút thì ngừng tính giờ
export const MAX_TICK_SEC = 5;     // máy ngủ/tab treo không được cộng dồn

const goalField = (g) => 'goal' + g.min;

/* Ngày theo giờ máy của học sinh (không dùng UTC để "hôm nay" khớp với nửa đêm thật). */
export function dayKey(date = new Date()) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

export function daySeconds(d) {
  return d ? (d.practiceSec || 0) + (d.examSec || 0) : 0;
}

/* goals: { 15: 1, 30: 2 } (số sao đã nhận theo mốc phút) ⇄ field Firestore goal15, goal30... */
export function goalsFromDoc(d) {
  const goals = {};
  for (const g of DAILY_GOALS) {
    const v = d?.[goalField(g)];
    if (v) goals[g.min] = typeof v === 'number' ? v : g.stars;
  }
  return goals;
}

export function goalFields(goals) {
  const out = {};
  for (const g of DAILY_GOALS) if (goals[g.min]) out[goalField(g)] = goals[g.min];
  return out;
}

/* Các mốc vừa đạt (đủ giây nhưng chưa nhận thưởng). */
export function newlyReached(sec, goals) {
  return DAILY_GOALS.filter((g) => sec >= g.min * 60 && !goals[g.min]);
}

export function nextGoal(sec) {
  return DAILY_GOALS.find((g) => sec < g.min * 60) || null;
}

export function starsOfGoals(goals) {
  return Object.values(goals).reduce((s, n) => s + (Number(n) || 0), 0);
}

/* days: { 'YYYY-MM-DD': doc } */
export function studyStars(days) {
  return Object.values(days).reduce((s, d) => s + starsOfGoals(goalsFromDoc(d)), 0);
}

/* Chuỗi ngày liên tiếp đạt mốc đầu tiên (15 phút), tính tới hôm nay —
   hôm nay chưa đạt thì chuỗi vẫn giữ từ hôm qua. */
export function streakDays(days, today = new Date()) {
  const minSec = DAILY_GOALS[0].min * 60;
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (daySeconds(days[dayKey(d)]) < minSec) d.setDate(d.getDate() - 1);
  let n = 0;
  while (daySeconds(days[dayKey(d)]) >= minSec) {
    n++;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

/* 754 → "12:34", 3723 → "1:02:03" */
export function formatStudyClock(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const mm = String(m).padStart(h ? 2 : 1, '0'), ss = String(s).padStart(2, '0');
  return h ? h + ':' + mm + ':' + ss : mm + ':' + ss;
}

/* 754 → "12 phút", 3900 → "1 giờ 5 phút" */
export function formatMinutes(sec) {
  const total = Math.floor(Math.max(0, sec) / 60), h = Math.floor(total / 60), m = total % 60;
  return h ? h + ' giờ' + (m ? ' ' + m + ' phút' : '') : m + ' phút';
}
