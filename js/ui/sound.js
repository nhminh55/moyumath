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
  star: [[G6, 0, 0.06, 0.07, 'sine'], [C7, 0.04, 0.14, 0.06, 'sine']], // một ngôi sao bay tới ô tổng sao
  /* Hiệu ứng chúc mừng mua ở Tiệm Phép Thuật (js/runner/shop.js, effect: fox | bird | formula | fireworks). */
  'celebrate-fox': [
    [620, 0, 0.09, 0.2, 'triangle', 1250], [1250, 0.08, 0.1, 0.14, 'triangle', 760],
    [700, 0.26, 0.09, 0.2, 'triangle', 1400], [1400, 0.34, 0.1, 0.14, 'triangle', 820],
    [560, 0.6, 0.55, 0.16, 'sine', 1150], [1150, 0.9, 0.35, 0.08, 'sine', 900],
  ],
  'celebrate-bird': [
    [2600, 0, 0.06, 0.12, 'sine', 3600], [3300, 0.07, 0.05, 0.1, 'sine', 2500],
    [2800, 0.14, 0.06, 0.12, 'sine', 3900], [3600, 0.21, 0.05, 0.1, 'sine', 2700],
    [2400, 0.45, 0.04, 0.1, 'sine', 3000], [2500, 0.5, 0.04, 0.1, 'sine', 3100], [2600, 0.55, 0.04, 0.1, 'sine', 3200],
    [2700, 0.6, 0.04, 0.1, 'sine', 3300], [3000, 0.68, 0.22, 0.12, 'sine', 4200],
  ],
  'celebrate-formula': [
    [C6, 0, 0.9, 0.16, 'sine'], [C7, 0, 0.5, 0.05, 'sine'],
    [E6, 0.14, 0.9, 0.15, 'sine'], [G6, 0.28, 0.9, 0.14, 'sine'],
    [C7, 0.42, 1.1, 0.13, 'sine'], [C7 * 2, 0.42, 0.6, 0.04, 'sine'],
  ],
  'celebrate-fireworks': [
    [160, 0, 0.5, 0.3, 'sine', 40], [90, 0.02, 0.4, 0.18, 'square', 30],
    [3200, 0.3, 0.03, 0.05, 'square'], [2600, 0.36, 0.03, 0.05, 'square'], [3600, 0.42, 0.03, 0.05, 'square'],
    [140, 0.55, 0.5, 0.26, 'sine', 35], [3000, 0.85, 0.03, 0.05, 'square'], [2400, 0.9, 0.03, 0.05, 'square'],
    [G6, 0.95, 0.5, 0.08, 'sine'],
  ],
};

/* Hiệu ứng chúc mừng đang dùng (cache trang bị của Tiệm Phép Thuật, xem js/ui/cosmetics.js). */
export function equippedEffect() {
  const effect = local.getJSON('moyumath_cosmetics')?.effect;
  return SOUNDS['celebrate-' + effect] ? effect : null;
}

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
  const effect = name === 'celebrate' ? equippedEffect() : null;
  play(SOUNDS[effect ? 'celebrate-' + effect : name]);
}

/* Nghe thử hiệu ứng ở cửa hàng (bất kể đang dùng hiệu ứng nào). effect = null → tiếng chúc mừng mặc định. */
export function playEffectPreview(effect) {
  play(SOUNDS['celebrate-' + effect] || SOUNDS.celebrate);
}

function play(notes) {
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
