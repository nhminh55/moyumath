/* Widget "nối cột A với cột B" cho ui.matching (markup do question-view.js tạo).
   Nối bằng cách kéo từ một ô sang ô bên kia, hoặc chạm ô này rồi chạm ô bên kia (dùng được bằng
   bàn phím: Enter/Space). Kéo một đầu nối ra chỗ trống để xoá. Mỗi ô chỉ nối được với một ô.
   Mỗi khi thay đổi, widget phát sự kiện "input" (bubbles) để trang lưu tạm bài làm. */
const SVG_NS = 'http://www.w3.org/2000/svg';
const DRAG_THRESHOLD = 5;

export function initMatching(root) {
  const svg = root.querySelector('svg.match-lines');
  const conns = {}; // leftId -> rightId
  let drag = null;
  let pending = null;
  let disabled = false;

  const sideOf = (item) => (item.closest('.match-left') ? 'left' : 'right');
  const byId = (id) => root.querySelector('.match-item[data-id="' + CSS.escape(id) + '"]');

  function center(item) {
    const d = item.querySelector('.dot').getBoundingClientRect();
    const c = root.getBoundingClientRect();
    return { x: d.left - c.left + d.width / 2, y: d.top - c.top + d.height / 2 };
  }

  function addLine(a, b, cls) {
    const l = document.createElementNS(SVG_NS, 'line');
    l.setAttribute('class', cls);
    l.setAttribute('x1', a.x); l.setAttribute('y1', a.y);
    l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
    svg.appendChild(l);
    return l;
  }

  function draw() {
    svg.querySelectorAll('line.conn').forEach((l) => l.remove());
    root.querySelectorAll('.match-item.connected').forEach((it) => it.classList.remove('connected'));
    for (const [lid, rid] of Object.entries(conns)) {
      const li = byId(lid), ri = byId(rid);
      if (!li || !ri) continue;
      addLine(center(li), center(ri), 'conn');
      li.classList.add('connected');
      ri.classList.add('connected');
    }
  }

  function changed() {
    draw();
    root.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function detach(item) {
    const id = item.dataset.id;
    if (sideOf(item) === 'left') delete conns[id];
    else for (const k of Object.keys(conns)) if (conns[k] === id) delete conns[k];
  }

  function connect(a, b) {
    const left = sideOf(a) === 'left' ? a : b;
    const right = left === a ? b : a;
    detach(left);
    detach(right);
    conns[left.dataset.id] = right.dataset.id;
    changed();
  }

  function setPending(item) {
    root.querySelectorAll('.match-item.pending').forEach((x) => { x.classList.remove('pending'); x.setAttribute('aria-pressed', 'false'); });
    pending = item;
    if (item) { item.classList.add('pending'); item.setAttribute('aria-pressed', 'true'); }
  }

  function tap(item) {
    if (pending && pending !== item && sideOf(pending) !== sideOf(item)) {
      connect(pending, item);
      setPending(null);
    } else {
      setPending(pending === item ? null : item);
    }
  }

  root.addEventListener('pointerdown', (e) => {
    if (disabled || e.button > 0) return;
    const item = e.target.closest('.match-item');
    if (!item) return;
    e.preventDefault();
    drag = { item, line: null, x: e.clientX, y: e.clientY };
    root.setPointerCapture(e.pointerId);
  });

  root.addEventListener('pointermove', (e) => {
    if (!drag) return;
    if (!drag.line) {
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < DRAG_THRESHOLD) return;
      setPending(null);
      detach(drag.item);
      draw();
      const c = center(drag.item);
      drag.line = addLine(c, c, 'drag');
    }
    const r = root.getBoundingClientRect();
    drag.line.setAttribute('x2', e.clientX - r.left);
    drag.line.setAttribute('y2', e.clientY - r.top);
  });

  function endDrag(e, cancelled) {
    if (!drag) return;
    const d = drag;
    drag = null;
    if (!d.line) {
      if (!cancelled) tap(d.item);
      return;
    }
    d.line.remove();
    const el = cancelled ? null : document.elementFromPoint(e.clientX, e.clientY);
    const target = el && el.closest('.match-item');
    if (target && root.contains(target) && sideOf(target) !== sideOf(d.item)) connect(d.item, target);
    else changed(); // thả ra chỗ trống → đã xoá nối cũ
  }
  root.addEventListener('pointerup', (e) => endDrag(e, false));
  root.addEventListener('pointercancel', (e) => endDrag(e, true));

  root.addEventListener('keydown', (e) => {
    const item = e.target.closest('.match-item');
    if (!item || disabled || (e.key !== 'Enter' && e.key !== ' ')) return;
    e.preventDefault();
    tap(item);
  });

  if (typeof ResizeObserver === 'function') new ResizeObserver(draw).observe(root);
  requestAnimationFrame(draw);

  return {
    get: () => ({ ...conns }),
    set(map) {
      for (const k of Object.keys(conns)) delete conns[k];
      Object.assign(conns, map || {});
      draw();
    },
    setDisabled(v) {
      disabled = v;
      root.classList.toggle('disabled', v);
      root.querySelectorAll('.match-item').forEach((it) => { it.tabIndex = v ? -1 : 0; });
      setPending(null);
    },
    redraw: draw,
  };
}
