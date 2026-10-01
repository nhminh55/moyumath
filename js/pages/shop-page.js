/* Tiệm Phép Thuật (shop.html): đổi ⭐ lấy danh hiệu, huy hiệu, khung avatar, giao diện, hiệu ứng chúc mừng
   và gói thẻ sưu tầm. Danh mục & quy tắc ở js/runner/shop.js; Firestore "Đã làm/{tên}/tiệm phép thuật/kho".
   Mỗi lần mua/mở gói/đổi thẻ đều tải lại kho + sao đã nhận từ Firestore rồi mới kiểm tra (không tin cache). */
import { currentStudent } from '../core/auth.js';
import { escapeHtml } from '../core/escape.js';
import { createRng } from '../core/rng.js';
import {
  CATEGORIES, ITEMS, ITEM_BY_ID, CARDS, CARD_BY_ID, RARITIES, PACK_PRICE, TRADE_COST, MAX_BADGES, PHOTO_AVATAR, rarityOf,
  canBuy, canOpenPack, canTrade, openPack, tradePick, duplicateCount, applyPurchase, applyPack, applyTrade, equipPatch,
  cosmeticsOf, balanceOf,
} from '../runner/shop.js';
import { loadWallet, storeCosmetics, applyTheme, identityHTML, avatarHTML } from '../ui/cosmetics.js';
import { fileToAvatarPhoto, pickImageFile } from '../ui/avatar-upload.js';
import { playSound, playEffectPreview, bindClickSounds, createSoundToggle } from '../ui/sound.js';
import { burstFrom, celebrate } from '../ui/confetti.js';
import { showToast } from '../ui/toast.js';

const $ = (id) => document.getElementById(id);
const esc = escapeHtml;
const student = currentStudent();
const name = student.displayName;

const TABS = [
  { id: 'titles', label: '🏷️ Danh hiệu & Huy hiệu', categories: ['title', 'badge'] },
  { id: 'frames', label: '🖼️ Khung avatar', categories: ['frame'] },
  { id: 'themes', label: '🎨 Giao diện', categories: ['theme'] },
  { id: 'effects', label: '🎉 Hiệu ứng', categories: ['effect'] },
  { id: 'cards', label: '🃏 Thẻ bài', categories: [] },
];
const SLOT_OF = { title: 'title', badge: 'badges', frame: 'frame', theme: 'theme', effect: 'effect' };

let wallet = null;        // { earned, inv, balance }
let busy = false;         // đang ghi Firestore — chặn bấm hai lần
let previewTheme = null;  // theme đang xem thử (chưa mua)
let tab = TABS.find((t) => '#' + t.id === location.hash)?.id || 'titles';

/* ---------- ví & đầu trang ---------- */
function setWallet(inv) {
  wallet = { earned: wallet.earned, inv, balance: balanceOf(wallet.earned, inv) };
  storeCosmetics(inv);
  if (previewTheme) applyTheme(previewTheme);
}

function renderHeader() {
  const c = wallet ? cosmeticsOf(wallet.inv) : undefined;
  $('meIdentity').innerHTML = identityHTML({ displayName: name, cosmetics: c, size: 'lg', withName: true });
  if (!wallet) return;
  $('balance').textContent = '⭐ ' + wallet.balance;
  $('walletNote').textContent = 'Đã nhận ' + wallet.earned + ' ⭐ · Đã tiêu ' + wallet.inv.spent + ' ⭐';
}

function renderTabs() {
  $('tabs').innerHTML = TABS.map((t) =>
    '<button type="button" role="tab" class="shop-tab' + (t.id === tab ? ' active' : '') + '" aria-selected="' + (t.id === tab) +
    '" data-tab="' + t.id + '">' + esc(t.label) + '</button>').join('');
}

function render() {
  renderHeader();
  renderTabs();
  if (!wallet) return;
  $('panel').innerHTML = tab === 'cards' ? cardsPanel() : itemsPanel(TABS.find((t) => t.id === tab));
}

/* ---------- vật phẩm ---------- */
function isEquipped(item) {
  const e = wallet.inv.equipped;
  return item.category === 'badge' ? e.badges.includes(item.id) : e[item.category] === item.id;
}

function previewHTML(item) {
  const c = cosmeticsOf(wallet.inv);
  switch (item.category) {
    case 'title': return '<span class="id-title item-title-preview">' + esc(item.name) + '</span>';
    case 'badge': return '<span class="item-big">' + esc(item.icon) + '</span>';
    case 'frame': return avatarHTML(name, { ...c, frame: item.id }, 'lg');
    case 'theme': return '<span class="theme-mock" style="background:' + item.swatch[0] + '">' +
      '<span class="theme-mock-card" style="border-color:' + item.swatch[1] + '"><i style="background:' + item.swatch[1] + '"></i><i style="background:' + item.swatch[2] + '"></i></span></span>';
    case 'effect': return '<span class="item-big">' + esc(item.icon) + '</span>';
    default: return '';
  }
}

function itemButtons(item) {
  const owned = wallet.inv.owned.includes(item.id);
  const extra = item.category === 'theme' && !owned
    ? '<button type="button" class="secondary" data-action="try" data-id="' + item.id + '">' + (previewTheme === item.theme ? 'Bỏ xem thử' : '👁 Xem thử') + '</button>'
    : item.category === 'effect'
      ? '<button type="button" class="secondary" data-sound="self" data-action="listen" data-id="' + item.id + '">🔊 Nghe thử</button>'
      : '';
  if (!owned) {
    const check = canBuy(item, wallet.inv, wallet.balance);
    const label = check.ok ? 'Mua' : 'Cần thêm ' + check.need + '⭐';
    return extra + '<button type="button" class="primary" data-action="buy" data-id="' + item.id + '"' + (check.ok ? '' : ' disabled') + '>' + label + '</button>';
  }
  if (isEquipped(item)) return extra + '<button type="button" class="secondary" data-action="unequip" data-id="' + item.id + '">✓ Đang dùng</button>';
  return extra + '<button type="button" class="primary" data-action="equip" data-id="' + item.id + '">Dùng</button>';
}

function itemCard(item) {
  const owned = wallet.inv.owned.includes(item.id);
  return '<div class="item-card' + (owned ? ' owned' : '') + (owned && isEquipped(item) ? ' equipped' : '') + '">' +
    '<div class="item-preview">' + previewHTML(item) + '</div>' +
    '<div class="item-name">' + esc(item.name) + '</div>' +
    (item.desc ? '<div class="item-desc">' + esc(item.desc) + '</div>' : '') +
    '<div class="item-price">' + (owned ? 'Đã có' : '⭐ ' + item.price) + '</div>' +
    '<div class="item-actions">' + itemButtons(item) + '</div></div>';
}

function itemsPanel(t) {
  return t.categories.map((cat) => {
    const meta = CATEGORIES.find((c) => c.id === cat);
    const note = cat === 'badge' ? '<p class="shop-note">Đeo được tối đa ' + MAX_BADGES + ' huy hiệu cùng lúc.</p>' : '';
    return '<h2 class="shop-h2">' + esc(meta.icon + ' ' + meta.name) + '</h2>' + note +
      '<div class="item-grid">' + ITEMS.filter((i) => i.category === cat).map(itemCard).join('') + '</div>';
  }).join('');
}

/* ---------- thẻ bài ---------- */
function cardFace(card, { count = 0, isNew = false } = {}) {
  const r = rarityOf(card.rarity);
  return '<span class="tcg-rarity">' + esc(r.name) + '</span>' +
    (isNew ? '<span class="tcg-new">MỚI!</span>' : '') +
    '<span class="tcg-emoji">' + esc(card.emoji) + '</span>' +
    '<span class="tcg-name">' + esc(card.name) + '</span>' +
    (card.formula ? '<span class="tcg-formula">' + esc(card.formula) + '</span>' : '<span class="tcg-formula tcg-kind">Linh vật</span>') +
    (count > 1 ? '<span class="tcg-count">×' + count + '</span>' : '');
}

function albumTile(card) {
  const n = wallet.inv.cards[card.id] || 0;
  if (!n) {
    return '<div class="tcg-card missing rarity-' + card.rarity + '"><span class="tcg-rarity">' + esc(rarityOf(card.rarity).name) +
      '</span><span class="tcg-emoji">?</span><span class="tcg-name">???</span></div>';
  }
  const avatar = wallet.inv.equipped.avatar === card.id ? '<span class="tcg-avatar" title="Đang là avatar">👤</span>' : '';
  return '<button type="button" class="tcg-card rarity-' + card.rarity + '" data-action="card" data-id="' + card.id + '">' +
    cardFace(card, { count: n }) + avatar + '</button>';
}

function cardsPanel() {
  const inv = wallet.inv;
  const pack = canOpenPack(wallet.balance);
  const trade = canTrade(inv);
  const dupes = duplicateCount(inv);
  const tradeLabel = trade.ok ? '🔁 Đổi ' + TRADE_COST + ' thẻ trùng → 1 thẻ mới'
    : trade.reason === 'complete' ? '🏆 Đã đủ bộ sưu tập!' : '🔁 Đổi thẻ trùng (cần thêm ' + trade.need + ')';
  const owned = Object.keys(inv.cards).length;
  const group = (kind, title) => '<h2 class="shop-h2">' + title + '</h2><div class="album">' +
    CARDS.filter((c) => c.kind === kind).map(albumTile).join('') + '</div>';
  return '<div class="pack-zone">' +
    '<div class="pack-box" aria-hidden="true">🎁</div>' +
    '<div class="pack-info"><h2 class="shop-h2">Gói bí ẩn</h2>' +
      '<p class="shop-note">Mỗi gói có 3 thẻ ngẫu nhiên, thẻ thứ 3 chắc chắn từ <b>Hiếm</b> trở lên. Thẻ trùng được cộng dồn; cứ ' +
      TRADE_COST + ' thẻ trùng đổi được 1 thẻ chưa có.</p>' +
      '<p class="shop-odds">' + RARITIES.map((r) => '<span class="odds rarity-' + r.id + '">' + esc(r.name) + ' ' + r.weight + '%</span>').join('') + '</p>' +
      '<div class="item-actions">' +
        '<button type="button" class="primary" data-action="pack"' + (pack.ok ? '' : ' disabled') + '>' +
          (pack.ok ? 'Mở gói — ⭐ ' + PACK_PRICE : 'Cần thêm ' + pack.need + '⭐') + '</button>' +
        '<button type="button" class="secondary" data-action="trade"' + (trade.ok ? '' : ' disabled') + '>' + tradeLabel + '</button>' +
      '</div>' +
      '<p class="shop-note">Đã mở ' + inv.packsOpened + ' gói · ' + dupes + ' thẻ trùng · Bộ sưu tập ' + owned + '/' + CARDS.length + '</p>' +
    '</div></div>' +
    group('formula', '📐 Thẻ công thức') + group('mascot', '🐾 Thẻ linh vật <small>(đặt làm avatar được)</small>');
}

/* ---------- hộp thoại ---------- */
function modal(html, actions) {
  return new Promise((resolve) => {
    $('modalBody').innerHTML = html;
    $('modalActions').innerHTML = actions.map((a, i) =>
      '<button type="button" class="' + (a.primary ? 'primary' : 'secondary') + '" data-i="' + i + '">' + esc(a.label) + '</button>').join('');
    $('modal').hidden = false;
    const close = (value) => {
      $('modal').hidden = true;
      $('modal').onclick = null;
      resolve(value);
    };
    $('modal').onclick = (e) => {
      if (e.target === $('modal')) return close(null);
      const btn = e.target.closest('[data-i]');
      if (btn) close(actions[Number(btn.dataset.i)].value);
    };
  });
}

const confirmSpend = (html, price) => modal(html + '<p class="modal-note">Sau khi mua còn ⭐ ' + (wallet.balance - price) + '.</p>',
  [{ label: 'Thôi', value: false }, { label: 'Đồng ý — ⭐ ' + price, value: true, primary: true }]);

/* Tải lại kho + sao đã nhận ngay trước khi tiêu sao. */
async function freshWallet() {
  wallet = await loadWallet(name);
  storeCosmetics(wallet.inv);
  if (previewTheme) applyTheme(previewTheme);
  return wallet;
}

async function withBusy(fn) {
  if (busy) return;
  busy = true;
  document.body.classList.add('busy');
  try {
    await fn();
  } catch (err) {
    console.error('Lỗi Tiệm Phép Thuật:', err);
    showToast('Không lưu được — kiểm tra mạng rồi thử lại nhé.', { error: true, duration: 5000 });
  } finally {
    busy = false;
    document.body.classList.remove('busy');
    render();
  }
}

const fb = () => import('../core/firebase.js');

/* ---------- mua / dùng ---------- */
async function buy(item) {
  const ok = await confirmSpend('<div class="modal-preview">' + previewHTML(item) + '</div><h3>Mua "' + esc(item.name) + '"?</h3>', item.price);
  if (!ok) return;
  await withBusy(async () => {
    const w = await freshWallet();
    const check = canBuy(item, w.inv, w.balance);
    if (!check.ok) {
      showToast(check.reason === 'owned' ? 'Bé đã có "' + item.name + '" rồi.' : 'Chưa đủ sao — cần thêm ' + check.need + '⭐.', { error: true });
      return;
    }
    await (await fb()).buyShopItem(name, item.id, item.price);
    setWallet(applyPurchase(w.inv, item));
    if (item.category === 'theme' && previewTheme === item.theme) previewTheme = null;
    playSound('goal');
    burstFrom(document.querySelector('[data-action="buy"][data-id="' + item.id + '"]') || $('balance'));
    /* Mua xong dùng luôn (huy hiệu: nếu còn chỗ). */
    const patch = equipPatch(wallet.inv, SLOT_OF[item.category], item.id);
    if (patch.ok) await saveEquipped(patch.equipped);
    showToast('✨ Đã mua "' + item.name + '"' + (patch.ok ? ' và đang dùng!' : '!'), { duration: 4000 });
  });
}

async function saveEquipped(equipped) {
  await (await fb()).saveShopEquipped(name, equipped);
  setWallet({ ...wallet.inv, equipped });
}

async function equip(item, on) {
  const slot = SLOT_OF[item.category];
  const patch = slot === 'badges' ? equipPatch(wallet.inv, slot, item.id) : equipPatch(wallet.inv, slot, on ? item.id : null);
  if (!patch.ok) {
    showToast(patch.reason === 'full' ? 'Chỉ đeo được ' + MAX_BADGES + ' huy hiệu — tháo bớt một cái nhé.' : 'Bé chưa có vật phẩm này.', { error: true });
    return;
  }
  await withBusy(async () => {
    if (item.category === 'theme') previewTheme = null;
    await saveEquipped(patch.equipped);
  });
}

function tryTheme(item) {
  previewTheme = previewTheme === item.theme ? null : item.theme;
  applyTheme(previewTheme || cosmeticsOf(wallet.inv).theme);
  if (previewTheme) showToast('👁 Đang xem thử "' + item.name + '" — rời trang hoặc bấm "Bỏ xem thử" để trở lại.', { duration: 4000 });
  render();
}

function listen(item) {
  playEffectPreview(item.effect);
  celebrate(item.effect);
}

/* ---------- gói thẻ & đổi thẻ ---------- */
function revealHTML(ids, before) {
  const seen = { ...before };
  return '<h3>🎁 Gói bí ẩn</h3><p class="modal-note">Bấm vào từng thẻ để lật!</p><div class="reveal-row">' + ids.map((id) => {
    const isNew = !seen[id];
    seen[id] = (seen[id] || 0) + 1;
    return '<button type="button" class="tcg-card flip rarity-' + CARD_BY_ID[id].rarity + '" data-sound="self" data-reveal="' + id + '">' +
      '<span class="tcg-back">🔮</span><span class="tcg-front">' + cardFace(CARD_BY_ID[id], { isNew }) + '</span></button>';
  }).join('') + '</div>';
}

function flip(btn) {
  if (!btn || btn.classList.contains('open')) return;
  btn.classList.add('open');
  const rank = RARITIES.findIndex((r) => r.id === CARD_BY_ID[btn.dataset.reveal].rarity);
  if (rank >= 2) { playSound('celebrate'); celebrate(); } else if (rank === 1) { playSound('goal'); burstFrom(btn); } else playSound('correct');
}

/* Hiện các thẻ vừa nhận; tự lật dần nếu bé không bấm. */
async function reveal(ids, before) {
  const done = modal(revealHTML(ids, before), [{ label: 'Tuyệt vời!', value: true, primary: true }]);
  const cards = [...$('modalBody').querySelectorAll('[data-reveal]')];
  $('modalBody').onclick = (e) => flip(e.target.closest('[data-reveal]'));
  cards.forEach((c, i) => setTimeout(() => flip(c), 1400 + i * 900));
  await done;
  cards.forEach((c) => c.classList.add('open'));
  $('modalBody').onclick = null;
}

async function buyPack() {
  const ok = await confirmSpend('<div class="modal-preview"><span class="item-big">🎁</span></div><h3>Mở 1 gói bí ẩn?</h3>', PACK_PRICE);
  if (!ok) return;
  let ids = null, before = null;
  await withBusy(async () => {
    const w = await freshWallet();
    const check = canOpenPack(w.balance);
    if (!check.ok) { showToast('Chưa đủ sao — cần thêm ' + check.need + '⭐.', { error: true }); return; }
    ids = openPack(createRng());
    before = w.inv.cards;
    await (await fb()).buyShopPack(name, ids, PACK_PRICE);
    setWallet(applyPack(w.inv, ids));
  });
  if (ids) await reveal(ids, before);
}

async function trade() {
  if (!canTrade(wallet.inv).ok) return;
  const ok = await modal('<h3>🔁 Đổi ' + TRADE_COST + ' thẻ trùng lấy 1 thẻ chưa có?</h3><p class="modal-note">Thẻ trùng ở độ hiếm thấp được dùng trước; mỗi loại vẫn giữ lại ít nhất 1 thẻ.</p>',
    [{ label: 'Thôi', value: false }, { label: 'Đổi thẻ', value: true, primary: true }]);
  if (!ok) return;
  let pick = null, before = null;
  await withBusy(async () => {
    const w = await freshWallet();
    pick = tradePick(createRng(), w.inv);
    if (!pick) { showToast('Chưa đổi được — cần ' + TRADE_COST + ' thẻ trùng và còn thẻ chưa có.', { error: true }); return; }
    before = w.inv.cards;
    await (await fb()).tradeShopCards(name, pick.consume, pick.gain);
    setWallet(applyTrade(w.inv, pick));
  });
  if (pick) await reveal([pick.gain], before);
}

async function showCard(card) {
  const n = wallet.inv.cards[card.id] || 0;
  const isAvatar = wallet.inv.equipped.avatar === card.id;
  const actions = [{ label: 'Đóng', value: null }];
  if (card.kind === 'mascot') actions.push(isAvatar ? { label: 'Bỏ avatar', value: 'off' } : { label: '👤 Đặt làm avatar', value: 'on', primary: true });
  const choice = await modal('<div class="reveal-row"><div class="tcg-card big rarity-' + card.rarity + '">' + cardFace(card, { count: n }) + '</div></div>' +
    '<p class="card-fact">' + esc(card.fact) + '</p>', actions);
  if (!choice) return;
  const patch = equipPatch(wallet.inv, 'avatar', choice === 'on' ? card.id : null);
  if (patch.ok) await withBusy(() => saveEquipped(patch.equipped));
}

/* ---------- ảnh đại diện tự tải lên (miễn phí) ---------- */
const PHOTO_ERRORS = {
  type: 'File này không phải ảnh — chọn ảnh JPG hoặc PNG nhé.',
  size: 'Ảnh quá lớn — chọn ảnh dưới 15 MB nhé.',
  decode: 'Trình duyệt không đọc được ảnh này — thử ảnh JPG hoặc PNG khác nhé.',
};

async function savePhoto(photo, equipped) {
  await (await fb()).saveShopPhoto(name, photo, equipped);
  setWallet({ ...wallet.inv, photo, equipped });
}

async function uploadPhoto() {
  const file = await pickImageFile();
  if (!file) return;
  let photo;
  try {
    photo = await fileToAvatarPhoto(file);
  } catch (err) {
    showToast(PHOTO_ERRORS[err.message] || PHOTO_ERRORS.decode, { error: true, duration: 5000 });
    return;
  }
  const preview = avatarHTML(name, { ...cosmeticsOf(wallet.inv), avatar: PHOTO_AVATAR, photo }, 'lg');
  const ok = await modal('<div class="modal-preview">' + preview + '</div><h3>Dùng ảnh này làm avatar?</h3>' +
    '<p class="modal-note">Thầy cô và các bạn sẽ thấy avatar này — hãy chọn ảnh phù hợp nhé. Ảnh được cắt vuông ở giữa.</p>',
  [{ label: 'Thôi', value: false }, { label: '💾 Lưu ảnh', value: true, primary: true }]);
  if (!ok) return;
  await withBusy(async () => {
    await savePhoto(photo, { ...wallet.inv.equipped, avatar: PHOTO_AVATAR });
    playSound('goal');
    showToast('📷 Đã đổi ảnh đại diện!');
  });
}

async function photoMenu() {
  if (!wallet || busy) return;
  const { photo, equipped } = wallet.inv;
  if (!photo) return uploadPhoto();
  const using = equipped.avatar === PHOTO_AVATAR;
  const actions = [{ label: 'Đóng', value: null }, { label: '🗑 Xoá ảnh', value: 'delete' }];
  if (!using) actions.push({ label: '👤 Dùng ảnh này', value: 'use' });
  actions.push({ label: '📷 Chọn ảnh khác', value: 'new', primary: true });
  const preview = avatarHTML(name, { ...cosmeticsOf(wallet.inv), avatar: PHOTO_AVATAR, photo }, 'lg');
  const choice = await modal('<div class="modal-preview">' + preview + '</div><h3>Ảnh đại diện</h3>' +
    '<p class="modal-note">' + (using ? 'Đang dùng làm avatar.' : 'Đang dùng thẻ linh vật hoặc chữ cái đầu tên làm avatar.') + '</p>', actions);
  if (choice === 'new') return uploadPhoto();
  if (choice === 'use') {
    const patch = equipPatch(wallet.inv, 'avatar', PHOTO_AVATAR);
    if (patch.ok) await withBusy(() => saveEquipped(patch.equipped));
  } else if (choice === 'delete') {
    await withBusy(() => savePhoto(null, { ...equipped, avatar: using ? null : equipped.avatar }));
  }
  return undefined;
}

/* ---------- khởi động ---------- */
function onPanelClick(e) {
  const btn = e.target.closest('[data-action]');
  if (!btn || btn.disabled || busy || !wallet) return;
  const item = ITEM_BY_ID[btn.dataset.id];
  switch (btn.dataset.action) {
    case 'buy': return buy(item);
    case 'equip': return equip(item, true);
    case 'unequip': return equip(item, false);
    case 'try': return tryTheme(item);
    case 'listen': return listen(item);
    case 'pack': return buyPack();
    case 'trade': return trade();
    case 'card': return showCard(CARD_BY_ID[btn.dataset.id]);
    default: return undefined;
  }
}

async function init() {
  render();
  $('soundSlot').append(createSoundToggle());
  bindClickSounds();
  $('tabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    tab = btn.dataset.tab;
    history.replaceState(null, '', '#' + tab);
    render();
  });
  window.addEventListener('hashchange', () => {
    const t = TABS.find((x) => '#' + x.id === location.hash);
    if (t && t.id !== tab) { tab = t.id; render(); }
  });
  $('panel').addEventListener('click', onPanelClick);
  $('photoBtn').addEventListener('click', photoMenu);
  if (!name) {
    $('panel').innerHTML = '<p class="shop-note">Không xác định được học sinh — hãy đăng nhập lại.</p>';
    return;
  }
  $('panel').innerHTML = '<p class="shop-note">Đang mở cửa tiệm...</p>';
  try {
    await freshWallet();
  } catch (err) {
    console.error('Lỗi tải Tiệm Phép Thuật:', err);
    $('panel').innerHTML = '<p class="shop-note">Không tải được cửa tiệm — kiểm tra mạng rồi tải lại trang.</p>';
    return;
  }
  render();
}

init();
