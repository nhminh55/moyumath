/* 2048 (game-2048): bảng 4×4, vuốt / phím mũi tên dồn các ô; hai ô bằng nhau chạm nhau thì gộp thành tổng.
   mount(root, ctx) — ctx: { rng, sound(name), info(text), win(text), lose(text) } (js/pages/game-page.js). */
export const HELP = 'Dùng phím mũi tên (hoặc vuốt trên bảng) để dồn các ô. Hai ô cùng số chạm nhau sẽ gộp lại — tạo được ô 2048 là thắng!';
export const SIZE = 4;
export const GOAL = 2048;

/* Dồn một hàng về đầu mảng: [2, 2, 4, 0] → { line: [4, 4, 0, 0], gained: 4 } (mỗi ô chỉ gộp một lần mỗi nước). */
export function slideLine(line) {
  const vals = line.filter(Boolean);
  const out = [];
  let gained = 0;
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] === vals[i + 1]) {
      out.push(vals[i] * 2);
      gained += vals[i] * 2;
      i++;
    } else out.push(vals[i]);
  }
  while (out.length < line.length) out.push(0);
  return { line: out, gained };
}

/* Chỉ số các ô của từng hàng theo chiều dồn (ô sát tường trước). */
function lines(n, dir) {
  const out = [];
  for (let a = 0; a < n; a++) {
    const idx = [];
    for (let b = 0; b < n; b++) idx.push(dir === 'left' || dir === 'right' ? a * n + b : b * n + a);
    out.push(dir === 'right' || dir === 'down' ? idx.reverse() : idx);
  }
  return out;
}

/* dir: 'left' | 'right' | 'up' | 'down' → { grid, moved, gained } */
export function move2048(grid, dir, n = SIZE) {
  const g = grid.slice();
  let gained = 0;
  for (const idx of lines(n, dir)) {
    const res = slideLine(idx.map((i) => grid[i]));
    idx.forEach((i, k) => { g[i] = res.line[k]; });
    gained += res.gained;
  }
  return { grid: g, moved: g.some((v, i) => v !== grid[i]), gained };
}

export function addTile(grid, rng) {
  const empty = grid.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  if (!empty.length) return grid;
  const g = grid.slice();
  g[rng.pick(empty)] = rng.next() < 0.9 ? 2 : 4;
  return g;
}

export function canMove2048(grid, n = SIZE) {
  return grid.some((v, i) => !v || (i % n < n - 1 && v === grid[i + 1]) || (i + n < grid.length && v === grid[i + n]));
}

export const new2048 = (rng, n = SIZE) => addTile(addTile(Array(n * n).fill(0), rng), rng);

const KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };

export function mount(root, { rng, sound, info, win, lose }) {
  const n = SIZE;
  let grid = new2048(rng, n);
  let score = 0, won = false, over = false;
  root.innerHTML = '<div class="g2048-grid" style="--n:' + n + '" role="img" aria-label="Bảng 2048"></div>';
  const board = root.firstElementChild;
  const draw = () => {
    board.innerHTML = grid.map((v) => '<span class="g2048-tile"' + (v ? ' data-v="' + Math.min(v, 4096) + '"' : '') + '>' + (v || '') + '</span>').join('');
    info('Điểm: ' + score + ' · Ô lớn nhất: ' + Math.max(...grid));
  };

  function play(dir) {
    if (over) return;
    const res = move2048(grid, dir, n);
    if (!res.moved) return;
    grid = addTile(res.grid, rng);
    score += res.gained;
    draw();
    if (!won && grid.includes(GOAL)) {
      won = true;
      win('🎉 Bé đã tạo được ô ' + GOAL + '! Chơi tiếp để phá kỷ lục nhé.');
    } else if (!canMove2048(grid, n)) {
      over = true;
      lose('Hết nước đi! Điểm: ' + score + '.');
    } else if (res.gained) sound('click');
  }

  const onKey = (e) => {
    const dir = KEYS[e.key];
    if (!dir || e.target.closest?.('input, textarea')) return;
    e.preventDefault();
    play(dir);
  };
  let start = null;
  const onDown = (e) => { start = { x: e.clientX, y: e.clientY }; };
  const onUp = (e) => {
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    start = null;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    play(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
  };

  window.addEventListener('keydown', onKey);
  board.addEventListener('pointerdown', onDown);
  board.addEventListener('pointerup', onUp);
  board.addEventListener('pointercancel', () => { start = null; });
  draw();
  return {
    stop() {
      over = true;
      window.removeEventListener('keydown', onKey);
      board.removeEventListener('pointerdown', onDown);
      board.removeEventListener('pointerup', onUp);
    },
  };
}
