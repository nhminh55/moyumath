/* Nhân, chia số nguyên (Câu 3 — Kiểm tra 1 tiết). */
import { minus, signStr } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const POOL = [
  { a: -30, op: '÷', b: 5 }, { a: 8, op: '×', b: 18 }, { a: 200, op: '÷', b: -10 },
  { a: -42, op: '÷', b: -3 }, { a: 112, op: '÷', b: -14 }, { a: -66, op: '÷', b: -11 },
  { a: -9, op: '×', b: -6 }, { a: 5, op: '×', b: -14 }, { a: 16, op: '÷', b: -8 },
  { a: -8, op: '×', b: 6 }, { a: -9, op: '×', b: 5 }, { a: -22, op: '÷', b: 11 },
  { a: -20, op: '×', b: 5 }, { a: -1, op: '×', b: -14 }, { a: -200, op: '÷', b: 20 },
];
const LABELS = ['a', 'b', 'c'];

const resultOf = (it) => (it.op === '×' ? it.a * it.b : it.a / it.b);
const show = (it) => minus(it.a) + ' ' + it.op + ' ' + signStr(it.b);

export default {
  id: 'ch1.int-mul-div',
  chapter: 1,
  topic: '1.2',
  title: 'Nhân, chia số nguyên',
  shortTitle: 'Nhân, chia số nguyên',
  points: 1.5,
  difficulties: ['medium'],
  legacy: {
    labels: [{ chapter: 1, label: 'Nhân chia số nguyên' }, { chapter: 1, label: '1T-Câu 3' }],
    practiceKey: '7',
  },

  generate({ rng }) {
    return { items: rng.shuffle(POOL).slice(0, 3) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Tính:</p>' + p.items.map((it, i) =>
      '<div class="sub"><span class="sub-label">' + LABELS[i] + '.</span> ' + show(it) + ' = ' +
        ui.blank('i' + i, { width: 80 }) + ui.feedback('i' + i) + '</div>').join('');
  },

  grade(p, ans) {
    return { parts: p.items.map((it, i) => part('i' + i, sameNumber(num(ans['i' + i]), resultOf(it)), 0.5, minus(resultOf(it)))) };
  },

  solve(p) {
    const out = {};
    p.items.forEach((it, i) => { out['i' + i] = String(resultOf(it)); });
    return out;
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return p.items.map(show).join(' ; ');
  },

  explain(p) {
    const lines = p.items.map((it) => {
      const r = resultOf(it);
      const rule = (it.a < 0) === (it.b < 0) ? 'cùng dấu → kết quả dương' : 'khác dấu → kết quả âm';
      return '<li>' + show(it) + '<br>' +
        '&nbsp;&nbsp;Quy tắc: ' + rule + '<br>' +
        '&nbsp;&nbsp;|' + minus(it.a) + '| ' + it.op + ' |' + minus(it.b) + '| = ' + Math.abs(it.a) + ' ' + it.op + ' ' + Math.abs(it.b) + ' = ' + Math.abs(r) + '<br>' +
        '&nbsp;&nbsp;⟹ Kết quả: <b>' + minus(r) + '</b></li>';
    });
    return '<p><b>Quy tắc nhân/chia số nguyên:</b></p>' +
      '<p>• Cùng dấu → kết quả dương. Khác dấu → kết quả âm.</p>' +
      '<ul>' + lines.join('') + '</ul>';
  },
};
