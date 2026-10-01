/* Trang bị của Tiệm Phép Thuật trên giao diện: giao diện (theme), avatar có khung, danh hiệu, huy hiệu.
   Firestore là nguồn chính; localStorage "moyumath_cosmetics" chỉ là bản cache để vẽ ngay khi tải trang
   (thẻ <script> trong <head> của index/practice/review/shop đọc theme từ đây để khỏi nháy màu).
   Trang kiểm tra (exam.html) không gọi applyTheme nên luôn giữ giấy trắng. */
import { local } from '../core/storage.js';
import { escapeHtml } from '../core/escape.js';
import {
  ITEM_BY_ID, CARD_BY_ID, PHOTO_AVATAR, isPhotoDataUrl, normalizeInventory, cosmeticsOf, statsFromLimitDocs, earnedStars, balanceOf,
} from '../runner/shop.js';
import { mergeLocalToday } from './study-timer.js';
import { resetPalette } from './confetti.js';

export const COSMETICS_KEY = 'moyumath_cosmetics';

export function cachedCosmetics() {
  return local.getJSON(COSMETICS_KEY) || {};
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme) root.dataset.theme = theme;
  else delete root.dataset.theme;
  resetPalette();
}

/* Lưu cache + áp theme theo kho vừa tải/vừa đổi. */
export function storeCosmetics(inv) {
  const c = cosmeticsOf(inv);
  local.setJSON(COSMETICS_KEY, c);
  applyTheme(c.theme);
  return c;
}

/* Tải kho từ Firestore, làm mới cache & theme. Trả về kho chuẩn hoá (null nếu lỗi mạng). */
export async function syncCosmetics(name) {
  if (!name) return null;
  try {
    const { loadShop } = await import('../core/firebase.js');
    const inv = normalizeInventory(await loadShop(name));
    storeCosmetics(inv);
    return inv;
  } catch (err) {
    console.error('Lỗi tải Tiệm Phép Thuật:', err);
    return null;
  }
}

/* Sao đã nhận (tiến độ luyện tập + thời gian học) và kho → { earned, inv, balance }. Lỗi thì ném ra. */
export async function loadWallet(name) {
  const fb = await import('../core/firebase.js');
  const [limitDocs, days, shop] = await Promise.all([fb.loadPracticeLimits(name), fb.loadStudyDays(name), fb.loadShop(name)]);
  const inv = normalizeInventory(shop);
  const earned = earnedStars(statsFromLimitDocs(limitDocs), mergeLocalToday(days, name));
  return { earned, inv, balance: balanceOf(earned, inv) };
}

/* Avatar tròn: ảnh bé tự tải lên, hoặc emoji thẻ linh vật đang dùng, không có thì chữ cái đầu của tên (chữ cuối của họ tên). */
export function avatarHTML(displayName, c = {}, size = 'md') {
  const frame = ITEM_BY_ID[c.frame]?.category === 'frame' ? ' ' + c.frame : '';
  const open = '<span class="avatar avatar-' + size + frame + '" aria-hidden="true">';
  if (c.avatar === PHOTO_AVATAR && isPhotoDataUrl(c.photo)) {
    return open + '<span class="avatar-face avatar-photo"><img src="' + escapeHtml(c.photo) + '" alt=""></span></span>';
  }
  const card = CARD_BY_ID[c.avatar];
  const words = String(displayName || '').trim().split(/\s+/);
  const face = card ? card.emoji : (words[words.length - 1] || '?').charAt(0).toUpperCase();
  return open + '<span class="avatar-face">' + escapeHtml(face) + '</span></span>';
}

/* Danh hiệu + huy hiệu đang dùng (chuỗi rỗng nếu chưa có gì). */
export function titleHTML(c = {}) {
  const title = ITEM_BY_ID[c.title];
  const badges = (c.badges || []).map((id) => ITEM_BY_ID[id]).filter(Boolean);
  return (title ? '<span class="id-title">' + escapeHtml(title.name) + '</span>' : '') +
    (badges.length ? '<span class="id-badges">' + badges.map((b) =>
      '<span title="' + escapeHtml(b.name) + '">' + escapeHtml(b.icon) + '</span>').join('') + '</span>' : '');
}

/* Avatar + (tên) + danh hiệu + huy hiệu. */
export function identityHTML({ displayName, cosmetics = cachedCosmetics(), size = 'md', withName = false }) {
  return '<span class="id-chip id-' + size + '">' + avatarHTML(displayName, cosmetics, size) +
    '<span class="id-text">' + (withName ? '<span class="id-name">' + escapeHtml(displayName || '—') + '</span>' : '') +
    titleHTML(cosmetics) + '</span></span>';
}
