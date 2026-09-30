/* Sắp xếp các số thập phân theo thứ tự tăng/giảm dần (Đề cương giữa kỳ I — Câu 21, 22):
   a) số thập phân âm/dương;  b) số đo có đơn vị khác nhau (phải đổi về cùng đơn vị).
   Học sinh chọn số cho từng vị trí bằng ô chọn — tránh nhập nhằng dấu phẩy thập phân / dấu phân cách. */
import { fmtDec } from '../../js/core/mathfmt.js';
import { partial } from '../../js/core/grading.js';

const UNITS = [
  { big: 'kg', small: 'g', f: 1000, pick: (rng) => rng.int(12, 30) * 50 },     // 600 g … 1500 g
  { big: 'm', small: 'cm', f: 100, pick: (rng) => rng.int(12, 40) * 5 },       // 60 cm … 200 cm
  { big: 'cm', small: 'mm', f: 10, pick: (rng) => rng.int(15, 60) },           // 15 mm … 60 mm
];
const N = 4;

/* Số thập phân lưu theo phần trăm (h = số × 100) để so sánh chính xác. */
function numbersA(rng) {
  if (rng.int(0, 1)) {
    /* Các số "cùng chữ số" dễ nhầm, như 4,06 ; −4,6 ; 0,46 ; −0,4 */
    const d1 = rng.int(1, 9), d2 = rng.intExcept(1, 9, [d1]);
    return [d1 * 100 + d2, -(d1 * 100 + d2 * 10), d1 * 10 + d2, -d1 * 10];
  }
  const c = rng.int(-12, 12), out = [];
  while (out.length < N) {
    const h = c * 100 + rng.int(-150, 150);
    if (!out.includes(h)) out.push(h);
  }
  return out;
}

function measuresB(rng) {
  const u = rng.int(0, UNITS.length - 1), U = UNITS[u], vals = [];
  while (vals.length < N) {
    const v = U.pick(rng);
    if (!vals.includes(v)) vals.push(v);
  }
  /* Hai số viết theo đơn vị lớn, hai số theo đơn vị nhỏ. */
  const big = rng.shuffle([true, true, false, false]);
  return { u, items: vals.map((v, i) => ({ v, big: big[i] })) };
}

const labelB = (U, it) => (it.big ? fmtDec(it.v / U.f) + ' ' + U.big : it.v + ' ' + U.small);

function parts(p) {
  const U = UNITS[p.b.u];
  return [
    { key: 'a', labels: p.a.map((h) => fmtDec(h / 100)), values: p.a, asc: p.ascA },
    { key: 'b', labels: p.b.items.map((it) => labelB(U, it)), values: p.b.items.map((it) => it.v), asc: p.ascB },
  ].map((q) => ({ ...q, order: q.values.map((v, i) => i).sort((i, j) => (q.asc ? q.values[i] - q.values[j] : q.values[j] - q.values[i])) }));
}

export default {
  id: 'ch4.order-decimals',
  chapter: 4,
  topic: '4.1',
  title: 'Sắp xếp các số thập phân',
  shortTitle: 'Sắp xếp số thập phân',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    return { a: rng.shuffle(numbersA(rng)), ascA: rng.int(0, 1) === 1, b: measuresB(rng), ascB: rng.int(0, 1) === 1 };
  },

  render(p, ui) {
    return parts(p).map((q, k) => {
      const options = q.labels.map((l, i) => ({ value: String(i), label: l }));
      const sign = q.asc ? ' &lt; ' : ' &gt; ';
      return '<div class="sub"><span class="sub-label">' + q.key + '.</span> Sắp xếp theo thứ tự <b>' + (q.asc ? 'tăng dần' : 'giảm dần') +
        '</b>: ' + q.labels.join(' ; ') +
        '<div class="factor-row">' + q.labels.map((l, j) => ui.select(q.key + j, options, { placeholder: '—' })).join(sign) + '</div>' +
        ui.feedback(q.key) + '</div>';
    }).join('');
  },

  grade(p, ans) {
    return {
      parts: parts(p).map((q) => {
        const marks = {};
        let hit = 0;
        q.order.forEach((idx, j) => {
          marks[q.key + j] = ans[q.key + j] === String(idx);
          if (marks[q.key + j]) hit++;
        });
        return partial(q.key, hit * 0.125, 0.5, q.order.map((i) => q.labels[i]).join(q.asc ? ' < ' : ' > '), { marks });
      }),
    };
  },

  solve(p) {
    const out = {};
    for (const q of parts(p)) q.order.forEach((idx, j) => { out[q.key + j] = String(idx); });
    return out;
  },

  describe(p) {
    return parts(p).map((q) => q.labels.join('; ')).join(' / ');
  },

  explain(p) {
    const [qa, qb] = parts(p), U = UNITS[p.b.u];
    const neg = qa.values.filter((h) => h < 0).sort((x, y) => x - y), pos = qa.values.filter((h) => h >= 0).sort((x, y) => x - y);
    const list = (hs) => hs.map((h) => fmtDec(h / 100)).join(' < ');
    return [
      '<p><b>a) Bước 1 — Quy tắc so sánh:</b> số âm &lt; 0 &lt; số dương. Hai số dương: so phần nguyên, rồi hàng phần mười, phần trăm… ' +
        'Hai số âm: số nào có phần số (bỏ dấu −) <i>lớn hơn</i> thì <i>nhỏ hơn</i>.</p>' +
        '<p>&nbsp;&nbsp;Có thể viết thêm số 0 cho cùng số chữ số thập phân để dễ so sánh (vd 4,6 = 4,60 và 4,06).</p>',
      '<p><b>a) Bước 2 — Xếp từng nhóm:</b></p>' +
        (neg.length ? '<p>&nbsp;&nbsp;• Các số âm: ' + list(neg) + '</p>' : '') +
        (pos.length ? '<p>&nbsp;&nbsp;• Các số không âm: ' + list(pos) + '</p>' : '') +
        '<p>&nbsp;&nbsp;⟹ Thứ tự ' + (qa.asc ? 'tăng' : 'giảm') + ' dần: <b>' + qa.order.map((i) => qa.labels[i]).join(qa.asc ? ' < ' : ' > ') + '</b></p>',
      '<p><b>b) Bước 1 — Đổi về cùng đơn vị ' + U.small + '</b> (1 ' + U.big + ' = ' + U.f + ' ' + U.small + '):</p>' +
        p.b.items.map((it) => '<p>&nbsp;&nbsp;' + labelB(U, it) + (it.big ? ' = ' + fmtDec(it.v / U.f) + ' × ' + U.f + ' ' + U.small + ' = ' + it.v + ' ' + U.small : '') + '</p>').join(''),
      '<p><b>b) Bước 2 — So sánh rồi viết lại theo đơn vị ban đầu:</b></p>' +
        '<p>&nbsp;&nbsp;' + qb.order.map((i) => qb.values[i] + ' ' + U.small).join(qb.asc ? ' < ' : ' > ') + '</p>' +
        '<p>&nbsp;&nbsp;⟹ <b>' + qb.order.map((i) => qb.labels[i]).join(qb.asc ? ' < ' : ' > ') + '</b></p>',
    ];
  },
};
