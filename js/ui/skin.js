/* Giao diện nền (skin) miễn phí: "light" (sáng, mặc định) hoặc "night" (tối, nền than trung tính).
   Lưu theo máy ở localStorage.moyumath_skin; mỗi trang áp <html data-skin> ngay trong <head> để khỏi nháy màu.
   Nút đổi: mọi phần tử [data-skin-toggle] trong trang (module này tự gắn sự kiện khi được nạp).
   Theme mua ở Tiệm Phép Thuật (<html data-theme>) vẫn được ưu tiên hơn skin. */
import { local } from '../core/storage.js';

const KEY = 'moyumath_skin';
export const SKINS = [
  { id: 'night', icon: '🌙', name: 'Tối' },
  { id: 'light', icon: '☀️', name: 'Sáng' },
];

export function currentSkin() {
  return local.get(KEY) === 'night' ? 'night' : 'light';
}

export function setSkin(id) {
  const skin = SKINS.some((s) => s.id === id) ? id : 'light';
  local.set(KEY, skin);
  document.documentElement.dataset.skin = skin;
  renderToggles();
}

/* Nút hiện giao diện sẽ chuyển sang (bấm 🌙 Tối khi đang sáng và ngược lại). */
function renderToggles() {
  const next = SKINS.find((s) => s.id !== currentSkin());
  document.querySelectorAll('[data-skin-toggle]').forEach((btn) => {
    /* nút có [data-skin-label] (vd mục menu có icon) chỉ đổi phần chữ */
    const label = btn.querySelector('[data-skin-label]');
    if (label) label.textContent = 'Giao diện ' + next.name.toLowerCase();
    else btn.textContent = next.icon + ' ' + next.name;
    btn.title = 'Chuyển sang giao diện ' + next.name.toLowerCase();
    btn.setAttribute('aria-label', btn.title);
  });
}

document.querySelectorAll('[data-skin-toggle]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    setSkin(currentSkin() === 'night' ? 'light' : 'night');
  });
});
renderToggles();
