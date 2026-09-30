/* Thứ tự thực hiện phép tính với số nguyên (Câu 4 — Kiểm tra 1 tiết). */
import { sup, minus, signStr } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

/* Mỗi mẫu trả { prompt, result, work }; prompt dùng ký hiệu hiển thị (−, ×, ÷, √, ²);
   work = các bước biến đổi [việc làm, biểu thức sau bước đó] cho lời giải. */
const PATTERNS = {
  A(rng) {
    const A = rng.int(2, 6), B = rng.int(3, 9), C = rng.int(2, 8);
    const result = A * -(B + C);
    return { prompt: A + ' × [(−' + B + ') − ' + C + ']', result,
      work: [['tính trong ngoặc: (−' + B + ') − ' + C + ' = −' + (B + C), A + ' × (−' + (B + C) + ')'],
        ['nhân hai số khác dấu → kết quả âm', minus(result)]] };
  },
  B(rng) {
    const B = rng.int(2, 6), C = rng.int(2, 6), k = rng.int(2, 8), sign = rng.pick([1, -1]);
    const result = sign * k, n = -result * (B + C);
    return { prompt: minus(n) + ' ÷ [(−' + B + ') + (−' + C + ')]', result,
      work: [['tính trong ngoặc: (−' + B + ') + (−' + C + ') = −' + (B + C), minus(n) + ' ÷ (−' + (B + C) + ')'],
        ['chia: ' + (n < 0 ? 'cùng dấu → kết quả dương' : 'khác dấu → kết quả âm'), minus(result)]] };
  },
  C(rng) {
    const A = rng.int(2, 15), B = rng.int(2, 20), C = rng.int(2, 9);
    /* "+ 0" để A = B cho 0 chứ không phải -0 (JSON không giữ được -0). */
    const inner = B - A, result = inner * -C + 0;
    return { prompt: '[(−' + A + ') + ' + B + '] × (−' + C + ')', result,
      work: [['tính trong ngoặc: (−' + A + ') + ' + B + ' = ' + minus(inner), signStr(inner) + ' × (−' + C + ')'],
        ['nhân', minus(result)]] };
  },
  D(rng) {
    const s = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), B = rng.int(2, 9), C = rng.int(1, 30);
    const result = s * -B + C;
    return { prompt: '√' + s * s + ' × (−' + B + ') + ' + C, result,
      work: [['tính căn: √' + s * s + ' = ' + s, s + ' × (−' + B + ') + ' + C],
        ['nhân trước, cộng sau: ' + s + ' × (−' + B + ') = −' + s * B, '−' + s * B + ' + ' + C],
        ['cộng', minus(result)]] };
  },
  E(rng) {
    const A = rng.int(2, 6), B = rng.int(2, 6), D = rng.int(2, 9), q = rng.int(1, 9);
    const result = A * A * B + q;
    return { prompt: A + sup(2) + ' × ' + B + ' + (−' + D * q + ') ÷ (−' + D + ')', result,
      work: [['tính lũy thừa: ' + A + sup(2) + ' = ' + A * A, A * A + ' × ' + B + ' + (−' + D * q + ') ÷ (−' + D + ')'],
        ['nhân, chia trước: ' + A * A + ' × ' + B + ' = ' + A * A * B + ' ; (−' + D * q + ') ÷ (−' + D + ') = ' + q, A * A * B + ' + ' + q],
        ['cộng', minus(result)]] };
  },
};
const LABELS = ['a', 'b'];

export default {
  id: 'ch1.order-of-ops',
  chapter: 1,
  topic: '1.2',
  title: 'Thứ tự thực hiện phép tính',
  shortTitle: 'Thứ tự thực hiện phép tính',
  points: 2,
  difficulties: ['medium'],
  legacy: {
    labels: [{ chapter: 1, label: 'Thứ tự thực hiện phép tính' }, { chapter: 1, label: '1T-Câu 4' }],
    practiceKey: '8',
  },

  generate({ rng }) {
    const keys = rng.shuffle(Object.keys(PATTERNS)).slice(0, 2);
    return { items: keys.map((k) => PATTERNS[k](rng)) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Thực hiện phép tính:</p>' + p.items.map((it, i) =>
      '<div class="sub"><span class="sub-label">' + LABELS[i] + '.</span> ' + it.prompt + ' = ' +
        ui.blank('i' + i, { width: 90 }) + ui.feedback('i' + i) + '</div>').join('');
  },

  grade(p, ans) {
    return { parts: p.items.map((it, i) => part('i' + i, sameNumber(num(ans['i' + i]), it.result), 1, minus(it.result))) };
  },

  solve(p) {
    const out = {};
    p.items.forEach((it, i) => { out['i' + i] = String(it.result); });
    return out;
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return p.items.map((it) => it.prompt).join(' ; ');
  },

  explain(p) {
    const steps = p.items.map((it, i) =>
      '<p><b>' + LABELS[i] + ')</b> ' + it.prompt + '</p>' +
      it.work.map(([what, expr], k) =>
        '<p>&nbsp;&nbsp;= ' + (k === it.work.length - 1 ? '<b>' + expr + '</b>' : expr) + ' &nbsp;<i>(' + what + ')</i></p>').join(''));
    steps[0] = '<p><b>Quy tắc thứ tự thực hiện phép tính:</b> Ngoặc → Lũy thừa/Căn → Nhân/Chia → Cộng/Trừ.</p>' + steps[0];
    return steps;
  },
};
