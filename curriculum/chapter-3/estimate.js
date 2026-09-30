/* Làm tròn các số đến 1 chữ số có nghĩa để ước lượng kết quả phép tính (Đề cương giữa kỳ I — Câu 23).
   Số lưu theo phần mười (t = số × 10) để hiển thị chính xác; phép chia được sinh sao cho hai số đã làm tròn chia hết. */
import { fmtDec } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part, partial } from '../../js/core/grading.js';

/* Phép chia: số chia d·10^k và thương q sao cho số bị chia d·q·10^k cũng chỉ có 1 chữ số có nghĩa. */
const DIV_PAIRS = [[2, 2], [2, 3], [2, 4], [3, 2], [3, 3], [4, 2], [4, 5], [5, 4], [5, 6], [5, 8], [6, 5], [8, 5]];

const show = (t) => fmtDec(t / 10);
const paren = (t) => (t < 0 ? '(' + show(t) + ')' : show(t));
/* Số "thật" gần giá trị tròn R (R = chữ số · 10^k): lệch tối đa 0,3 · 10^k, khác R. */
function near(rng, R, place, sign) {
  const span = 3 * place; // theo phần mười: 0,3 · 10^k · 10
  const step = place >= 10 && rng.int(0, 1) ? 10 : 1; // đôi khi là số nguyên
  let d;
  do { d = rng.int(-span / step, span / step) * step; } while (d === 0);
  return sign * (R * 10 + d);
}

function makeMul(rng) {
  const k1 = rng.int(0, 2), k2 = rng.int(0, 1);
  const A = rng.int(2, 9) * 10 ** k1, B = rng.int(2, 9) * 10 ** k2;
  const sa = rng.pick([1, -1]), sb = rng.pick([1, -1]);
  return { op: '×', a: near(rng, A, 10 ** k1, sa), b: near(rng, B, 10 ** k2, sb), ra: sa * A, rb: sb * B };
}

function makeDiv(rng) {
  const [d, q] = rng.pick(DIV_PAIRS), k = rng.int(0, 1);
  const B = d * 10 ** k, A = d * q * 10 ** k;
  const placeA = 10 ** (String(A).length - 1);
  const sa = rng.pick([1, -1]), sb = rng.pick([1, -1]);
  return { op: ':', a: near(rng, A, placeA, sa), b: near(rng, B, 10 ** k, sb), ra: sa * A, rb: sb * B };
}

const estimateOf = (it) => (it.op === '×' ? it.ra * it.rb : it.ra / it.rb);
const exactOf = (it) => (it.op === '×' ? (it.a / 10) * (it.b / 10) : it.a / it.b);

export default {
  id: 'ch3.estimate',
  chapter: 3,
  topic: '3.2',
  title: 'Làm tròn để ước lượng',
  shortTitle: 'Ước lượng',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    return { items: rng.shuffle([makeMul(rng), makeDiv(rng)]) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Làm tròn mỗi số đến <b>1 chữ số có nghĩa</b>, rồi ước lượng kết quả phép tính:</p>' +
      p.items.map((it, i) =>
        '<div class="sub"><span class="sub-label">' + 'ab'[i] + '.</span> ' + paren(it.a) + ' ' + it.op + ' ' + paren(it.b) +
          '<div class="factor-row">' + show(it.a) + ' ≈ ' + ui.blank('r' + i + 'a', { width: 70 }) +
            ' &nbsp; ' + show(it.b) + ' ≈ ' + ui.blank('r' + i + 'b', { width: 70 }) + ui.feedback('r' + i, { inline: true }) + '</div>' +
          '<div class="factor-row">Ước lượng: ' + paren(it.a) + ' ' + it.op + ' ' + paren(it.b) + ' ≈ ' +
            ui.blank('e' + i, { width: 90 }) + ui.feedback('e' + i, { inline: true }) + '</div></div>').join('');
  },

  grade(p, ans) {
    return {
      parts: p.items.flatMap((it, i) => {
        const okA = sameNumber(num(ans['r' + i + 'a']), it.ra), okB = sameNumber(num(ans['r' + i + 'b']), it.rb);
        return [
          partial('r' + i, (okA ? 0.125 : 0) + (okB ? 0.125 : 0), 0.25, show(it.ra * 10) + ' và ' + show(it.rb * 10),
            { marks: { ['r' + i + 'a']: okA, ['r' + i + 'b']: okB } }),
          part('e' + i, sameNumber(num(ans['e' + i]), estimateOf(it)), 0.25, fmtDec(estimateOf(it))),
        ];
      }),
    };
  },

  solve(p) {
    const out = {};
    p.items.forEach((it, i) => {
      out['r' + i + 'a'] = String(it.ra);
      out['r' + i + 'b'] = String(it.rb);
      out['e' + i] = String(estimateOf(it));
    });
    return out;
  },

  describe(p) {
    return p.items.map((it) => paren(it.a) + ' ' + it.op + ' ' + paren(it.b)).join(' ; ');
  },

  explain(p) {
    /* t theo phần mười: chữ số có nghĩa đầu tiên và chữ số ngay sau nó, tính bằng số nguyên. */
    const roundLine = (t, r) => {
      const a = Math.abs(t), P = 10 ** (String(a).length - 1);
      const first = Math.floor(a / P), next = Math.floor((a * 10) / P) % 10;
      return '&nbsp;&nbsp;• ' + show(t) + ': chữ số có nghĩa đầu tiên là ' + first + ' (hàng ' + place(first * P / 10) + '), chữ số ngay sau là ' +
        next + (next >= 5 ? ' ≥ 5 → làm tròn lên' : ' &lt; 5 → giữ nguyên') + ' → ' + show(t) + ' ≈ <b>' + fmtDec(r) + '</b>';
    };
    const steps = p.items.map((it, i) =>
      '<p><b>' + 'ab'[i] + ')</b> ' + paren(it.a) + ' ' + it.op + ' ' + paren(it.b) + '</p>' +
      '<p>' + roundLine(it.a, it.ra) + '<br>' + roundLine(it.b, it.rb) + '</p>' +
      '<p>&nbsp;&nbsp;• Ước lượng: ' + (it.ra < 0 ? '(' + fmtDec(it.ra) + ')' : fmtDec(it.ra)) + ' ' + it.op + ' ' +
        (it.rb < 0 ? '(' + fmtDec(it.rb) + ')' : fmtDec(it.rb)) + ' = <b>' + fmtDec(estimateOf(it)) + '</b>' +
        ' (' + (estimateOf(it) < 0 ? 'khác dấu → âm' : 'cùng dấu → dương') + ')</p>' +
      '<p>&nbsp;&nbsp;• Kiểm tra: kết quả đúng là ' + fmtDec(Math.round(exactOf(it) * 100) / 100) + ' — gần với giá trị ước lượng ✓</p>');
    steps[0] = '<p><b>Cách làm:</b> làm tròn mỗi số đến 1 chữ số có nghĩa (giữ dấu của số), rồi tính nhẩm với các số tròn.</p>' + steps[0];
    return steps;
  },
};

function place(r) {
  const n = String(Math.abs(r)).length;
  return ['đơn vị', 'chục', 'trăm', 'nghìn'][n - 1];
}
