/* Pháo giấy (confetti) vẽ trên một canvas phủ toàn màn hình, không chặn bấm chuột.
   Tôn trọng prefers-reduced-motion: khi người dùng tắt chuyển động thì không bắn. */
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

/* Bắn một chùm từ (x, y) theo hướng angle (độ, -90 = thẳng lên). */
export function burst({ x = innerWidth / 2, y = innerHeight / 2, count = 40, angle = -90, spread = 70, power = 11 } = {}) {
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
  ensureCanvas();
  const cs = colors();
  for (let i = 0; i < count; i++) {
    const a = ((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
    const v = power * (0.55 + Math.random() * 0.6);
    parts.push({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
      rot: Math.random() * Math.PI, spin: (Math.random() - 0.5) * 0.3,
      size: 6 + Math.random() * 6, round: Math.random() < 0.25,
      color: cs[(Math.random() * cs.length) | 0], age: 0, wobble: Math.random() * 10,
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

/* Màn chúc mừng lớn: hai góc dưới bắn chéo vào giữa, ba đợt. */
export function celebrate() {
  const fire = () => {
    burst({ x: 0, y: innerHeight, angle: -60, spread: 40, count: 70, power: 19 });
    burst({ x: innerWidth, y: innerHeight, angle: -120, spread: 40, count: 70, power: 19 });
  };
  fire();
  setTimeout(fire, 350);
  setTimeout(() => burst({ x: innerWidth / 2, y: innerHeight * 0.35, angle: -90, spread: 360, count: 90, power: 9 }), 700);
}
