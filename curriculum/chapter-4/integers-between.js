/* Tìm các số nguyên x nằm giữa hai số thập phân (phiếu học tập 4.1 — Bài 2, vd −3,55 < x < 3,55):
   a) hai cận đều là số thập phân;  b) một cận là số nguyên (có thể lấy hoặc không lấy dấu bằng).
   Cận lưu theo phần trăm (h = số × 100) để so sánh chính xác. */
import { fmtDec, minus } from '../../js/core/mathfmt.js';
import { parseNumberSet, sameNumberSet } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const LABELS = ['a', 'b'];

/* Số thập phân không nguyên trong khoảng [lo, hi] (đơn vị), 1 hoặc 2 chữ số thập phân → phần trăm. */
function decimal(rng, lo, hi) {
  const two = rng.int(0, 1) === 1;
  for (;;) {
    const h = two ? rng.int(lo * 100, hi * 100) : rng.int(lo * 10, hi * 10) * 10;
    if (h % 100 !== 0 && (!two || h % 10 !== 0)) return h;
  }
}

function makeA(rng) {
  const lo = -decimal(rng, 1, 5);
  return { lo, hi: rng.int(0, 1) ? -lo : decimal(rng, 1, 5), loIn: false, hiIn: false };
}

function makeB(rng) {
  const n = rng.int(-6, 2) * 100, width = decimal(rng, 2, 5), incl = rng.int(0, 1) === 1;
  return rng.int(0, 1)
    ? { lo: n, hi: n + width, loIn: incl, hiIn: false }
    : { lo: n - width, hi: n, loIn: false, hiIn: incl };
}

const showH = (h) => fmtDec(h / 100);
const showRange = (r) => showH(r.lo) + (r.loIn ? ' ≤ ' : ' &lt; ') + '<i>x</i>' + (r.hiIn ? ' ≤ ' : ' &lt; ') + showH(r.hi);
const first = (r) => (r.lo % 100 === 0 ? r.lo / 100 + (r.loIn ? 0 : 1) : Math.ceil(r.lo / 100));
const last = (r) => (r.hi % 100 === 0 ? r.hi / 100 - (r.hiIn ? 0 : 1) : Math.floor(r.hi / 100));
function integersOf(r) {
  const out = [];
  for (let x = first(r); x <= last(r); x++) out.push(x);
  return out;
}
const listText = (r) => integersOf(r).map(minus).join(' ; ');

/* Giải thích cho một cận: số nguyên đầu tiên/cuối cùng được lấy và lý do. */
function boundLine(h, incl, isLow, pick) {
  const side = isLow ? 'lớn hơn' : 'nhỏ hơn';
  if (h % 100 === 0) {
    return incl
      ? '<i>x</i> ' + (isLow ? '≥ ' : '≤ ') + showH(h) + ' nên lấy cả <b>' + minus(pick) + '</b>'
      : '<i>x</i> ' + side + ' ' + showH(h) + ' (không lấy ' + showH(h) + ') nên bắt đầu từ <b>' + minus(pick) + '</b>';
  }
  const a = Math.floor(h / 100);
  return showH(h) + ' nằm giữa hai số nguyên ' + minus(a) + ' và ' + minus(a + 1) + ' → số nguyên ' + side + ' ' + showH(h) +
    (isLow ? ' nhỏ nhất' : ' lớn nhất') + ' là <b>' + minus(pick) + '</b>';
}

export default {
  id: 'ch4.integers-between',
  chapter: 4,
  topic: '4.1',
  title: 'Tìm số nguyên nằm giữa hai số thập phân',
  shortTitle: 'Số nguyên giữa hai số thập phân',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    return { ranges: [makeA(rng), makeB(rng)] };
  },

  render(p, ui) {
    return '<p class="q-prompt">Tìm tất cả các số nguyên <i>x</i> thỏa mãn:</p>' +
      p.ranges.map((r, i) =>
        '<div class="sub"><span class="sub-label">' + LABELS[i] + '.</span> ' + showRange(r) + ' &nbsp; ⟹ &nbsp;<i>x</i> ∈ { ' +
          ui.blank('x' + i, { width: 220, placeholder: 'vd: −1 ; 0 ; 1' }) + ' }' + ui.feedback('x' + i, { inline: true }) + '</div>').join('') +
      ui.hint('Các số cách nhau bằng dấu ;');
  },

  grade(p, ans) {
    return {
      parts: p.ranges.map((r, i) =>
        part('x' + i, sameNumberSet(parseNumberSet(ans['x' + i]), integersOf(r)), 0.5, listText(r))),
    };
  },

  solve(p) {
    const out = {};
    p.ranges.forEach((r, i) => { out['x' + i] = integersOf(r).join(' ; '); });
    return out;
  },

  describe(p) {
    return p.ranges.map((r) => showRange(r).replace(/<\/?i>/g, '').replace(/&lt;/g, '<')).join(' ; ');
  },

  explain(p) {
    return p.ranges.map((r, i) =>
      '<p><b>' + LABELS[i] + ')</b> ' + showRange(r) + '</p>' +
      '<p>&nbsp;&nbsp;• ' + boundLine(r.lo, r.loIn, true, first(r)) + '</p>' +
      '<p>&nbsp;&nbsp;• ' + boundLine(r.hi, r.hiIn, false, last(r)) + '</p>' +
      '<p>&nbsp;&nbsp;⟹ <i>x</i> ∈ { <b>' + listText(r) + '</b> }</p>');
  },
};
