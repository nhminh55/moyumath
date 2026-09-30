/* Khai triển và thu gọn (Câu 5 — Kiểm tra 15 phút Chương 2).
   Chấm theo đa thức đã thu gọn: thứ tự hạng tử tuỳ ý, "x" hay "1x" đều được. */
import { formatPoly } from '../../js/core/mathfmt.js';
import { polynomialMatches } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

function items(p) {
  const { a, b, c } = p;
  return [
    { field: 'a', prompt: a.a + '(' + a.b + 'x − ' + a.c + ')', terms: [[a.a * a.b, 1], [-a.a * a.c, 0]] },
    { field: 'b', prompt: b.a + '(' + b.b + 'x + ' + b.c + ') + ' + b.d + '(' + b.e + 'x + ' + b.f + ')',
      terms: [[b.a * b.b + b.d * b.e, 1], [b.a * b.c + b.d * b.f, 0]] },
    { field: 'c', prompt: c.a + '(' + c.b + 'x + ' + c.c + ') − ' + c.d + '(' + c.e + 'x + ' + c.f + ')',
      terms: [[c.a * c.b - c.d * c.e, 1], [c.a * c.c - c.d * c.f, 0]] },
  ];
}

export default {
  id: 'ch2.expand',
  chapter: 2,
  topic: '2.4',
  title: 'Khai triển và thu gọn',
  points: 1.5,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 2, label: 'Khai triển' }, { chapter: 2, label: 'Câu 5' }], practiceKey: 'ch2_6' },

  generate({ rng }) {
    const a = { a: rng.int(2, 5), b: rng.int(2, 5), c: rng.int(2, 7) };
    const b = { a: rng.int(2, 4), b: rng.int(2, 4), c: rng.int(2, 5), d: rng.int(2, 4), e: rng.int(2, 4), f: rng.int(2, 5) };
    let c;
    /* Tránh hệ số của x bằng 0 ở ý c (kết quả chỉ còn hằng số — không còn là bài "thu gọn ax + b"). */
    do {
      c = { a: rng.int(2, 5), b: rng.int(2, 4), c: rng.int(2, 5), d: rng.int(2, 4), e: rng.int(2, 4), f: rng.int(2, 5) };
    } while (c.a * c.b === c.d * c.e);
    return { a, b, c };
  },

  render(p, ui) {
    return '<p class="q-prompt">Khai triển và thu gọn các biểu thức:</p>' + items(p).map((it) =>
      '<div class="sub"><span class="sub-label">' + it.field + '.</span> ' + it.prompt + ' = ' +
        ui.blank(it.field, { width: 140 }) + ui.feedback(it.field) + '</div>').join('');
  },

  grade(p, ans) {
    return { parts: items(p).map((it) => part(it.field, polynomialMatches(ans[it.field], it.terms), 0.5, formatPoly(it.terms))) };
  },

  solve(p) {
    const out = {};
    for (const it of items(p)) out[it.field] = formatPoly(it.terms, { ascii: true });
    return out;
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return items(p).map((it) => it.prompt).join(' ; ');
  },

  explain(p) {
    const { a, b, c } = p;
    const [ia, ib, ic] = items(p);
    return '<p><b>Khai triển bằng quy tắc nhân phân phối a(b + c) = ab + ac:</b></p>' +
      '<p><b>a)</b> ' + ia.prompt + '</p>' +
      '<p>&nbsp;&nbsp;= ' + a.a + '·' + a.b + 'x + ' + a.a + '·(−' + a.c + ')</p>' +
      '<p>&nbsp;&nbsp;= <b>' + formatPoly(ia.terms) + '</b></p>' +
      '<p><b>b)</b> ' + ib.prompt + '</p>' +
      '<p>&nbsp;&nbsp;Khai triển vế 1: ' + formatPoly([[b.a * b.b, 1], [b.a * b.c, 0]]) + '</p>' +
      '<p>&nbsp;&nbsp;Khai triển vế 2: ' + formatPoly([[b.d * b.e, 1], [b.d * b.f, 0]]) + '</p>' +
      '<p>&nbsp;&nbsp;Thu gọn: (' + b.a * b.b + ' + ' + b.d * b.e + ')x + (' + b.a * b.c + ' + ' + b.d * b.f + ')</p>' +
      '<p>&nbsp;&nbsp;= <b>' + formatPoly(ib.terms) + '</b></p>' +
      '<p><b>c)</b> ' + ic.prompt + '</p>' +
      '<p>&nbsp;&nbsp;Khai triển vế 1: ' + formatPoly([[c.a * c.b, 1], [c.a * c.c, 0]]) + '</p>' +
      '<p>&nbsp;&nbsp;Khai triển vế 2: −(' + formatPoly([[c.d * c.e, 1], [c.d * c.f, 0]]) + ') = ' +
        formatPoly([[-c.d * c.e, 1], [-c.d * c.f, 0]]) + '</p>' +
      '<p>&nbsp;&nbsp;Thu gọn: (' + c.a * c.b + ' − ' + c.d * c.e + ')x + (' + c.a * c.c + ' − ' + c.d * c.f + ')</p>' +
      '<p>&nbsp;&nbsp;= <b>' + formatPoly(ic.terms) + '</b></p>';
  },
};
