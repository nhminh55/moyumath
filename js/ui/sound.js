/* Hiệu ứng âm thanh tổng hợp bằng Web Audio (không cần file âm thanh).
   Bật/tắt lưu ở localStorage "moyumath_sound" ('off' = tắt). AudioContext chỉ được tạo ở lần
   phát đầu tiên (thường là trong một cú bấm), nên không vướng chặn tự phát của trình duyệt. */
import { local } from '../core/storage.js';

const KEY = 'moyumath_sound';
const MASTER = 0.35;

/* Mỗi âm: [tần số Hz, lúc bắt đầu (s), độ dài (s), âm lượng, dạng sóng?, trượt tới Hz?] */
const C5 = 523.25, E5 = 659.25, G5 = 783.99, C6 = 1046.5, E6 = 1318.5, G6 = 1568, C7 = 2093;
const SOUNDS = {
  click: [[1250, 0, 0.045, 0.09, 'sine', 900]],
  submit: [[440, 0, 0.12, 0.22, 'triangle', 660], [880, 0.1, 0.18, 0.18, 'sine']],
  correct: [[C6, 0, 0.14, 0.2, 'triangle'], [E6, 0.08, 0.14, 0.2, 'triangle'], [G6, 0.16, 0.26, 0.2, 'triangle']],
  partial: [[E5, 0, 0.14, 0.18, 'triangle'], [G5, 0.1, 0.22, 0.16, 'triangle']],
  wrong: [[311, 0, 0.16, 0.18, 'triangle', 290], [233, 0.14, 0.3, 0.18, 'triangle', 208]],
  celebrate: [
    [C5, 0, 0.14, 0.2, 'triangle'], [E5, 0.1, 0.14, 0.2, 'triangle'], [G5, 0.2, 0.14, 0.2, 'triangle'],
    [C6, 0.3, 0.55, 0.22, 'triangle'], [E6, 0.3, 0.55, 0.12, 'sine'],
    [C7, 0.48, 0.25, 0.07, 'sine'], [G6 * 1.5, 0.58, 0.3, 0.06, 'sine'],
  ],
  goal: [[E6, 0, 0.5, 0.16, 'sine'], [G6, 0.12, 0.5, 0.14, 'sine'], [C7, 0.24, 0.7, 0.12, 'sine']],
};

let ctx = null, out = null;

export function soundEnabled() {
  return local.get(KEY) !== 'off';
}

export function setSoundEnabled(on) {
  local.set(KEY, on ? 'on' : 'off');
}

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    out = ctx.createGain();
    out.gain.value = MASTER;
    out.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

export function playSound(name) {
  const notes = SOUNDS[name];
  if (!notes || !soundEnabled()) return;
  try {
    const ac = audio();
    if (!ac) return;
    const now = ac.currentTime + 0.01;
    for (const [freq, start, dur, gain, type = 'sine', slideTo] of notes) {
      const t = now + start;
      const osc = ac.createOscillator(), env = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      env.gain.setValueAtTime(0.0001, t);
      env.gain.exponentialRampToValueAtTime(gain, t + 0.012);
      env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(env).connect(out);
      osc.start(t);
      osc.stop(t + dur + 0.03);
    }
  } catch { /* âm thanh chỉ là phần phụ — lỗi thì bỏ qua */ }
}

/* Tiếng "tách" nhẹ khi bấm nút. Nút có thuộc tính data-sound tự phát âm riêng (Đáp án, Nộp bài...). */
export function bindClickSounds(root = document) {
  root.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest('button, .picker-btn');
    if (btn && !btn.disabled && !btn.hasAttribute('data-sound')) playSound('click');
  });
}

/* Nút bật/tắt âm thanh: 🔊 / 🔇 */
export function createSoundToggle() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'sound-toggle';
  btn.dataset.sound = 'self';
  const paint = () => {
    const on = soundEnabled();
    btn.textContent = on ? '🔊' : '🔇';
    btn.title = on ? 'Tắt âm thanh' : 'Bật âm thanh';
    btn.setAttribute('aria-label', btn.title);
    btn.setAttribute('aria-pressed', String(on));
  };
  btn.addEventListener('click', () => {
    setSoundEnabled(!soundEnabled());
    paint();
    playSound('click');
  });
  paint();
  return btn;
}
