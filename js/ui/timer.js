/* Đồng hồ đếm ngược theo thời điểm kết thúc (deadline) chứ không đếm từng giây, nên không bị
   chậm khi tab chạy nền và vẫn đúng sau khi tải lại trang. */
export function formatClock(sec) {
  const m = Math.floor(sec / 60), s = sec % 60;
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

export function secondsLeft(deadline) {
  return Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
}

export function startCountdown({ deadline, onTick, onEnd }) {
  let done = false;
  let handle = null;
  function tick() {
    if (done) return;
    const left = secondsLeft(deadline);
    onTick(left);
    if (left <= 0) {
      done = true;
      clearInterval(handle);
      onEnd();
    }
  }
  handle = setInterval(tick, 250);
  tick();
  return { stop() { done = true; clearInterval(handle); } };
}
