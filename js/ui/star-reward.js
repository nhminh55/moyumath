/* Hiệu ứng nhận sao: nhãn "+N ⭐" bật lên ở chỗ vừa được thưởng, các ngôi sao bay theo đường cong về
   ô tổng sao (nếu trang có), ô tổng sao nảy lên kèm tiếng "ting" và đếm tăng dần tới số mới.
   Tôn trọng prefers-reduced-motion: chỉ hiện nhãn, không bay, số đổi ngay. */
import { playSound } from './sound.js';

const MAX_SPRITES = 10, FLIGHT_MS = 800, STAGGER_MS = 90, STEPS = 18;

const reducedMotion = () => !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

function centerOf(el) {
  const r = el?.getBoundingClientRect?.();
  return r && (r.width || r.height) ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
}

function popLabel(at, amount) {
  const el = document.createElement('div');
  el.className = 'star-pop';
  el.setAttribute('aria-hidden', 'true');
  el.textContent = '+' + amount + ' ⭐';
  el.style.left = at.x + 'px';
  el.style.top = at.y + 'px';
  document.body.append(el);
  el.addEventListener('animationend', () => el.remove());
  setTimeout(() => el.remove(), 3000); // phòng khi animation không chạy
}

/* Một ngôi sao bay từ `from` tới `to` theo đường cong bậc hai, xoay một vòng, nhỏ dần khi tới nơi. */
function fly(from, to, i) {
  const el = document.createElement('span');
  el.className = 'star-fly';
  el.setAttribute('aria-hidden', 'true');
  el.textContent = '⭐';
  document.body.append(el);
  const ctrl = {
    x: (from.x + to.x) / 2 + (Math.random() - 0.5) * 220,
    y: Math.min(from.y, to.y) - 60 - Math.random() * 120,
  };
  const frames = [];
  for (let k = 0; k <= STEPS; k++) {
    const t = ease(k / STEPS), u = 1 - t;
    const x = u * u * from.x + 2 * u * t * ctrl.x + t * t * to.x;
    const y = u * u * from.y + 2 * u * t * ctrl.y + t * t * to.y;
    const scale = k === 0 ? 0.3 : 1.4 - 0.8 * t;
    frames.push({ transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale}) rotate(${t * 360}deg)`, opacity: k === STEPS ? 0.5 : 1 });
  }
  const anim = el.animate(frames, { duration: FLIGHT_MS, delay: i * STAGGER_MS, easing: 'linear', fill: 'backwards' });
  return anim.finished.finally(() => el.remove());
}

function bump(target) {
  target.classList.remove('star-bump');
  void target.offsetWidth; // chạy lại hiệu ứng
  target.classList.add('star-bump');
}

/* source: phần tử nơi sao xuất hiện (nút "Kiểm tra", ô thời gian học...); target: ô tổng sao (có thể null).
   Gọi TRƯỚC countTo() để số trên ô tổng sao chờ sao bay tới rồi mới tăng. */
export function rewardStars({ source, target, amount }) {
  if (!(amount > 0)) return;
  const from = centerOf(source) || { x: innerWidth / 2, y: innerHeight / 2 };
  popLabel(from, amount);
  const to = centerOf(target);
  if (!to || reducedMotion() || !document.body.animate) return;
  const n = Math.min(amount, MAX_SPRITES), now = performance.now();
  target._starArrive = now + FLIGHT_MS;
  target._starDone = now + FLIGHT_MS + (n - 1) * STAGGER_MS;
  for (let i = 0; i < n; i++) {
    fly(from, to, i).then(() => { bump(target); playSound('star'); }, () => {});
  }
}

/* Đặt số trên ô tổng sao; nếu tăng ngay sau rewardStars() thì đếm dần theo nhịp sao bay tới
   (tăng vì lý do khác — vd. vừa tải xong sao thời gian học — thì đổi ngay). */
export function countTo(el, value, format = String) {
  cancelAnimationFrame(el._starRaf);
  const shown = el._starShown, now = performance.now();
  if (shown === undefined || value <= shown || !(now < (el._starDone || 0) + 500)) {
    el._starShown = value;
    el.textContent = format(value);
    return;
  }
  const start = Math.max(now, el._starArrive || 0);
  const duration = Math.max(500, (el._starDone || 0) - start);
  const tick = (t) => {
    const p = Math.min(1, Math.max(0, (t - start) / duration));
    el._starShown = Math.round(shown + (value - shown) * p);
    el.textContent = format(el._starShown);
    if (p < 1) el._starRaf = requestAnimationFrame(tick);
  };
  el._starRaf = requestAnimationFrame(tick);
}
