/* Nhân, chia, lũy thừa của lũy thừa với cơ số khác nhau mỗi ý (Câu 6 — Kiểm tra 1 tiết). */
import { sup } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const BASES = [2, 3, 4, 5, 6, 7, 10];

function items(p) {
  return [
    { field: 'a', base: p.mul.base, lhs: p.mul.base + sup(p.mul.m) + ' × ' + p.mul.base + sup(p.mul.n), ans: p.mul.m + p.mul.n,
      rule: 'aᵐ × aⁿ = aᵐ⁺ⁿ', work: p.mul.m + ' + ' + p.mul.n },
    { field: 'b', base: p.div.base, lhs: p.div.base + sup(p.div.m) + ' ÷ ' + p.div.base + sup(p.div.n), ans: p.div.m - p.div.n,
      rule: 'aᵐ ÷ aⁿ = aᵐ⁻ⁿ', work: p.div.m + ' − ' + p.div.n },
    { field: 'c', base: p.pow.base, lhs: '(' + p.pow.base + sup(p.pow.m) + ')' + sup(p.pow.n), ans: p.pow.m * p.pow.n,
      rule: '(aᵐ)ⁿ = aᵐˣⁿ', work: p.pow.m + ' × ' + p.pow.n },
  ];
}

export default {
  id: 'ch1.power-rules-mixed',
  chapter: 1,
  topic: '1.4',
  title: 'Quy tắc lũy thừa',
  points: 1.5,
  difficulties: ['medium'],
  practice: false,
  legacy: { labels: [{ chapter: 1, label: '1T-Câu 6' }] },

  generate({ rng }) {
    const m2 = rng.int(5, 12);
    return {
      mul: { base: rng.pick(BASES), m: rng.int(2, 9), n: rng.int(2, 9) },
      div: { base: rng.pick(BASES), m: m2, n: rng.int(2, m2 - 1) },
      pow: { base: rng.pick(BASES), m: rng.int(2, 6), n: rng.int(2, 5) },
    };
  },

  render(p, ui) {
    return '<p class="q-prompt">Viết kết quả các phép tính sau dưới dạng một lũy thừa:</p>' +
      items(p).map((it) =>
        '<div class="sub exponent-line"><span class="sub-label">' + it.field + '.</span> ' + it.lhs +
        ' &nbsp;=&nbsp; <span class="base3">' + it.base + '</span>^' + ui.blank(it.field, { width: 56 }) +
        ui.feedback(it.field, { inline: true }) + '</div>').join('');
  },

  grade(p, ans) {
    return { parts: items(p).map((it) => part(it.field, sameNumber(num(ans[it.field]), it.ans), 0.5, it.base + sup(it.ans))) };
  },

  solve(p) {
    const out = {};
    for (const it of items(p)) out[it.field] = String(it.ans);
    return out;
  },

  explain(p) {
    return '<p><b>Áp dụng các quy tắc lũy thừa:</b></p>' + items(p).map((it) =>
      '<p><b>' + it.field + ')</b> ' + it.lhs + '</p>' +
      '<p>&nbsp;&nbsp;Quy tắc: ' + it.rule + '</p>' +
      '<p>&nbsp;&nbsp;= ' + it.base + '^(' + it.work + ') = <b>' + it.base + sup(it.ans) + '</b></p>').join('');
  },
};
