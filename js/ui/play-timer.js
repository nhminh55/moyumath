/* Giờ chơi trò chơi (js/runner/play-time.js) trên trình duyệt.
   - Trạng thái hôm nay ở localStorage "moyumath_play" = { name, day, used, pending }: used = tổng giây đã chơi hôm nay
     (đọc–sửa–ghi mỗi giây nên mở nhiều tab vẫn trừ đúng), pending = phần chưa lưu, cộng dồn lên Firestore (playSec)
     mỗi 15 giây, khi rời tab và khi hết lượt.
   - Lượt chơi thử miễn phí của trò vừa mua (trialLedger) ghi thẳng vào trialSec của kho, không đụng playSec.
   - Chỉ đếm khi tab đang hiện. */
import { local } from '../core/storage.js';
import { dayKey, daySeconds } from '../runner/study-time.js';
import { playLeftSec } from '../runner/play-time.js';
import { mergeLocalToday } from './study-timer.js';

const KEY = 'moyumath_play';
const FLUSH_EVERY_MS = 15000;
const MAX_TICK_SEC = 5;

export function readLocalPlay(name) {
  const s = local.getJSON(KEY);
  return s && s.name === name && typeof s.used === 'number' && typeof s.pending === 'number' ? s : null;
}

/* Giây đã chơi hôm nay: Firestore + phần trên máy này chưa kịp lưu. */
export function playedToday(days, name, today = dayKey()) {
  const remote = days[today]?.playSec || 0;
  const s = readLocalPlay(name);
  return s && s.day === today ? Math.max(s.used, remote + s.pending) : remote;
}

/* days = doc thời gian học tải thẳng từ Firestore (chưa gộp phần local) → { studySec, playedSec, leftSec } của hôm nay. */
export function playStatus(days, name, today = dayKey()) {
  const studySec = daySeconds(mergeLocalToday(days, name, today)[today]);
  const playedSec = playedToday(days, name, today);
  return { studySec, playedSec, leftSec: playLeftSec(studySec, playedSec) };
}

function flush(name, s = readLocalPlay(name)) {
  if (!s) return;
  const sec = Math.floor(s.pending);
  if (sec <= 0) return;
  s.pending -= sec;
  local.setJSON(KEY, s);
  const { day } = s;
  import('../core/firebase.js').then((m) => m.addPlayTime(name, day, sec)).catch((err) => {
    console.error('Lỗi lưu giờ chơi:', err);
    const cur = readLocalPlay(name);
    if (cur && cur.day === day) {
      cur.pending += sec;
      local.setJSON(KEY, cur);
    }
  });
}

/* Sổ giờ chơi trong ngày: trừ vào playSec của hôm nay. remotePlayed = playSec vừa tải từ Firestore. */
export function dailyLedger(name, day, remotePlayed = 0) {
  let s = readLocalPlay(name);
  if (s && s.day !== day) flush(name, s);
  if (!s || s.day !== day) s = { name, day, used: 0, pending: 0 };
  s.used = Math.max(s.used, remotePlayed + s.pending);
  local.setJSON(KEY, s);
  return {
    add(dt) {
      let cur = readLocalPlay(name);
      if (!cur || cur.day !== day) cur = { name, day, used: s.used, pending: 0 };
      cur.used += dt;
      cur.pending += dt;
      local.setJSON(KEY, cur);
    },
    flush: () => flush(name),
  };
}

/* Sổ chơi thử miễn phí của trò vừa mua: cộng vào trialSec[gameId] trong kho, không trừ giờ chơi trong ngày. */
export function trialLedger(name, gameId) {
  let pending = 0;
  return {
    add(dt) { pending += dt; },
    flush() {
      const sec = Math.floor(pending);
      if (sec <= 0) return;
      pending -= sec;
      import('../core/firebase.js').then((m) => m.addTrialTime(name, gameId, sec)).catch((err) => {
        console.error('Lỗi lưu giờ chơi thử:', err);
        pending += sec;
      });
    },
  };
}

/* Một lượt chơi dài limitSec giây (ngày `day`), ghi vào `ledger` (dailyLedger / trialLedger).
   onTick(giây còn lại), onEnd() khi hết giờ hoặc sang ngày mới. → { stop() } */
export function startPlayClock({ ledger, day, limitSec, onTick = () => {}, onEnd = () => {} }) {
  let elapsed = 0, lastTick = Date.now(), stopped = false;
  const onVisibility = () => {
    if (document.visibilityState === 'hidden') ledger.flush();
    lastTick = Date.now();
  };
  const onHide = () => ledger.flush();

  function stop() {
    if (stopped) return;
    stopped = true;
    clearInterval(tickTimer);
    clearInterval(flushTimer);
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', onHide);
    ledger.flush();
  }

  function tick() {
    const now = Date.now();
    const dt = Math.min((now - lastTick) / 1000, MAX_TICK_SEC);
    lastTick = now;
    if (dayKey() !== day) { stop(); onEnd(); return; }
    if (document.visibilityState === 'visible') {
      elapsed += dt;
      ledger.add(dt);
    }
    const left = Math.max(0, limitSec - elapsed);
    onTick(left);
    if (left <= 0) { stop(); onEnd(); }
  }

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onHide);
  const tickTimer = setInterval(tick, 1000);
  const flushTimer = setInterval(() => ledger.flush(), FLUSH_EVERY_MS);
  ledger.flush(); // phần còn lại từ lần trước (nếu có)
  onTick(limitSec);
  return { stop };
}
