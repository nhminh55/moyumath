/* Lập công thức từ bài toán thực tế rồi dùng công thức để tính (Đề cương giữa kỳ I — Câu 16).
   T = p·x + q·y ± k. Chấp nhận số viết có dấu tách nghìn: "25 000", "25.000". */
import { fmtDec } from '../../js/core/mathfmt.js';
import { num, sameNumber, equivalent } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const CONTEXTS = [
  { buy: 'mua x quyển sách, mỗi quyển {p} đồng và y quyển vở, mỗi quyển {q} đồng', X: 'quyển sách', Y: 'quyển vở',
    prices: [[20000, 35000], [4000, 9000]] },
  { buy: 'mua x vé người lớn, mỗi vé {p} đồng và y vé trẻ em, mỗi vé {q} đồng', X: 'vé người lớn', Y: 'vé trẻ em',
    prices: [[50000, 90000], [20000, 40000]] },
  { buy: 'mua x hộp bút, mỗi hộp {p} đồng và y cái thước, mỗi cái {q} đồng', X: 'hộp bút', Y: 'cái thước',
    prices: [[15000, 30000], [3000, 8000]] },
];
const EXTRAS = [
  { text: 'Người đó được giảm giá {k} đồng.', sign: -1, why: 'được giảm giá → <b>trừ</b> đi' },
  { text: 'Người đó phải trả thêm {k} đồng tiền giao hàng.', sign: 1, why: 'trả thêm → <b>cộng</b> thêm' },
];

const money = (n) => fmtDec(n, { group: true });
/* "212 000", "212.000", "212000 đồng" → 212000 */
function parseMoney(str) {
  const s = String(str ?? '').replace(/đồng|đ/gi, '').replace(/\s+/g, '');
  return num(/^[+-]?\d{1,3}(\.\d{3})+$/.test(s) ? s.replace(/\./g, '') : s);
}
/* Bỏ dấu cách/dấu chấm tách nghìn trong công thức học sinh gõ: "25.000x" → "25000x". */
const stripThousands = (s) => String(s ?? '').replace(/(\d)[ .](?=\d{3}(?!\d))/g, '$1');

function derive(p) {
  const ex = EXTRAS[p.extra];
  const T = p.p * p.x + p.q * p.y + ex.sign * p.k;
  const ascii = p.p + 'x+' + p.q + 'y' + (ex.sign < 0 ? '-' : '+') + p.k;
  const show = 'T = ' + money(p.p) + 'x + ' + money(p.q) + 'y ' + (ex.sign < 0 ? '− ' : '+ ') + money(p.k);
  return { ex, T, ascii, show };
}

export default {
  id: 'ch2.formula-word',
  chapter: 2,
  topic: '2.2',
  title: 'Lập công thức từ bài toán thực tế',
  shortTitle: 'Công thức thực tế',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    const ctx = rng.int(0, CONTEXTS.length - 1);
    const [[p1, p2], [q1, q2]] = CONTEXTS[ctx].prices;
    return {
      ctx,
      extra: rng.int(0, EXTRAS.length - 1),
      p: rng.int(p1 / 1000, p2 / 1000) * 1000,
      q: rng.int(q1 / 1000, q2 / 1000) * 1000,
      k: rng.pick([5000, 10000, 15000, 20000]),
      x: rng.int(2, 8),
      y: rng.int(3, 12),
    };
  },

  render(p, ui) {
    const c = CONTEXTS[p.ctx], ex = EXTRAS[p.extra];
    const text = 'Một người ' + c.buy.replace('{p}', money(p.p)).replace('{q}', money(p.q)) + '. ' + ex.text.replace('{k}', money(p.k));
    return '<p class="q-prompt">' + text + '</p>' +
      '<div class="sub"><span class="sub-label">a.</span> Viết công thức tính số tiền T phải trả: T = ' +
        ui.blank('a', { width: 220, placeholder: 'vd: 1000x + 500y − 200' }) + ui.feedback('a') + '</div>' +
      '<div class="sub"><span class="sub-label">b.</span> Dùng công thức để tính số tiền phải trả khi mua ' + p.x + ' ' + c.X +
        ' và ' + p.y + ' ' + c.Y + ': T = ' + ui.blank('b', { width: 120 }) + ' đồng' + ui.feedback('b') + '</div>';
  },

  grade(p, ans) {
    const d = derive(p);
    const input = stripThousands(ans.a).replace(/^\s*T\s*=/i, '');
    return {
      parts: [
        part('a', equivalent(input, d.ascii), 0.5, d.show),
        part('b', sameNumber(parseMoney(ans.b), d.T), 0.5, money(d.T) + ' đồng'),
      ],
    };
  },

  solve(p) {
    const d = derive(p);
    return { a: d.ascii, b: String(d.T) };
  },

  describe(p) {
    return derive(p).show;
  },

  explain(p) {
    const c = CONTEXTS[p.ctx], d = derive(p);
    const sign = d.ex.sign < 0 ? ' − ' : ' + ';
    return [
      '<p><b>Bước 1 — Tính từng khoản tiền:</b></p>' +
        '<p>&nbsp;&nbsp;• x ' + c.X + ', mỗi cái ' + money(p.p) + ' đồng → ' + money(p.p) + 'x (đồng)</p>' +
        '<p>&nbsp;&nbsp;• y ' + c.Y + ', mỗi cái ' + money(p.q) + ' đồng → ' + money(p.q) + 'y (đồng)</p>' +
        '<p>&nbsp;&nbsp;• ' + money(p.k) + ' đồng: ' + d.ex.why + '</p>',
      '<p><b>Bước 2 — Viết công thức:</b> <b>' + d.show + '</b></p>',
      '<p><b>Bước 3 — Thay x = ' + p.x + ', y = ' + p.y + ' vào công thức:</b></p>' +
        '<p>&nbsp;&nbsp;T = ' + money(p.p) + ' · ' + p.x + ' + ' + money(p.q) + ' · ' + p.y + sign + money(p.k) + '</p>' +
        '<p>&nbsp;&nbsp;T = ' + money(p.p * p.x) + ' + ' + money(p.q * p.y) + sign + money(p.k) + ' = <b>' + money(d.T) + '</b> đồng</p>',
    ];
  },
};
