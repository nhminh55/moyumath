/* Trượt số 15 (game-slide): bảng 4×4 có một ô trống, trượt các ô về thứ tự 1 → 15.
   Đề tạo bằng các nước trượt ngẫu nhiên từ bảng đã xếp nên luôn giải được.
   mount(root, ctx) — ctx: { rng, sound(name), info(text), win(text) } (js/pages/game-page.js). */
export const HELP = 'Bấm một ô cùng hàng hoặc cùng cột với ô trống để trượt (hoặc dùng phím mũi tên). Xếp lại 1 → 15, ô trống ở cuối.';
export const SIZE = 4;

export const slideGoal = (n = SIZE) => [...Array(n * n - 1).keys()].map((i) => i + 1).concat(0);
export const slideSolved = (tiles) => tiles.every((v, i) => v === (i === tiles.length - 1 ? 0 : i + 1));

/* Bấm ô i: nếu cùng hàng/cột với ô trống thì cả dãy giữa hai ô trượt một bước về phía ô trống. Không hợp lệ → null. */
export function slideMove(tiles, n, i) {
  const b = tiles.indexOf(0);
  if (i === b || i < 0 || i >= tiles.length) return null;
  const sameRow = Math.floor(i / n) === Math.floor(b / n), sameCol = i % n === b % n;
  if (!sameRow && !sameCol) return null;
  const step = sameRow ? (i > b ? 1 : -1) : (i > b ? n : -n);
  const t = tiles.slice();
  for (let k = b; k !== i; k += step) t[k] = t[k + step];
  t[i] = 0;
  return t;
}

/* Ô bị phím mũi tên đẩy vào ô trống (ArrowLeft: ô bên phải ô trống trượt sang trái…). */
export function slideKeyTarget(tiles, n, key) {
  const b = tiles.indexOf(0), r = Math.floor(b / n), c = b % n;
  switch (key) {
    case 'ArrowLeft': return c < n - 1 ? b + 1 : -1;
    case 'ArrowRight': return c > 0 ? b - 1 : -1;
    case 'ArrowUp': return r < n - 1 ? b + n : -1;
    case 'ArrowDown': return r > 0 ? b - n : -1;
    default: return -1;
  }
}

export function slideShuffle(rng, n = SIZE, steps = 160) {
  let t;
  do {
    t = slideGoal(n);
    let prev = -1;
    for (let k = 0; k < steps; k++) {
      const b = t.indexOf(0);
      const near = [b - n, b + n, b % n ? b - 1 : -1, b % n < n - 1 ? b + 1 : -1].filter((i) => i >= 0 && i < n * n && i !== prev);
      const i = rng.pick(near);
      t = slideMove(t, n, i);
      prev = b;
    }
  } while (slideSolved(t));
  return t;
}

export function mount(root, { rng, sound, info, win }) {
  const n = SIZE;
  let tiles = slideShuffle(rng, n);
  let moves = 0, over = false;
  root.innerHTML = '<div class="slide-grid" style="--n:' + n + '"></div>';
  const board = root.firstElementChild;
  const draw = () => {
    board.innerHTML = tiles.map((v, i) => v
      ? '<button type="button" class="slide-tile' + (v === i + 1 ? ' home' : '') + '" data-sound="self" data-i="' + i + '">' + v + '</button>'
      : '<span class="slide-tile empty" aria-hidden="true"></span>').join('');
    info('Số nước: ' + moves);
  };

  function play(i) {
    if (over || i < 0) return;
    const next = slideMove(tiles, n, i);
    if (!next) return;
    tiles = next;
    moves++;
    draw();
    if (slideSolved(tiles)) {
      over = true;
      win('🎉 Xếp xong sau ' + moves + ' nước!');
    } else sound('click');
  }
  const onClick = (e) => {
    const btn = e.target.closest('.slide-tile[data-i]');
    if (btn) play(Number(btn.dataset.i));
  };
  const onKey = (e) => {
    if (!e.key.startsWith('Arrow') || e.target.closest?.('input, textarea')) return;
    e.preventDefault();
    play(slideKeyTarget(tiles, n, e.key));
    board.querySelector('.slide-tile[data-i]')?.blur();
  };

  board.addEventListener('click', onClick);
  window.addEventListener('keydown', onKey);
  draw();
  return {
    stop() {
      over = true;
      board.removeEventListener('click', onClick);
      window.removeEventListener('keydown', onKey);
    },
  };
}
