/* Tắt đèn (game-lights): bảng 5×5, bấm một ô thì ô đó và 4 ô kề đổi trạng thái; tắt hết đèn là thắng.
   Đề tạo bằng cách bấm ngẫu nhiên từ bảng tắt hết nên luôn giải được.
   mount(root, ctx) — ctx: { rng, sound(name), info(text), win(text) } (js/pages/game-page.js). */
export const HELP = 'Bấm một ô: ô đó và các ô sát cạnh (trên, dưới, trái, phải) cùng đổi bật ↔ tắt. Tắt hết đèn để thắng!';
export const SIZE = 5;

export function lightsToggle(grid, n, i) {
  const g = grid.slice();
  const r = Math.floor(i / n), c = i % n;
  for (const [dr, dc] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) {
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && rr < n && cc >= 0 && cc < n) g[rr * n + cc] = !g[rr * n + cc];
  }
  return g;
}

export const lightsSolved = (grid) => grid.every((on) => !on);

/* Bảng có được khi bấm lần lượt các ô `presses` từ bảng tắt hết (bấm lại đúng các ô đó là giải xong). */
export function lightsFromPresses(n, presses) {
  return presses.reduce((g, i) => lightsToggle(g, n, i), Array(n * n).fill(false));
}

/* count ô khác nhau bấm từ bảng tắt hết; trùng về bảng tắt hết thì tạo lại. */
export function lightsPuzzle(rng, n = SIZE, count = 8) {
  let g;
  do g = lightsFromPresses(n, rng.shuffle([...Array(n * n).keys()]).slice(0, count));
  while (lightsSolved(g));
  return g;
}

export function mount(root, { rng, sound, info, win }) {
  const n = SIZE;
  let grid = lightsPuzzle(rng, n, rng.int(6, 10));
  let moves = 0, over = false;
  root.innerHTML = '<div class="lights-grid" style="--n:' + n + '">' + grid.map((_, i) =>
    '<button type="button" class="light" data-sound="self" data-i="' + i + '" aria-label="Ô ' + (Math.floor(i / n) + 1) + '-' + (i % n + 1) + '"></button>').join('') + '</div>';
  const board = root.firstElementChild;
  const cells = [...board.children];
  const draw = () => {
    cells.forEach((c, i) => { c.classList.toggle('on', grid[i]); c.setAttribute('aria-pressed', String(grid[i])); });
    info('Lượt bấm: ' + moves + ' · Đèn còn sáng: ' + grid.filter(Boolean).length);
  };

  function onClick(e) {
    const btn = e.target.closest('.light');
    if (!btn || over) return;
    grid = lightsToggle(grid, n, Number(btn.dataset.i));
    moves++;
    draw();
    if (lightsSolved(grid)) {
      over = true;
      win('🎉 Tắt hết đèn sau ' + moves + ' lượt bấm!');
    } else sound('click');
  }

  board.addEventListener('click', onClick);
  draw();
  return {
    stop() {
      over = true;
      board.removeEventListener('click', onClick);
    },
  };
}
