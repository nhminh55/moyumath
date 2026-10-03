/* Lật hình ghi nhớ (game-memory): 16 thẻ úp = 8 cặp, lật hai thẻ mỗi lượt.
   mount(root, ctx) — ctx: { rng, sound(name), info(text), win(text) } (js/pages/game-page.js). */
export const HELP = 'Lật hai thẻ mỗi lượt. Hai thẻ giống nhau thì được giữ lại mở; tìm đủ 8 cặp với càng ít lượt càng tốt.';

const SYMBOLS = ['🦊', '🦉', '🐼', '🐉', '🦄', '🐋', '🐱', '🐧', '🐢', '🦋', '🐙', '🦁'];
export const PAIRS = 8;

export function memoryDeck(rng, pairs = PAIRS) {
  const picks = rng.shuffle(SYMBOLS).slice(0, pairs);
  return rng.shuffle([...picks, ...picks]);
}

export function mount(root, { rng, sound, info, win }) {
  const deck = memoryDeck(rng);
  const matched = new Set();
  let open = [], moves = 0, lock = false, timer = null;
  root.innerHTML = '<div class="memory-grid">' + deck.map((s, i) =>
    '<button type="button" class="mem-card" data-sound="self" data-i="' + i + '" aria-label="Thẻ úp">' +
    '<span class="mem-back" aria-hidden="true">?</span><span class="mem-front" aria-hidden="true">' + s + '</span></button>').join('') + '</div>';
  const grid = root.firstElementChild;
  const cards = [...grid.children];
  const show = () => info('Lượt: ' + moves + ' · Đã tìm ' + matched.size / 2 + '/' + PAIRS + ' cặp');
  const setOpen = (i, on) => {
    cards[i].classList.toggle('open', on);
    cards[i].setAttribute('aria-label', on ? deck[i] : 'Thẻ úp');
  };

  function onClick(e) {
    const btn = e.target.closest('.mem-card');
    if (!btn || lock) return;
    const i = Number(btn.dataset.i);
    if (matched.has(i) || open.includes(i)) return;
    setOpen(i, true);
    open.push(i);
    if (open.length < 2) { sound('click'); return; }
    moves++;
    const [a, b] = open;
    open = [];
    if (deck[a] === deck[b]) {
      matched.add(a);
      matched.add(b);
      cards[a].classList.add('done');
      cards[b].classList.add('done');
      show();
      if (matched.size === deck.length) win('🎉 Tìm đủ ' + PAIRS + ' cặp sau ' + moves + ' lượt!');
      else sound('correct');
      return;
    }
    show();
    sound('wrong');
    lock = true;
    timer = setTimeout(() => { setOpen(a, false); setOpen(b, false); lock = false; }, 850);
  }

  grid.addEventListener('click', onClick);
  show();
  return {
    stop() {
      clearTimeout(timer);
      lock = true;
      grid.removeEventListener('click', onClick);
    },
  };
}
