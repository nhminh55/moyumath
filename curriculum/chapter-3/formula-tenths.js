/* Biến đổi công thức rồi tính, khi một đại lượng bằng 0,1 hoặc 0,01 (phiếu học tập 3.1 — Bài 3):
   a) chọn công thức biểu thị đại lượng cần tìm;  b) thay số và tính (chia cho 0,1 / 0,01 = nhân với 10 / 100).
   Số lưu dạng { m, k } = m × 10^(−k) để tính và hiển thị chính xác. */
import { fmtScaled } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

/* factor: đại lượng cần tìm = factor · big : small. options[0] là công thức đúng. */
const CTX = {
  triB: {
    factor: 2, big: 'A', small: 'h', find: 'b', unit: 'm', bigUnit: 'm²', smallUnit: 'm',
    text: (B, S) => 'Một hình tam giác có chiều cao h = ' + S + ' m và diện tích A = ' + B + ' m². ' +
      'Công thức tính diện tích tam giác là <b>A = ½·b·h</b> (b là độ dài cạnh đáy).',
    ask: 'độ dài cạnh đáy b',
    options: ['b = 2A : h', 'b = A : (2h)', 'b = 2h : A', 'b = A·h : 2'],
    derive: 'A = ½·b·h ⟹ 2A = b·h ⟹ b = 2A : h',
  },
  triH: {
    factor: 2, big: 'A', small: 'b', find: 'h', unit: 'm', bigUnit: 'm²', smallUnit: 'm',
    text: (B, S) => 'Một hình tam giác có cạnh đáy b = ' + S + ' m và diện tích A = ' + B + ' m². ' +
      'Công thức tính diện tích tam giác là <b>A = ½·b·h</b> (h là chiều cao).',
    ask: 'chiều cao h',
    options: ['h = 2A : b', 'h = A : (2b)', 'h = 2b : A', 'h = A·b : 2'],
    derive: 'A = ½·b·h ⟹ 2A = b·h ⟹ h = 2A : b',
  },
  rect: {
    factor: 1, big: 'A', small: 'b', find: 'a', unit: 'm', bigUnit: 'm²', smallUnit: 'm',
    text: (B, S) => 'Một hình chữ nhật có chiều rộng b = ' + S + ' m và diện tích A = ' + B + ' m². ' +
      'Công thức tính diện tích hình chữ nhật là <b>A = a·b</b> (a là chiều dài).',
    ask: 'chiều dài a',
    options: ['a = A : b', 'a = A·b', 'a = b : A', 'a = A − b'],
    derive: 'A = a·b ⟹ a = A : b',
  },
  move: {
    factor: 1, big: 's', small: 't', find: 'v', unit: 'km/h', bigUnit: 'km', smallUnit: 'giờ',
    text: (B, S) => 'Một xe máy đi được quãng đường s = ' + B + ' km trong thời gian t = ' + S + ' giờ. ' +
      'Công thức tính quãng đường là <b>s = v·t</b> (v là vận tốc).',
    ask: 'vận tốc v',
    options: ['v = s : t', 'v = s·t', 'v = t : s', 'v = s − t'],
    derive: 's = v·t ⟹ v = s : t',
  },
};

const nz = (m) => (m % 10 === 0 ? m + 1 : m);
/* Bỏ số 0 thừa ở cuối phần thập phân: 25,0 → 25. */
function trim(m, k) {
  while (k > 0 && m % 10 === 0) { m /= 10; k--; }
  return { m, k };
}
const show = ({ m, k }) => fmtScaled(m, k);
const valueOf = (x) => Number(show(x).replace(',', '.'));

function answerOf(p) {
  let m = CTX[p.ctx].factor * p.given.m, k = p.given.k - p.small.k;
  if (k < 0) { m *= 10 ** -k; k = 0; }
  return trim(m, k);
}

export default {
  id: 'ch3.formula-tenths',
  chapter: 3,
  topic: '3.1',
  title: 'Biến đổi công thức, tính với 0,1 và 0,01',
  shortTitle: 'Biến đổi công thức',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    const ctx = rng.pick(Object.keys(CTX));
    let given, small;
    if (ctx === 'move') {
      given = { m: nz(rng.int(12, 60)), k: 1 };
      small = { m: 1, k: 1 };
    } else {
      const k = rng.int(1, 2);
      given = { m: nz(k === 1 ? rng.int(11, 199) : rng.int(11, 999)), k };
      small = { m: 1, k: rng.int(1, 2) };
    }
    return { ctx, given, small, order: rng.shuffle([0, 1, 2, 3]) };
  },

  render(p, ui) {
    const c = CTX[p.ctx];
    return '<p class="q-prompt">' + c.text(show(p.given), show(p.small)) + '</p>' +
      '<div class="sub"><span class="sub-label">a.</span> Biến đổi công thức để biểu thị ' + c.ask + ':' +
        ui.radios('f', p.order.map((i) => ({ value: String(i), label: c.options[i] }))) + ui.feedback('f', { inline: true }) + '</div>' +
      '<div class="sub"><span class="sub-label">b.</span> Dùng công thức ở câu a, tính ' + c.ask + ': &nbsp;' + c.find + ' = ' +
        ui.blank('v', { width: 100 }) + ' ' + c.unit + ui.feedback('v', { inline: true }) + '</div>';
  },

  grade(p, ans) {
    const c = CTX[p.ctx], r = answerOf(p), okF = ans.f === '0';
    return {
      parts: [
        part('f', okF, 0.5, c.options[0], { marks: { f: okF } }),
        part('v', sameNumber(num(ans.v), valueOf(r)), 0.5, show(r) + ' ' + c.unit),
      ],
    };
  },

  solve(p) {
    return { f: '0', v: show(answerOf(p)) };
  },

  describe(p) {
    const c = CTX[p.ctx];
    return 'Tìm ' + c.find + ' biết ' + c.big + ' = ' + show(p.given) + ' ' + c.bigUnit + ', ' + c.small + ' = ' + show(p.small) + ' ' + c.smallUnit;
  },

  explain(p) {
    const c = CTX[p.ctx], r = answerOf(p), times = 10 ** p.small.k;
    const top = c.factor === 2 ? trim(2 * p.given.m, p.given.k) : p.given;
    const calc = c.find + ' = ' + (c.factor === 2 ? '2·' + show(p.given) + ' : ' + show(p.small) + ' = ' : '') +
      show(top) + ' : ' + show(p.small) + ' = ' + show(top) + ' × ' + times + ' = <b>' + show(r) + '</b> (' + c.unit + ')';
    return [
      '<p><b>a)</b> ' + c.derive + '. Chọn <b>' + c.options[0] + '</b>.</p>',
      '<p><b>b)</b> Thay ' + c.big + ' = ' + show(p.given) + ' và ' + c.small + ' = ' + show(p.small) + ' vào công thức:</p>' +
        '<p>&nbsp;&nbsp;' + calc + '</p>' +
        '<p>&nbsp;&nbsp;Nhớ: chia cho ' + show(p.small) + ' cũng là nhân với ' + times +
          ' (dời dấu phẩy sang phải ' + p.small.k + ' chữ số).</p>',
    ];
  },
};
