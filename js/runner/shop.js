/* Tiệm Phép Thuật — danh mục vật phẩm, thẻ sưu tầm & quy tắc mua/mở gói/đổi thẻ. Thuần, test được bằng Node.
   Doc Firestore "Đã làm/{tên}/tiệm phép thuật/kho":
   { spent, owned[], equipped: { title, badges[], frame, theme, effect, avatar }, cards: { cardId: số lượng },
     packsOpened, photo, studentName, updatedAt }
   photo = ảnh đại diện bé tự tải lên (data URL JPEG nhỏ, miễn phí); equipped.avatar = PHOTO_AVATAR thì dùng ảnh này.
   Sao còn lại = sao đã nhận (stars.js + study-time.js, không lưu riêng) − spent.
   KHÔNG đổi id vật phẩm / thẻ đã phát hành: chúng là khoá trong Firestore. */
import { BASE_GOAL, statFromDoc, isLegacyDoc, migrateLegacy, totalStars } from './stars.js';
import { studyStars } from './study-time.js';

export const PACK_PRICE = 15;
export const PACK_SIZE = 3;
export const TRADE_COST = 5;   // 5 thẻ trùng → 1 thẻ chưa có
export const MAX_BADGES = 3;
export const PHOTO_AVATAR = 'photo';   // equipped.avatar = ảnh tự tải lên
export const MAX_PHOTO_LENGTH = 100000; // ký tự data URL (~75 KB) — ảnh 128×128 thực tế chỉ ~5–10 KB

/* Chỉ nhận data URL ảnh base64 (không nhận link ngoài / chuỗi lạ vì sẽ được đặt vào src của <img>). */
export function isPhotoDataUrl(s) {
  return typeof s === 'string' && s.length <= MAX_PHOTO_LENGTH && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(s);
}

export const CATEGORIES = [
  { id: 'title', name: 'Danh hiệu', icon: '🏷️' },
  { id: 'badge', name: 'Huy hiệu', icon: '🎖️' },
  { id: 'frame', name: 'Khung avatar', icon: '🖼️' },
  { id: 'theme', name: 'Giao diện', icon: '🎨' },
  { id: 'effect', name: 'Hiệu ứng chúc mừng', icon: '🎉' },
];

/* Danh mục: price theo khung giá của từng loại (tests/shop.test.mjs kiểm tra). */
export const ITEMS = [
  { id: 'title-tan-binh', category: 'title', name: 'Tân binh Toán học', price: 10 },
  { id: 'title-tho-san-so-nguyen', category: 'title', name: 'Thợ săn Số nguyên', price: 12 },
  { id: 'title-hiep-si-phuong-trinh', category: 'title', name: 'Hiệp sĩ Phương trình', price: 15 },
  { id: 'title-phu-thuy-lam-tron', category: 'title', name: 'Phù thủy Làm tròn', price: 18 },
  { id: 'title-dai-phap-su', category: 'title', name: 'Đại pháp sư Moyu', price: 20 },

  { id: 'badge-cham-chi', category: 'badge', name: 'Chăm chỉ', icon: '🔥', price: 10 },
  { id: 'badge-chinh-xac', category: 'badge', name: 'Chính xác', icon: '🎯', price: 10 },
  { id: 'badge-tu-duy', category: 'badge', name: 'Tư duy', icon: '🧠', price: 12 },
  { id: 'badge-cu-dem', category: 'badge', name: 'Cú đêm', icon: '🦉', price: 12 },
  { id: 'badge-toc-do', category: 'badge', name: 'Tốc độ', icon: '⚡', price: 15 },
  { id: 'badge-ngoi-sao', category: 'badge', name: 'Ngôi sao', icon: '🌟', price: 15 },

  { id: 'frame-gold', category: 'frame', name: 'Viền vàng', price: 25, desc: 'Viền vàng óng ánh' },
  { id: 'frame-rainbow', category: 'frame', name: 'Cầu vồng', price: 30, desc: 'Vòng cầu vồng xoay chậm' },
  { id: 'frame-neon', category: 'frame', name: 'Neon rực lửa', price: 35, desc: 'Viền neon phát sáng nhấp nháy' },
  { id: 'frame-laurel', category: 'frame', name: 'Vòng nguyệt quế', price: 35, desc: 'Nguyệt quế của nhà vô địch' },
  { id: 'frame-galaxy', category: 'frame', name: 'Hào quang thiên hà', price: 40, desc: 'Hào quang tím xanh lấp lánh' },

  { id: 'theme-pastel', category: 'theme', theme: 'pastel', name: 'Sweet Pastel', price: 40, desc: 'Hồng phấn & tím oải hương', swatch: ['#FFF5FA', '#A26BE0', '#E5487A'] },
  { id: 'theme-ocean', category: 'theme', theme: 'ocean', name: 'Ocean Breeze', price: 45, desc: 'Gió biển xanh mát', swatch: ['#F0F8FB', '#0284C7', '#0E9F8E'] },
  { id: 'theme-forest', category: 'theme', theme: 'forest', name: 'Forest Notebook', price: 45, desc: 'Sổ tay giữa rừng xanh', swatch: ['#F5F7EE', '#4D7C0F', '#C2410C'] },
  { id: 'theme-cyberpunk', category: 'theme', theme: 'cyberpunk', name: 'Midnight Cyberpunk', price: 55, desc: 'Nền tối, neon hồng & xanh', swatch: ['#0B0B1A', '#00E5FF', '#FF3D81'] },
  { id: 'theme-space', category: 'theme', theme: 'space', name: 'Deep Space Canvas', price: 60, desc: 'Bầu trời sao giữa vũ trụ', swatch: ['#070B1F', '#8B9CFF', '#4ADE9B'] },

  { id: 'effect-fox', category: 'effect', effect: 'fox', name: 'Cáo nhỏ', icon: '🦊', price: 20, desc: 'Tiếng cáo con kêu "yip yip" + lá thu' },
  { id: 'effect-bird', category: 'effect', effect: 'bird', name: 'Chim hót', icon: '🐦', price: 20, desc: 'Tiếng chim líu lo + lông vũ' },
  { id: 'effect-formula', category: 'effect', effect: 'formula', name: 'Mưa công thức', icon: '∑', price: 25, desc: 'Tiếng chuông + mưa π √ Σ ∞' },
  { id: 'effect-fireworks', category: 'effect', effect: 'fireworks', name: 'Pháo hoa', icon: '🎆', price: 30, desc: 'Pháo hoa nổ giữa trời' },
];

export const PRICE_RANGES = {
  title: [10, 20], badge: [10, 20], frame: [25, 40], theme: [40, 60], effect: [20, 30],
};

export const RARITIES = [
  { id: 'common', name: 'Thường', weight: 60 },
  { id: 'rare', name: 'Hiếm', weight: 28 },
  { id: 'epic', name: 'Sử thi', weight: 10 },
  { id: 'legendary', name: 'Huyền thoại', weight: 2 },
];
const RANK = Object.fromEntries(RARITIES.map((r, i) => [r.id, i]));

/* Thẻ sưu tầm: kind 'formula' (công thức trong Chương 1–4) hoặc 'mascot' (đặt làm avatar được). */
export const CARDS = [
  { id: 'card-int-sign', kind: 'formula', rarity: 'common', emoji: '➖', name: 'Quy tắc dấu', formula: '(−a) · (−b) = a · b', fact: 'Nhân (chia) hai số nguyên âm được số nguyên dương.' },
  { id: 'card-order-ops', kind: 'formula', rarity: 'common', emoji: '🧮', name: 'Thứ tự phép tính', formula: '( ) → lũy thừa → × : → + −', fact: 'Làm trong ngoặc trước, rồi lũy thừa, rồi nhân chia, cuối cùng cộng trừ.' },
  { id: 'card-power-mul', kind: 'formula', rarity: 'common', emoji: '✖️', name: 'Nhân lũy thừa', formula: 'aᵐ · aⁿ = aᵐ⁺ⁿ', fact: 'Cùng cơ số: giữ cơ số, cộng số mũ.' },
  { id: 'card-power-div', kind: 'formula', rarity: 'common', emoji: '➗', name: 'Chia lũy thừa', formula: 'aᵐ : aⁿ = aᵐ⁻ⁿ', fact: 'Cùng cơ số: giữ cơ số, trừ số mũ.' },
  { id: 'card-sqrt', kind: 'formula', rarity: 'common', emoji: '√', name: 'Căn bậc hai', formula: '√49 = 7 vì 7² = 49', fact: 'Căn bậc hai của một số chính phương là một số nguyên.' },
  { id: 'card-round', kind: 'formula', rarity: 'common', emoji: '🎯', name: 'Làm tròn', formula: '3,46 ≈ 3,5', fact: 'Chữ số bỏ đi ≥ 5 thì làm tròn lên, < 5 thì giữ nguyên.' },
  { id: 'card-expand', kind: 'formula', rarity: 'common', emoji: '📦', name: 'Khai triển', formula: 'a(b + c) = ab + ac', fact: 'Nhân số ngoài ngoặc với từng số hạng trong ngoặc.' },
  { id: 'card-decimal-10', kind: 'formula', rarity: 'common', emoji: '🔟', name: 'Nhân với 10', formula: '3,14 × 10 = 31,4', fact: 'Nhân với 10 thì dấu phẩy dời sang phải 1 chữ số.' },
  { id: 'card-cat-pi', kind: 'mascot', rarity: 'common', emoji: '🐱', name: 'Mèo Pi', fact: 'Mèo Pi thuộc lòng π = 3,14159… và luôn làm tròn đúng.' },
  { id: 'card-owl', kind: 'mascot', rarity: 'common', emoji: '🦉', name: 'Cú Thông thái', fact: 'Cú thức khuya giải phương trình, sáng ra kiểm tra lại nghiệm.' },

  { id: 'card-power-power', kind: 'formula', rarity: 'rare', emoji: '🔁', name: 'Lũy thừa của lũy thừa', formula: '(aᵐ)ⁿ = aᵐ·ⁿ', fact: 'Lũy thừa chồng lũy thừa: nhân các số mũ.' },
  { id: 'card-gcd-lcm', kind: 'formula', rarity: 'rare', emoji: '🔗', name: 'ƯCLN × BCNN', formula: 'ƯCLN(a, b) · BCNN(a, b) = a · b', fact: 'Đúng với mọi cặp số nguyên dương a, b.' },
  { id: 'card-cbrt', kind: 'formula', rarity: 'rare', emoji: '🧊', name: 'Căn bậc ba', formula: '∛(−27) = −3', fact: 'Khác căn bậc hai, căn bậc ba của số âm vẫn có nghĩa.' },
  { id: 'card-linear', kind: 'formula', rarity: 'rare', emoji: '⚖️', name: 'Phương trình bậc nhất', formula: 'ax + b = c ⇒ x = (c − b) : a', fact: 'Giữ hai vế cân bằng: làm gì vế này thì làm y vậy vế kia.' },
  { id: 'card-sig-figs', kind: 'formula', rarity: 'rare', emoji: '🔬', name: 'Chữ số có nghĩa', formula: '0,00350 → 3 chữ số có nghĩa', fact: 'Các số 0 đứng đầu không phải chữ số có nghĩa.' },
  { id: 'card-fox', kind: 'mascot', rarity: 'rare', emoji: '🦊', name: 'Cáo Moyu', fact: 'Cáo Moyu nhanh trí, nhẩm ước lượng trước rồi mới tính.' },
  { id: 'card-panda', kind: 'mascot', rarity: 'rare', emoji: '🐼', name: 'Gấu trúc Làm tròn', fact: 'Gấu trúc tròn trịa, chuyên gia làm tròn đến hàng chục.' },

  { id: 'card-power-zero', kind: 'formula', rarity: 'epic', emoji: '0️⃣', name: 'Lũy thừa bậc 0', formula: 'a⁰ = 1  (a ≠ 0)', fact: 'Mọi số khác 0 mũ 0 đều bằng 1.' },
  { id: 'card-prime', kind: 'formula', rarity: 'epic', emoji: '🧩', name: 'Thừa số nguyên tố', formula: '360 = 2³ · 3² · 5', fact: 'Mỗi số tự nhiên lớn hơn 1 phân tích được duy nhất thành tích các số nguyên tố.' },
  { id: 'card-transform', kind: 'formula', rarity: 'epic', emoji: '🔀', name: 'Đổi chủ thể công thức', formula: 'v = s : t ⇒ s = v · t', fact: 'Biến đổi công thức như giải phương trình.' },
  { id: 'card-dragon', kind: 'mascot', rarity: 'epic', emoji: '🐉', name: 'Rồng Lũy thừa', fact: 'Mỗi lần vỗ cánh, sức mạnh của rồng nhân đôi: 2, 4, 8, 16…' },
  { id: 'card-unicorn', kind: 'mascot', rarity: 'epic', emoji: '🦄', name: 'Kỳ lân Thập phân', fact: 'Sừng kỳ lân dài đúng 0,618 lần thân — tỉ lệ vàng!' },

  { id: 'card-wizard', kind: 'mascot', rarity: 'legendary', emoji: '🧙', name: 'Pháp sư Moyu', fact: 'Chủ tiệm Phép Thuật — biến mỗi câu đúng thành một ngôi sao.' },
  { id: 'card-whale', kind: 'mascot', rarity: 'legendary', emoji: '🐋', name: 'Cá voi Ngân hà', fact: 'Bơi giữa các vì sao, đếm được tới ∞ mà không bao giờ mệt.' },
];

export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
export const CARD_BY_ID = Object.fromEntries(CARDS.map((c) => [c.id, c]));
export const rarityOf = (id) => RARITIES.find((r) => r.id === id);

const SLOTS = ['title', 'frame', 'theme', 'effect'];
const emptyEquipped = () => ({ title: null, badges: [], frame: null, theme: null, effect: null, avatar: null });

/* Doc Firestore (có thể thiếu/hỏng) → kho chuẩn hoá. Bỏ vật phẩm/thẻ không còn trong danh mục. */
export function normalizeInventory(d) {
  const owned = Array.isArray(d?.owned) ? [...new Set(d.owned.filter((id) => ITEM_BY_ID[id]))] : [];
  const cards = {};
  for (const [id, n] of Object.entries(d?.cards || {})) {
    const count = Math.floor(Number(n) || 0);
    if (CARD_BY_ID[id] && count > 0) cards[id] = count;
  }
  const e = d?.equipped || {};
  const equipped = emptyEquipped();
  for (const slot of SLOTS) {
    if (owned.includes(e[slot]) && ITEM_BY_ID[e[slot]].category === slot) equipped[slot] = e[slot];
  }
  equipped.badges = (Array.isArray(e.badges) ? e.badges : [])
    .filter((id, i, a) => owned.includes(id) && ITEM_BY_ID[id].category === 'badge' && a.indexOf(id) === i)
    .slice(0, MAX_BADGES);
  const photo = isPhotoDataUrl(d?.photo) ? d.photo : null;
  if (cards[e.avatar] && CARD_BY_ID[e.avatar].kind === 'mascot') equipped.avatar = e.avatar;
  else if (e.avatar === PHOTO_AVATAR && photo) equipped.avatar = PHOTO_AVATAR;
  return {
    spent: Math.max(0, Number(d?.spent) || 0),
    owned,
    equipped,
    cards,
    packsOpened: Math.max(0, Math.floor(Number(d?.packsOpened) || 0)),
    photo,
  };
}

/* Doc "giới hạn luyện tập" → { key: stat }, xử lý doc cũ như practice-page.js. */
export function statsFromLimitDocs(docs) {
  const stats = {};
  for (const { id, data } of docs) {
    let stat = statFromDoc(data);
    if (isLegacyDoc(data) && stat.attempts >= BASE_GOAL) stat = migrateLegacy(stat);
    stats[id] = stat;
  }
  return stats;
}

export function earnedStars(stats, days) {
  return totalStars(stats) + studyStars(days);
}

export function balanceOf(earned, inv) {
  return earned - (inv?.spent || 0);
}

/* { ok } hoặc { ok: false, reason: 'unknown' | 'owned' | 'poor', need } */
export function canBuy(item, inv, balance) {
  if (!item || !ITEM_BY_ID[item.id]) return { ok: false, reason: 'unknown' };
  if (inv.owned.includes(item.id)) return { ok: false, reason: 'owned' };
  if (balance < item.price) return { ok: false, reason: 'poor', need: item.price - balance };
  return { ok: true };
}

export function canOpenPack(balance) {
  return balance >= PACK_PRICE ? { ok: true } : { ok: false, reason: 'poor', need: PACK_PRICE - balance };
}

function weightedPick(rng, list, weightOf) {
  const total = list.reduce((s, x) => s + weightOf(x), 0);
  let r = rng.next() * total;
  for (const x of list) {
    r -= weightOf(x);
    if (r < 0) return x;
  }
  return list[list.length - 1];
}

const RARITY_WEIGHT = Object.fromEntries(RARITIES.map((r) => [r.id, r.weight]));

/* Rút một thẻ có độ hiếm ≥ minRarity: chọn độ hiếm theo trọng số, rồi chọn đều trong độ hiếm đó. */
function drawCard(rng, minRarity = 'common') {
  const rarity = weightedPick(rng, RARITIES.filter((r) => RANK[r.id] >= RANK[minRarity]), (r) => r.weight);
  return rng.pick(CARDS.filter((c) => c.rarity === rarity.id)).id;
}

/* Gói bí ẩn: 3 thẻ, thẻ thứ 3 chắc chắn từ Hiếm trở lên. */
export function openPack(rng) {
  const ids = [];
  for (let i = 0; i < PACK_SIZE; i++) ids.push(drawCard(rng, i === PACK_SIZE - 1 ? 'rare' : 'common'));
  return ids;
}

export function duplicateCount(inv) {
  return Object.values(inv.cards).reduce((s, n) => s + Math.max(0, n - 1), 0);
}

export function missingCards(inv) {
  return CARDS.filter((c) => !inv.cards[c.id]);
}

export function canTrade(inv) {
  if (!missingCards(inv).length) return { ok: false, reason: 'complete' };
  const have = duplicateCount(inv);
  if (have < TRADE_COST) return { ok: false, reason: 'few', need: TRADE_COST - have };
  return { ok: true };
}

/* Đổi 5 thẻ trùng lấy 1 thẻ chưa có (chọn theo trọng số độ hiếm).
   Tiêu thẻ trùng ở độ hiếm thấp trước, trong cùng độ hiếm thì thẻ nhiều bản nhất trước; mỗi loại giữ lại ≥ 1.
   → { gain, consume: { cardId: số bản bỏ đi } } hoặc null nếu không đổi được. */
export function tradePick(rng, inv) {
  if (!canTrade(inv).ok) return null;
  const gain = weightedPick(rng, missingCards(inv), (c) => RARITY_WEIGHT[c.rarity]).id;
  const dupes = Object.entries(inv.cards)
    .filter(([, n]) => n > 1)
    .sort(([a, na], [b, nb]) => RANK[CARD_BY_ID[a].rarity] - RANK[CARD_BY_ID[b].rarity] || nb - na || (a < b ? -1 : 1));
  const consume = {};
  let left = TRADE_COST;
  for (const [id, n] of dupes) {
    const take = Math.min(n - 1, left);
    if (take > 0) consume[id] = take;
    left -= take;
    if (!left) break;
  }
  return { gain, consume };
}

/* ---------- chuyển trạng thái kho (cập nhật giao diện ngay, khớp với lần ghi Firestore) ---------- */
export function applyPurchase(inv, item) {
  return { ...inv, spent: inv.spent + item.price, owned: [...new Set([...inv.owned, item.id])] };
}

export function applyPack(inv, cardIds) {
  const cards = { ...inv.cards };
  for (const id of cardIds) cards[id] = (cards[id] || 0) + 1;
  return { ...inv, spent: inv.spent + PACK_PRICE, cards, packsOpened: inv.packsOpened + 1 };
}

export function applyTrade(inv, { gain, consume }) {
  const cards = { ...inv.cards };
  for (const [id, n] of Object.entries(consume)) cards[id] -= n;
  cards[gain] = (cards[gain] || 0) + 1;
  return { ...inv, cards };
}

/* Trang bị / tháo. slot: 'title' | 'frame' | 'theme' | 'effect' (id = null để tháo),
   'badges' (bật/tắt một huy hiệu, tối đa 3), 'avatar' (id thẻ linh vật đã có, PHOTO_AVATAR = ảnh tự tải lên, null = chữ cái đầu tên).
   → { ok, equipped } hoặc { ok: false, reason } */
export function equipPatch(inv, slot, id) {
  const equipped = { ...emptyEquipped(), ...inv.equipped, badges: [...(inv.equipped?.badges || [])] };
  if (SLOTS.includes(slot)) {
    if (id !== null && !(inv.owned.includes(id) && ITEM_BY_ID[id]?.category === slot)) return { ok: false, reason: 'not-owned' };
    equipped[slot] = id;
  } else if (slot === 'badges') {
    if (!(inv.owned.includes(id) && ITEM_BY_ID[id]?.category === 'badge')) return { ok: false, reason: 'not-owned' };
    if (equipped.badges.includes(id)) equipped.badges = equipped.badges.filter((b) => b !== id);
    else if (equipped.badges.length >= MAX_BADGES) return { ok: false, reason: 'full' };
    else equipped.badges.push(id);
  } else if (slot === 'avatar') {
    const ok = id === null || (id === PHOTO_AVATAR ? !!inv.photo : !!(inv.cards[id] && CARD_BY_ID[id]?.kind === 'mascot'));
    if (!ok) return { ok: false, reason: 'not-owned' };
    equipped.avatar = id;
  } else {
    return { ok: false, reason: 'unknown' };
  }
  return { ok: true, equipped };
}

/* Bản tóm tắt để vẽ giao diện (cache localStorage "moyumath_cosmetics", đọc được ngay trong <head>). */
export function cosmeticsOf(inv) {
  const e = inv.equipped;
  return {
    theme: e.theme ? ITEM_BY_ID[e.theme].theme : null,
    effect: e.effect ? ITEM_BY_ID[e.effect].effect : null,
    frame: e.frame,
    title: e.title,
    badges: e.badges,
    avatar: e.avatar,
    photo: e.avatar === PHOTO_AVATAR ? inv.photo : null,
  };
}
