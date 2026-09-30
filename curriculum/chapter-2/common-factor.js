/* Phân tích đa thức thành nhân tử bằng cách đặt nhân tử chung (Câu 4 — Kiểm tra 15 phút Chương 2).
   Sửa so với bản cũ: nhân tử chung luôn là ƯCLN của các hệ số (bản cũ có thể sinh 4x + 8 và
   chờ đáp án 2(2x + 4)); chấm theo giá trị + đúng dạng "nhân tử chung × (…)", thứ tự trong ngoặc tuỳ ý. */
import { gcd, gcdAll } from '../../js/core/mathfmt.js';
import { equivalent, isFactoredBy } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

/* Mỗi ý: đề hiển thị, nhân tử chung, đa thức trong ngoặc (ascii). */
function items(p) {
  return [
    { field: 'a', prompt: p.k1 * p.a1 + 'x + ' + p.k1 * p.b1, factor: String(p.k1), inner: p.a1 + 'x + ' + p.b1 },
    { field: 'b', prompt: p.c2 + 'x + ' + p.c2 * p.d2 + 'x²', factor: p.c2 + 'x', inner: '1 + ' + p.d2 + 'x' },
    { field: 'c', prompt: p.k3 * p.e3 + 'x + ' + p.k3 * p.f3 + 'y − ' + p.k3 * p.g3, factor: String(p.k3), inner: p.e3 + 'x + ' + p.f3 + 'y - ' + p.g3 },
  ].map((it) => ({ ...it, full: it.factor + '(' + it.inner + ')', show: it.factor + '(' + it.inner.replace(/ - /g, ' − ') + ')' }));
}

export default {
  id: 'ch2.common-factor',
  chapter: 2,
  topic: '2.5',
  title: 'Đặt nhân tử chung',
  points: 1.5,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 2, label: 'Nhân tử chung' }, { chapter: 2, label: 'Câu 4' }], practiceKey: 'ch2_8' },

  generate({ rng }) {
    let a1, b1, e3, f3, g3;
    do { a1 = rng.int(2, 5); b1 = rng.int(3, 7); } while (gcd(a1, b1) !== 1);
    do { e3 = rng.int(2, 4); f3 = rng.int(2, 4); g3 = rng.int(3, 6); } while (gcdAll(e3, f3, g3) !== 1);
    return { k1: rng.int(2, 6), a1, b1, c2: rng.int(2, 5), d2: rng.int(2, 5), k3: rng.int(2, 5), e3, f3, g3 };
  },

  render(p, ui) {
    return '<p class="q-prompt">Phân tích các biểu thức sau thành nhân tử:</p>' + items(p).map((it) =>
      '<div class="sub"><span class="sub-label">' + it.field + '.</span> ' + it.prompt + ' = ' +
        ui.blank(it.field, { width: 140 }) + ui.feedback(it.field) + '</div>').join('');
  },

  grade(p, ans) {
    return {
      parts: items(p).map((it) =>
        part(it.field, equivalent(ans[it.field], it.full) && isFactoredBy(ans[it.field], it.factor), 0.5, it.show)),
    };
  },

  solve(p) {
    const out = {};
    for (const it of items(p)) out[it.field] = it.full;
    return out;
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return items(p).map((it) => it.prompt).join(' ; ');
  },

  explain(p) {
    const [a, b, c] = items(p);
    return [
      '<p><b>Phân tích thành nhân tử bằng cách đặt nhân tử chung:</b> tìm nhân tử chung, rồi chia từng hạng tử cho nó.</p>' +
        '<p><b>a)</b> ' + a.prompt + '</p>' +
        '<p>&nbsp;&nbsp;Bước 1 — Tìm nhân tử chung: ƯCLN(' + p.k1 * p.a1 + ', ' + p.k1 * p.b1 + ') = ' + p.k1 + '</p>' +
        '<p>&nbsp;&nbsp;Bước 2 — Chia từng hạng tử: ' + p.k1 * p.a1 + 'x : ' + p.k1 + ' = ' + p.a1 + 'x ; ' + p.k1 * p.b1 + ' : ' + p.k1 + ' = ' + p.b1 + '</p>' +
        '<p>&nbsp;&nbsp;⟹ = <b>' + a.show + '</b></p>',
      '<p><b>b)</b> ' + b.prompt + '</p>' +
        '<p>&nbsp;&nbsp;Bước 1 — Hai hạng tử đều chứa ' + p.c2 + ' và x → nhân tử chung: ' + b.factor + '</p>' +
        '<p>&nbsp;&nbsp;Bước 2 — Chia từng hạng tử: ' + p.c2 + 'x : ' + b.factor + ' = 1 ; ' + p.c2 * p.d2 + 'x² : ' + b.factor + ' = ' + p.d2 + 'x</p>' +
        '<p>&nbsp;&nbsp;⟹ = <b>' + b.show + '</b></p>',
      '<p><b>c)</b> ' + c.prompt + '</p>' +
        '<p>&nbsp;&nbsp;Bước 1 — Tìm nhân tử chung: ƯCLN(' + p.k3 * p.e3 + ', ' + p.k3 * p.f3 + ', ' + p.k3 * p.g3 + ') = ' + p.k3 + '</p>' +
        '<p>&nbsp;&nbsp;Bước 2 — Chia từng hạng tử: ' + p.k3 * p.e3 + 'x : ' + p.k3 + ' = ' + p.e3 + 'x ; ' +
          p.k3 * p.f3 + 'y : ' + p.k3 + ' = ' + p.f3 + 'y ; ' + p.k3 * p.g3 + ' : ' + p.k3 + ' = ' + p.g3 + '</p>' +
        '<p>&nbsp;&nbsp;⟹ = <b>' + c.show + '</b></p>',
    ];
  },
};
