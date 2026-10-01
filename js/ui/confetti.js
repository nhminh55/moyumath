/* Pháo giấy (confetti) vẽ trên một canvas phủ toàn màn hình, không chặn bấm chuột.
   Tôn trọng prefers-reduced-motion: khi người dùng tắt chuyển động thì không bắn.
   celebrate() đổi kiểu theo hiệu ứng mua ở Tiệm Phép Thuật (equippedEffect trong sound.js). */
import { equippedEffect } from './sound.js';

const GRAVITY = 0.32, DRAG = 0.985, LIFE = 150; // khung hình (~2,5 giây)

let canvas = null, ctx2d = null, parts = [], frame = 0, palette = null;

function colors() {
  if (!palette) {
    const css = getComputedStyle(document.documentElement);
    const v = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
    palette = [v('--gold', '#4F46E5'), v('--pen-green', '#059669'), v('--pen-red', '#E11D48'), '#F59E0B', '#0EA5E9', '#EC4899'];
  }
  return palette;
}

/* Đổi giao diện (theme) thì màu token đổi theo — đọc lại ở lần bắn sau. */
export function resetPalette() {
  palette = null;
}

function ensureCanvas() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.append(canvas);
  ctx2d = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function step() {
  ctx2d.clearRect(0, 0, innerWidth, innerHeight);
  parts = parts.filter((p) => p.age < LIFE && p.y < innerHeight + 40);
  for (const p of parts) {
    p.age++;
    p.vx *= DRAG;
    p.vy = p.vy * DRAG + GRAVITY;
    p.x += p.vx + Math.sin((p.age + p.wobble) / 8) * 0.6;
    p.y += p.vy;
    p.rot += p.spin;
    ctx2d.save();
    ctx2d.globalAlpha = Math.min(1, (LIFE - p.age) / 30);
    ctx2d.translate(p.x, p.y);
    if (p.text) { // ký hiệu / emoji: chỉ nghiêng nhẹ, không lật
      ctx2d.rotate(Math.sin(p.rot) * 0.4);
      ctx2d.fillStyle = p.color;
      ctx2d.font = '600 ' + Math.round(p.size * 2.2) + 'px Lora, serif';
      ctx2d.textAlign = 'center';
      ctx2d.textBaseline = 'middle';
      ctx2d.fillText(p.text, 0, 0);
      ctx2d.restore();
      continue;
    }
    ctx2d.rotate(p.rot);
    ctx2d.scale(1, Math.cos(p.age / 6 + p.wobble)); // lật mặt giấy
    ctx2d.fillStyle = p.color;
    if (p.round) { ctx2d.beginPath(); ctx2d.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx2d.fill(); }
    else ctx2d.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    ctx2d.restore();
  }
  frame = parts.length ? requestAnimationFrame(step) : 0;
  if (!parts.length) ctx2d.clearRect(0, 0, innerWidth, innerHeight);
}

/* Bắn một chùm từ (x, y) theo hướng angle (độ, -90 = thẳng lên).
   colors: thay bảng màu; texts: một phần mảnh là ký hiệu/emoji (tỉ lệ textRatio); round: toàn mảnh tròn. */
export function burst({
  x = innerWidth / 2, y = innerHeight / 2, count = 40, angle = -90, spread = 70, power = 11,
  colors: cs = colors(), texts = null, textRatio = 0.35, round = false,
} = {}) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  ensureCanvas();
  for (let i = 0; i < count; i++) {
    const a = ((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
    const v = power * (0.55 + Math.random() * 0.6);
    parts.push({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      rot: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 0.3,
      size: 6 + Math.random() * 6, round: round || Math.random() < 0.25,
      color: cs[(Math.random() * cs.length) | 0], age: 0, wobble: Math.random() * 10,
      text: texts && Math.random() < textRatio ? texts[(Math.random() * texts.length) | 0] : null,
    });
  }
  if (!frame) frame = requestAnimationFrame(step);
}

/* Chùm nhỏ bắn lên từ một phần tử (vd. nút "Đáp án"). */
export function burstFrom(el, opts = {}) {
  const r = el?.getBoundingClientRect?.();
  if (!r) return burst(opts);
  burst({ x: r.left + r.width / 2, y: r.top + r.height / 2, count: 34, spread: 80, power: 10, ...opts });
}

/* Hai góc dưới bắn chéo vào giữa, ba đợt (opts thêm màu/ký hiệu theo hiệu ứng). */
function crossfire(opts = {}) {
  const fire = () => {
    burst({ x: 0, y: innerHeight, angle: -60, spread: 40, count: 70, power: 19, ...opts });
    burst({ x: innerWidth, y: innerHeight, angle: -120, spread: 40, count: 70, power: 19, ...opts });
  };
  fire();
  setTimeout(fire, 350);
  setTimeout(() => burst({ x: innerWidth / 2, y: innerHeight * 0.35, angle: -90, spread: 360, count: 90, power: 9, ...opts }), 700);
}

const STYLES = {
  fox: () => crossfire({ colors: ['#F97316', '#FB923C', '#FDBA74', '#EA580C', '#B45309', '#FEF3C7'], texts: ['🦊', '🍂', '🍁'], textRatio: 0.12 }),
  bird: () => crossfire({ colors: ['#22C55E', '#84CC16', '#FACC15', '#38BDF8', '#A3E635'], texts: ['🐦', '🪶', '🍃'], textRatio: 0.12 }),
  /* Mưa công thức: ký hiệu toán rơi từ mép trên xuống, ba đợt. */
  formula: () => {
    const texts = ['π', '√', 'Σ', '∞', '÷', '×', 'x²', '≈', '±', '∛'];
    const rain = () => {
      for (let i = 0; i < 6; i++) {
        burst({ x: (innerWidth * (i + 0.5)) / 6, y: -20, angle: 90, spread: 50, count: 14, power: 4, texts, textRatio: 0.85 });
      }
    };
    rain();
    setTimeout(rain, 450);
    setTimeout(rain, 900);
  },
  /* Pháo hoa: các chùm tròn nổ toả 360° ở những điểm ngẫu nhiên giữa trời. */
  fireworks: () => {
    const sets = [['#F43F5E', '#FDA4AF', '#FFF1F2'], ['#FACC15', '#FDE68A', '#FFFFFF'], ['#38BDF8', '#A5F3FC', '#E0F2FE'], ['#A78BFA', '#DDD6FE', '#F5F3FF']];
    for (let i = 0; i < 6; i++) {
      setTimeout(() => burst({
        x: innerWidth * (0.15 + Math.random() * 0.7), y: innerHeight * (0.15 + Math.random() * 0.35),
        angle: -90, spread: 360, count: 60, power: 8, round: true, colors: sets[i % sets.length],
      }), i * 260);
    }
  },
};

/* Màn chúc mừng lớn. style = hiệu ứng ở Tiệm Phép Thuật (mặc định: hiệu ứng đang dùng; không có thì pháo giấy). */
export function celebrate(style = equippedEffect()) {
  (STYLES[style] || crossfire)();
}
