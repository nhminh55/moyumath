/* Thứ tự thực hiện phép tính với số nguyên (Câu 4 — Kiểm tra 1 tiết). */
import { sup, minus } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

/* Mỗi mẫu trả { prompt, result }; prompt dùng ký hiệu hiển thị (−, ×, ÷, √, ²). */
const PATTERNS = {
  A(rng) {
    const A = rng.int(2, 6), B = rng.int(3, 9), C = rng.int(2, 8);
    return { prompt: A + ' × [(−' + B + ') − ' + C + ']', result: A * -(B + C) };
  },
  B(rng) {
    const B = rng.int(2, 6), C = rng.int(2, 6), k = rng.int(2, 8), sign = rng.pick([1, -1]);
    const result = sign * k;
    return { prompt: minus(-result * (B + C)) + ' ÷ [(−' + B + ') + (−' + C + ')]', result };
  },
  C(rng) {
    const A = rng.int(2, 15), B = rng.int(2, 20), C = rng.int(2, 9);
    /* "+ 0" để A = B cho 0 chứ không phải -0 (JSON không giữ được -0). */
    return { prompt: '[(−' + A + ') + ' + B + '] × (−' + C + ')', result: (B - A) * -C + 0 };
  },
  D(rng) {
    const s = rng.pick([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]), B = rng.int(2, 9), C = rng.int(1, 30);
    return { prompt: '√' + s * s + ' × (−' + B + ') + ' + C, result: s * -B + C };
  },
  E(rng) {
    const A = rng.int(2, 6), B = rng.int(2, 6), D = rng.int(2, 9), q = rng.int(1, 9);
    return { prompt: A + sup(2) + ' × ' + B + ' + (−' + D * q + ') ÷ (−' + D + ')', result: A * A * B + q };
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
    return '<p><b>Quy tắc thứ tự thực hiện phép tính:</b> Ngoặc → Lũy thừa/Căn → Nhân/Chia → Cộng/Trừ.</p>' +
      p.items.map((it, i) =>
        '<p><b>' + LABELS[i] + ')</b> ' + it.prompt + '</p>' +
        '<p>&nbsp;&nbsp;Thực hiện theo thứ tự: ngoặc → lũy thừa/căn → nhân chia → cộng trừ.</p>' +
        '<p>&nbsp;&nbsp;= <b>' + minus(it.result) + '</b></p>').join('');
  },
};
