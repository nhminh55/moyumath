/* Bất phương trình và biểu diễn trên trục số (Đề cương giữa kỳ I — Câu 13, 14):
   a) đọc bất phương trình từ trục số (● = có dấu bằng, ○ = không);  b) liệt kê các giá trị nguyên của x. */
import { minus } from '../../js/core/mathfmt.js';
import { parseNumberSet, sameNumberSet } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

/* kind: 'cc' = l ≤ x ≤ r, 'co' = l ≤ x < r, 'oc' = l < x ≤ r, 'oo' = l < x < r */
const KINDS = ['cc', 'co', 'oc', 'oo'];
const LINES = ['a1', 'a2'];

export const showIneq = ({ l, r, kind }) =>
  minus(l) + (kind[0] === 'c' ? ' ≤ ' : ' < ') + 'x' + (kind[1] === 'c' ? ' ≤ ' : ' < ') + minus(r);
export const integersOf = ({ l, r, kind }) => {
  const out = [];
  for (let n = kind[0] === 'c' ? l : l + 1; n <= (kind[1] === 'c' ? r : r - 1); n++) out.push(n);
  return out;
};

function makeRange(rng, kind) {
  const l = rng.int(-15, 6);
  return { l, r: l + rng.int(3, 6), kind };
}

function numberLine({ l, r, kind }) {
  const lo = l - 1, hi = r + 1, W = 320;
  const X = (t) => 20 + ((t - lo) * (W - 40)) / (hi - lo);
  let ticks = '';
  for (let t = lo; t <= hi; t++) {
    ticks += '<line x1="' + X(t) + '" y1="34" x2="' + X(t) + '" y2="42" stroke="currentColor"/>' +
      '<text x="' + X(t) + '" y="58" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="currentColor">' + minus(t) + '</text>';
  }
  const dot = (t, closed) => '<circle cx="' + X(t) + '" cy="20" r="5" stroke="currentColor" stroke-width="2" fill="' +
    (closed ? 'currentColor' : 'var(--paper, #fff)') + '"/>';
  return '<svg width="' + W + '" height="66" viewBox="0 0 ' + W + ' 66" style="color:var(--ink);max-width:100%;display:block;">' +
    '<line x1="8" y1="38" x2="' + (W - 8) + '" y2="38" stroke="currentColor" stroke-width="1.5"/>' + ticks +
    '<line x1="' + X(l) + '" y1="20" x2="' + X(r) + '" y2="20" stroke="currentColor" stroke-width="2"/>' +
    dot(l, kind[0] === 'c') + dot(r, kind[1] === 'c') + '</svg>';
}

export default {
  id: 'ch2.inequality',
  chapter: 2,
  topic: '2.6',
  title: 'Bất phương trình và trục số',
  shortTitle: 'Bất phương trình',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    const [k1, k2, k3] = rng.shuffle(KINDS);
    return { lines: [makeRange(rng, k1), makeRange(rng, k2)], list: makeRange(rng, k3) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Bất phương trình và trục số (dùng biến x):</p>' +
      p.lines.map((ln, i) =>
        '<div class="sub"><span class="sub-label">' + (i === 0 ? 'a' : 'b') + '.</span> Trục số dưới đây biểu diễn bất phương trình nào?' +
          numberLine(ln) + ui.select(LINES[i], KINDS.map((k) => ({ value: k, label: showIneq({ ...ln, kind: k }) }))) +
          ui.feedback(LINES[i], { inline: true }) + '</div>').join('') +
      '<div class="sub"><span class="sub-label">c.</span> Liệt kê tất cả các giá trị nguyên của x thỏa mãn ' + showIneq(p.list) + ':<br>' +
        ui.blank('b', { width: 220, placeholder: 'vd: −2 ; −1 ; 0 ; 1' }) + ui.feedback('b') +
        ui.hint('Các số cách nhau bằng dấu ;') + '</div>';
  },

  grade(p, ans) {
    return {
      parts: [
        ...p.lines.map((ln, i) => part(LINES[i], ans[LINES[i]] === ln.kind, 0.25, showIneq(ln))),
        part('b', sameNumberSet(parseNumberSet(ans.b), integersOf(p.list)), 0.5, integersOf(p.list).map(minus).join(' ; ')),
      ],
    };
  },

  solve(p) {
    return { a1: p.lines[0].kind, a2: p.lines[1].kind, b: integersOf(p.list).join(' ; ') };
  },

  describe(p) {
    return p.lines.map(showIneq).join(' ; ') + ' ; số nguyên thỏa mãn ' + showIneq(p.list);
  },

  explain(p) {
    const read = (ln, label) => {
      const end = (t, closed) => (closed ? '● tại ' + minus(t) + ': ' + minus(t) + ' <i>thuộc</i> tập nghiệm → dùng dấu ≤'
        : '○ tại ' + minus(t) + ': ' + minus(t) + ' <i>không thuộc</i> tập nghiệm → dùng dấu <');
      return '<p><b>' + label + ')</b> Đoạn tô đậm nằm giữa ' + minus(ln.l) + ' và ' + minus(ln.r) + '.</p>' +
        '<p>&nbsp;&nbsp;• Đầu trái ' + end(ln.l, ln.kind[0] === 'c') + '</p>' +
        '<p>&nbsp;&nbsp;• Đầu phải ' + end(ln.r, ln.kind[1] === 'c') + '</p>' +
        '<p>&nbsp;&nbsp;⟹ <b>' + showIneq(ln) + '</b></p>';
    };
    const L = p.list, ints = integersOf(L);
    return [
      '<p><b>Cách đọc trục số:</b> chấm tròn đặc ● nghĩa là số đó được lấy (≤ hoặc ≥); chấm tròn rỗng ○ nghĩa là không lấy (&lt; hoặc &gt;).</p>' +
        read(p.lines[0], 'a'),
      read(p.lines[1], 'b'),
      '<p><b>c)</b> ' + showIneq(L) + '</p>' +
        '<p>&nbsp;&nbsp;• Số nguyên nhỏ nhất: ' + (L.kind[0] === 'c' ? minus(L.l) + ' (có dấu ≤ nên lấy ' + minus(L.l) + ')'
          : minus(L.l + 1) + ' (dấu < nên không lấy ' + minus(L.l) + ')') + '</p>' +
        '<p>&nbsp;&nbsp;• Số nguyên lớn nhất: ' + (L.kind[1] === 'c' ? minus(L.r) + ' (có dấu ≤ nên lấy ' + minus(L.r) + ')'
          : minus(L.r - 1) + ' (dấu < nên không lấy ' + minus(L.r) + ')') + '</p>' +
        '<p>&nbsp;&nbsp;⟹ x ∈ { <b>' + ints.map(minus).join(' ; ') + '</b> }</p>',
    ];
  },
};
