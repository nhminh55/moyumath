/* Nhân, chia lũy thừa cùng cơ số, lũy thừa của lũy thừa (Câu 3 — Kiểm tra 15 phút). */
import { sup } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

function answers(p) {
  return { a: p.a1 + p.a2, b: p.b1 - p.b2, c: p.c1 * p.c2, d: p.d1 - 1 };
}

export default {
  id: 'ch1.power-rules',
  chapter: 1,
  topic: '1.4',
  title: 'Nhân, chia, luỹ thừa của luỹ thừa',
  shortTitle: 'Phép toán lũy thừa',
  points: 2,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 1, label: 'Câu 3' }], practiceKey: '3' },

  generate({ rng }) {
    const b1 = rng.int(7, 12);
    return {
      base: rng.pick([2, 3, 5, 7, 10]),
      a1: rng.int(2, 8), a2: rng.int(2, 7),
      b1, b2: rng.int(2, b1 - 2),
      c1: rng.int(2, 5), c2: rng.int(2, 4),
      d1: rng.int(6, 12),
    };
  },

  render(p, ui) {
    const b = p.base;
    const line = (label, lhs, field) =>
      '<div class="sub exponent-line"><span class="sub-label">' + label + '.</span> ' + lhs +
      ' &nbsp;=&nbsp; <span class="base3">' + b + '</span>^' + ui.blank(field, { width: 56 }) +
      ui.feedback(field, { inline: true }) + '</div>';
    return '<p class="q-prompt">Viết kết quả các phép tính sau dưới dạng một lũy thừa:</p>' +
      line('a', b + sup(p.a1) + ' × ' + b + sup(p.a2), 'a') +
      line('b', b + sup(p.b1) + ' ÷ ' + b + sup(p.b2), 'b') +
      line('c', '(' + b + sup(p.c1) + ')' + sup(p.c2), 'c') +
      line('d', b + sup(p.d1) + ' ÷ ' + b + ' × ' + b + sup(0), 'd');
  },

  grade(p, ans) {
    const want = answers(p);
    return {
      parts: ['a', 'b', 'c', 'd'].map((f) =>
        part(f, sameNumber(num(ans[f]), want[f]), 0.5, p.base + sup(want[f]))),
    };
  },

  solve(p) {
    const want = answers(p);
    return { a: String(want.a), b: String(want.b), c: String(want.c), d: String(want.d) };
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return [p.base + sup(p.a1) + ' × ' + p.base + sup(p.a2), p.base + sup(p.b1) + ' ÷ ' + p.base + sup(p.b2), '(' + p.base + sup(p.c1) + ')' + sup(p.c2), p.base + sup(p.d1) + ' ÷ ' + p.base + ' × ' + p.base + '⁰'].join(' ; ');
  },

  explain(p) {
    const b = p.base, w = answers(p);
    return '<p><b>Áp dụng các quy tắc lũy thừa cùng cơ số ' + b + ':</b></p>' +
      '<p><b>a)</b> ' + b + sup(p.a1) + ' × ' + b + sup(p.a2) + '</p>' +
      '<p>&nbsp;&nbsp;Quy tắc: aᵐ × aⁿ = aᵐ⁺ⁿ (nhân → cộng số mũ)</p>' +
      '<p>&nbsp;&nbsp;= ' + b + '^(' + p.a1 + ' + ' + p.a2 + ') = <b>' + b + sup(w.a) + '</b></p>' +
      '<p><b>b)</b> ' + b + sup(p.b1) + ' ÷ ' + b + sup(p.b2) + '</p>' +
      '<p>&nbsp;&nbsp;Quy tắc: aᵐ ÷ aⁿ = aᵐ⁻ⁿ (chia → trừ số mũ)</p>' +
      '<p>&nbsp;&nbsp;= ' + b + '^(' + p.b1 + ' − ' + p.b2 + ') = <b>' + b + sup(w.b) + '</b></p>' +
      '<p><b>c)</b> (' + b + sup(p.c1) + ')' + sup(p.c2) + '</p>' +
      '<p>&nbsp;&nbsp;Quy tắc: (aᵐ)ⁿ = aᵐˣⁿ (lũy thừa của lũy thừa → nhân số mũ)</p>' +
      '<p>&nbsp;&nbsp;= ' + b + '^(' + p.c1 + ' × ' + p.c2 + ') = <b>' + b + sup(w.c) + '</b></p>' +
      '<p><b>d)</b> ' + b + sup(p.d1) + ' ÷ ' + b + ' × ' + b + sup(0) + '</p>' +
      '<p>&nbsp;&nbsp;Nhớ rằng ' + b + ' = ' + b + '¹ và ' + b + '⁰ = 1.</p>' +
      '<p>&nbsp;&nbsp;= ' + b + '^(' + p.d1 + ' − 1) × 1 = <b>' + b + sup(w.d) + '</b></p>';
  },
};
