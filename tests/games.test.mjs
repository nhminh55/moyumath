/* Trò chơi trong Tiệm Phép Thuật: giờ chơi (js/runner/play-time.js), danh mục & luật từng trò (js/games/*.js). */
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { createRng } from '../js/core/rng.js';
import {
  ITEMS, ITEM_BY_ID, PRICE_RANGES, normalizeInventory, ownedGame, trialLeftSec, canBuy, applyPurchase, equipPatch,
} from '../js/runner/shop.js';
import {
  PLAY_BLOCK_SEC, SESSION_MAX_SEC, MIN_START_SEC, FREE_TRIAL_SEC, playEarnedSec, playLeftSec, sessionSec, studyToNextBlockSec,
} from '../js/runner/play-time.js';
import { memoryDeck, PAIRS } from '../js/games/memory.js';
import { lightsToggle, lightsFromPresses, lightsPuzzle, lightsSolved } from '../js/games/lights.js';
import { slideGoal, slideSolved, slideMove, slideShuffle, slideKeyTarget } from '../js/games/slide.js';
import { slideLine, move2048, addTile, canMove2048, new2048 } from '../js/games/g2048.js';

const GAMES = ITEMS.filter((i) => i.category === 'game');

test('giờ chơi: mỗi 15 phút học mở 15 phút chơi, mỗi lượt tối đa 15 phút', () => {
  assert.equal(PLAY_BLOCK_SEC, 900);
  assert.equal(SESSION_MAX_SEC, 900);
  assert.equal(playEarnedSec(0), 0);
  assert.equal(playEarnedSec(899), 0);
  assert.equal(playEarnedSec(900), 900);
  assert.equal(playEarnedSec(2000), 1800);
  assert.equal(playLeftSec(899, 0), 0);
  assert.equal(playLeftSec(1900, 300), 1500);
  assert.equal(playLeftSec(1000, 2000), 0);
  assert.equal(sessionSec(1500), 900);   // còn 25′ → lượt này 15′
  assert.equal(sessionSec(400), 400);
  assert.equal(sessionSec(MIN_START_SEC - 1), 0);
  assert.equal(studyToNextBlockSec(0), 900);
  assert.equal(studyToNextBlockSec(600), 300);
  assert.equal(studyToNextBlockSec(900), 900);
});

test('danh mục trò chơi: giá 15–30⭐, có file js/games/<game>.js, mua một lần, không trang bị', () => {
  assert.deepEqual(PRICE_RANGES.game, [15, 30]);
  assert.ok(GAMES.length >= 3);
  for (const g of GAMES) {
    assert.match(g.game, /^[a-z0-9]+$/, g.id);
    assert.ok(g.icon && g.desc, g.id);
    assert.ok(existsSync(new URL('../js/games/' + g.game + '.js', import.meta.url)), g.id);
  }
  const game = ITEM_BY_ID['game-memory'];
  let inv = normalizeInventory({});
  assert.equal(ownedGame(inv, game.id), null);
  assert.ok(canBuy(game, inv, game.price).ok);
  inv = applyPurchase(inv, game);
  assert.equal(ownedGame(inv, game.id), game);
  assert.equal(normalizeInventory({ owned: [game.id] }).owned[0], game.id);
  assert.equal(canBuy(game, inv, 999).reason, 'owned');
  assert.equal(ownedGame(normalizeInventory({ owned: ['title-tan-binh'] }), 'title-tan-binh'), null);
  assert.equal(equipPatch(inv, undefined, game.id).ok, false);
});

test('chơi thử miễn phí: mỗi trò vừa mua có 15 phút, chỉ một lần, chưa mua thì không có', () => {
  assert.equal(FREE_TRIAL_SEC, 900);
  const id = 'game-2048';
  assert.equal(trialLeftSec(normalizeInventory({}), id), 0);
  assert.equal(trialLeftSec(normalizeInventory({ owned: [id] }), id), 900);
  assert.equal(trialLeftSec(normalizeInventory({ owned: [id], trialSec: { [id]: 600 } }), id), 300);
  assert.equal(trialLeftSec(normalizeInventory({ owned: [id], trialSec: { [id]: 2000 } }), id), 0);
  assert.equal(sessionSec(trialLeftSec(normalizeInventory({ owned: [id], trialSec: { [id]: 890 } }), id)), 0);
  /* field lạ / id không phải trò chơi bị bỏ */
  assert.deepEqual(normalizeInventory({ trialSec: { 'title-tan-binh': 5, nope: 3, [id]: 'x' } }).trialSec, {});
  /* mua xong → được chơi thử ngay (kho sau khi mua vẫn chưa có trialSec của trò đó) */
  const bought = applyPurchase(normalizeInventory({}), ITEM_BY_ID[id]);
  assert.equal(trialLeftSec(bought, id), 900);
});

test('tất cả trò chơi có HELP và mount', async () => {
  for (const g of GAMES) {
    const m = await import('../js/games/' + g.game + '.js');
    assert.equal(typeof m.mount, 'function', g.id);
    assert.ok(m.HELP, g.id);
  }
});

test('lật hình: 8 cặp, mỗi hình đúng 2 thẻ', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const deck = memoryDeck(createRng(seed));
    assert.equal(deck.length, PAIRS * 2);
    const counts = {};
    for (const s of deck) counts[s] = (counts[s] || 0) + 1;
    assert.equal(Object.keys(counts).length, PAIRS);
    assert.ok(Object.values(counts).every((n) => n === 2));
  }
});

test('tắt đèn: bấm đổi chữ thập, bấm lại đúng các ô đã bấm là giải xong', () => {
  const n = 5;
  const g = lightsToggle(Array(n * n).fill(false), n, 0);
  assert.deepEqual(g.map((v, i) => (v ? i : -1)).filter((i) => i >= 0), [0, 1, 5]);
  const mid = lightsToggle(Array(n * n).fill(false), n, 12);
  assert.equal(mid.filter(Boolean).length, 5);
  for (let seed = 1; seed <= 100; seed++) {
    const rng = createRng(seed);
    const presses = rng.shuffle([...Array(n * n).keys()]).slice(0, rng.int(6, 10));
    const board = lightsFromPresses(n, presses);
    assert.ok(lightsSolved(presses.reduce((g, i) => lightsToggle(g, n, i), board)), 'seed ' + seed);
    assert.ok(!lightsSolved(lightsPuzzle(createRng(seed), n, 8)));
  }
});

test('trượt số: nước đi hợp lệ, trượt cả dãy, xáo trộn luôn giải được', () => {
  const n = 4;
  const goal = slideGoal(n);
  assert.ok(slideSolved(goal));
  assert.equal(slideMove(goal, n, 15), null);       // bấm ô trống
  assert.equal(slideMove(goal, n, 0 + 5), null);     // không cùng hàng/cột
  const t = slideMove(goal, n, 12);                   // cùng hàng cuối: 13 14 15 dịch sang phải
  assert.deepEqual(t.slice(12), [0, 13, 14, 15]);
  const c = slideMove(goal, n, 3);                    // cùng cột cuối: 4 8 12 dịch xuống
  assert.deepEqual([c[3], c[7], c[11], c[15]], [0, 4, 8, 12]);
  assert.equal(slideKeyTarget(goal, n, 'ArrowLeft'), -1);
  assert.equal(slideKeyTarget(goal, n, 'ArrowRight'), 14);
  assert.equal(slideKeyTarget(goal, n, 'ArrowDown'), 11);
  /* n chẵn: bảng giải được ⇔ số nghịch thế + hàng của ô trống (đếm từ dưới, bắt đầu 1) là số lẻ */
  const solvable = (tiles) => {
    const v = tiles.filter(Boolean);
    let inv = 0;
    for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) if (v[i] > v[j]) inv++;
    const rowFromBottom = n - Math.floor(tiles.indexOf(0) / n);
    return (inv + rowFromBottom) % 2 === 1;
  };
  assert.ok(solvable(goal));
  for (let seed = 1; seed <= 200; seed++) {
    const s = slideShuffle(createRng(seed), n);
    assert.equal([...s].sort((a, b) => a - b).join(), [...goal].sort((a, b) => a - b).join());
    assert.ok(!slideSolved(s));
    assert.ok(solvable(s), 'seed ' + seed);
  }
});

test('2048: dồn & gộp mỗi ô một lần, thêm ô mới, phát hiện hết nước', () => {
  assert.deepEqual(slideLine([2, 2, 4, 0]), { line: [4, 4, 0, 0], gained: 4 });
  assert.deepEqual(slideLine([2, 2, 2, 2]), { line: [4, 4, 0, 0], gained: 8 });
  assert.deepEqual(slideLine([0, 4, 0, 4]), { line: [8, 0, 0, 0], gained: 8 });
  assert.deepEqual(slideLine([2, 4, 8, 16]), { line: [2, 4, 8, 16], gained: 0 });
  const g = [
    2, 0, 0, 2,
    0, 0, 0, 0,
    4, 0, 0, 0,
    4, 0, 0, 0,
  ];
  assert.deepEqual(move2048(g, 'left').grid.slice(0, 4), [4, 0, 0, 0]);
  assert.deepEqual(move2048(g, 'right').grid.slice(0, 4), [0, 0, 0, 4]);
  const up = move2048(g, 'up');
  assert.deepEqual([up.grid[0], up.grid[4], up.grid[8]], [2, 8, 0]);
  assert.equal(up.gained, 8);
  const down = move2048(g, 'down');
  assert.deepEqual([down.grid[4], down.grid[8], down.grid[12]], [0, 2, 8]);
  const stuck = [2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2];
  assert.equal(canMove2048(stuck), false);
  for (const dir of ['left', 'right', 'up', 'down']) assert.equal(move2048(stuck, dir).moved, false);
  assert.equal(addTile(stuck, createRng(1)), stuck);
  const start = new2048(createRng(7));
  assert.equal(start.filter(Boolean).length, 2);
  assert.ok(start.filter(Boolean).every((v) => v === 2 || v === 4));
  assert.ok(canMove2048(start));
});
