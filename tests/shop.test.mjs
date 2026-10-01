/* Tiệm Phép Thuật (js/runner/shop.js): danh mục, mua, mở gói, đổi thẻ, trang bị. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../js/core/rng.js';
import { totalStars } from '../js/runner/stars.js';
import { studyStars } from '../js/runner/study-time.js';
import {
  ITEMS, ITEM_BY_ID, CARDS, CARD_BY_ID, RARITIES, PRICE_RANGES, PACK_PRICE, PACK_SIZE, TRADE_COST, MAX_BADGES,
  normalizeInventory, statsFromLimitDocs, earnedStars, balanceOf, canBuy, canOpenPack, openPack, canTrade, tradePick,
  duplicateCount, applyPurchase, applyPack, applyTrade, equipPatch, cosmeticsOf,
} from '../js/runner/shop.js';

const inv = (d = {}) => normalizeInventory(d);
const rank = (id) => RARITIES.findIndex((r) => r.id === CARD_BY_ID[id].rarity);

test('danh mục: id không trùng, giá đúng khung từng loại', () => {
  const ids = [...ITEMS.map((i) => i.id), ...CARDS.map((c) => c.id)];
  assert.equal(new Set(ids).size, ids.length);
  for (const item of ITEMS) {
    const [min, max] = PRICE_RANGES[item.category];
    assert.ok(item.price >= min && item.price <= max, item.id + ' giá ' + item.price);
  }
  for (const cat of Object.keys(PRICE_RANGES)) assert.ok(ITEMS.some((i) => i.category === cat), 'thiếu loại ' + cat);
  assert.equal(PACK_PRICE, 15);
  assert.equal(PACK_SIZE, 3);
  for (const t of ITEMS.filter((i) => i.category === 'theme')) assert.match(t.theme, /^[a-z]+$/);
  for (const e of ITEMS.filter((i) => i.category === 'effect')) assert.match(e.effect, /^[a-z]+$/);
});

test('thẻ: độ hiếm hợp lệ, mỗi độ hiếm có thẻ, linh vật có emoji', () => {
  for (const c of CARDS) {
    assert.ok(RARITIES.some((r) => r.id === c.rarity), c.id);
    assert.ok(['formula', 'mascot'].includes(c.kind), c.id);
    assert.ok(c.emoji && c.name && c.fact, c.id);
  }
  for (const r of RARITIES) assert.ok(CARDS.some((c) => c.rarity === r.id), 'thiếu thẻ ' + r.id);
});

test('normalizeInventory: doc rỗng/hỏng → kho trống, bỏ id lạ, trang bị phải đang sở hữu', () => {
  assert.deepEqual(inv(null), {
    spent: 0, owned: [], cards: {}, packsOpened: 0,
    equipped: { title: null, badges: [], frame: null, theme: null, effect: null, avatar: null },
  });
  const i = inv({
    spent: 30, owned: ['title-tan-binh', 'khong-co', 'title-tan-binh', 'badge-cham-chi'],
    cards: { 'card-owl': 2, 'card-lạ': 3, 'card-fox': 0 },
    equipped: { title: 'title-tan-binh', frame: 'frame-gold', badges: ['badge-cham-chi', 'badge-tu-duy'], avatar: 'card-owl' },
  });
  assert.deepEqual(i.owned, ['title-tan-binh', 'badge-cham-chi']);
  assert.deepEqual(i.cards, { 'card-owl': 2 });
  assert.equal(i.equipped.title, 'title-tan-binh');
  assert.equal(i.equipped.frame, null);              // chưa mua
  assert.deepEqual(i.equipped.badges, ['badge-cham-chi']);
  assert.equal(i.equipped.avatar, 'card-owl');
});

test('sao còn lại = tiến độ luyện tập + thời gian học − đã tiêu', () => {
  const docs = [
    { id: 'a', data: { attempts: 10, scores: [], reward10: true, reward10Amount: 5 } },
    { id: 'b', data: { attempts: 20, scores: [], reward10: true, reward10Amount: 5, reward20: true, reward20Amount: 2 } },
  ];
  const days = { '2026-09-01': { goal15: 5, goal30: 15 }, '2026-09-02': { goal15: 5 } };
  const stats = statsFromLimitDocs(docs);
  assert.equal(earnedStars(stats, days), totalStars(stats) + studyStars(days));
  assert.equal(earnedStars(stats, days), 5 + 15 + 25);
  assert.equal(balanceOf(37, inv({ spent: 30 })), 7);
});

test('canBuy: chặn khi đã có hoặc thiếu sao', () => {
  const item = ITEM_BY_ID['frame-gold'];
  assert.deepEqual(canBuy(item, inv(), 25), { ok: true });
  assert.deepEqual(canBuy(item, inv(), 20), { ok: false, reason: 'poor', need: 5 });
  assert.equal(canBuy(item, inv({ owned: ['frame-gold'] }), 100).reason, 'owned');
  assert.equal(canBuy({ id: 'gia-mao', price: 1 }, inv(), 100).reason, 'unknown');
  assert.deepEqual(canOpenPack(14), { ok: false, reason: 'poor', need: 1 });
  assert.ok(canOpenPack(15).ok);
});

test('applyPurchase / applyPack cộng đúng sao đã tiêu', () => {
  const i = applyPurchase(inv(), ITEM_BY_ID['theme-space']);
  assert.equal(i.spent, 60);
  assert.deepEqual(i.owned, ['theme-space']);
  const p = applyPack(i, ['card-owl', 'card-owl', 'card-fox']);
  assert.equal(p.spent, 75);
  assert.equal(p.packsOpened, 1);
  assert.deepEqual(p.cards, { 'card-owl': 2, 'card-fox': 1 });
});

test('openPack (1000 seed): 3 thẻ hợp lệ, thẻ thứ 3 từ Hiếm trở lên, tỉ lệ hợp lý', () => {
  const count = { common: 0, rare: 0, epic: 0, legendary: 0 };
  for (let seed = 1; seed <= 1000; seed++) {
    const ids = openPack(createRng(seed));
    assert.equal(ids.length, 3);
    for (const id of ids) assert.ok(CARD_BY_ID[id], id);
    assert.ok(rank(ids[2]) >= 1, 'seed ' + seed + ': thẻ 3 là ' + ids[2]);
    for (const id of ids.slice(0, 2)) count[CARD_BY_ID[id].rarity]++;
  }
  // 2000 thẻ đầu: Thường ~60%, Huyền thoại ~2%
  assert.ok(count.common > 1050 && count.common < 1350, 'common ' + count.common);
  assert.ok(count.legendary > 10 && count.legendary < 90, 'legendary ' + count.legendary);
  assert.deepEqual(openPack(createRng(42)), openPack(createRng(42)));
});

test('đổi thẻ: cần đủ 5 thẻ trùng, không trả thẻ đã có, giữ lại mỗi loại ≥ 1', () => {
  assert.equal(canTrade(inv({ cards: { 'card-owl': 5 } })).reason, 'few'); // 4 thẻ trùng
  assert.equal(canTrade(inv({ cards: { 'card-owl': 5 } })).need, 1);
  assert.equal(tradePick(createRng(1), inv({ cards: { 'card-owl': 5 } })), null);

  const i = inv({ cards: { 'card-owl': 3, 'card-dragon': 3, 'card-cat-pi': 2 } }); // 2 + 2 + 1 = 5 trùng
  assert.equal(duplicateCount(i), 5);
  for (let seed = 1; seed <= 200; seed++) {
    const pick = tradePick(createRng(seed), i);
    assert.ok(!i.cards[pick.gain], 'trả thẻ đã có ' + pick.gain);
    assert.equal(Object.values(pick.consume).reduce((a, b) => a + b, 0), TRADE_COST);
    const after = applyTrade(i, pick);
    for (const id of Object.keys(i.cards)) assert.ok(after.cards[id] >= 1, id);
    assert.equal(after.cards[pick.gain], 1);
  }
  /* thẻ trùng ở độ hiếm thấp bị dùng trước */
  assert.deepEqual(tradePick(createRng(1), i).consume, { 'card-owl': 2, 'card-cat-pi': 1, 'card-dragon': 2 });
});

test('đổi thẻ: đủ bộ thì không đổi được nữa', () => {
  const full = inv({ cards: Object.fromEntries(CARDS.map((c) => [c.id, 9])) });
  assert.equal(canTrade(full).reason, 'complete');
  assert.equal(tradePick(createRng(3), full), null);
});

test('equipPatch: chỉ trang bị đồ đã có, huy hiệu tối đa 3, avatar phải là thẻ linh vật đã có', () => {
  const badges = ITEMS.filter((i) => i.category === 'badge').map((i) => i.id);
  let i = inv({ owned: ['title-tan-binh', 'theme-pastel', ...badges], cards: { 'card-owl': 1, 'card-sqrt': 1 } });
  assert.equal(equipPatch(i, 'frame', 'frame-gold').reason, 'not-owned');
  assert.equal(equipPatch(i, 'title', 'theme-pastel').reason, 'not-owned'); // sai loại
  assert.equal(equipPatch(i, 'title', 'title-tan-binh').equipped.title, 'title-tan-binh');
  assert.equal(equipPatch(i, 'theme', null).equipped.theme, null);

  for (const b of badges.slice(0, MAX_BADGES)) i = { ...i, equipped: equipPatch(i, 'badges', b).equipped };
  assert.equal(i.equipped.badges.length, MAX_BADGES);
  assert.equal(equipPatch(i, 'badges', badges[MAX_BADGES]).reason, 'full');
  assert.deepEqual(equipPatch(i, 'badges', badges[0]).equipped.badges, badges.slice(1, MAX_BADGES)); // bấm lại = tháo

  assert.equal(equipPatch(i, 'avatar', 'card-owl').equipped.avatar, 'card-owl');
  assert.equal(equipPatch(i, 'avatar', 'card-sqrt').reason, 'not-owned');  // thẻ công thức
  assert.equal(equipPatch(i, 'avatar', 'card-fox').reason, 'not-owned');   // chưa có
});

test('cosmeticsOf: đổi id vật phẩm sang khoá theme / hiệu ứng', () => {
  const i = inv({ owned: ['theme-cyberpunk', 'effect-fox'], equipped: { theme: 'theme-cyberpunk', effect: 'effect-fox' } });
  const c = cosmeticsOf(i);
  assert.equal(c.theme, 'cyberpunk');
  assert.equal(c.effect, 'fox');
  assert.equal(cosmeticsOf(inv()).theme, null);
});
