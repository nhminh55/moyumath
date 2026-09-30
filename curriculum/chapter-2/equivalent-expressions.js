/* Phân loại các biểu thức vào nhóm biểu thức tương đương (Đề cương giữa kỳ I — Câu 25).
   Mỗi biểu thức có `ascii` để test kiểm tra nó thật sự tương đương với biểu thức đại diện của nhóm. */
import { gcd } from '../../js/core/mathfmt.js';
import { partial } from '../../js/core/grading.js';

const frac = (num, den) => '<span class="frac"><span>' + num + '</span><span>' + den + '</span></span>';
const LETTERS = 'ABCDEFGH';

/* Nhóm: biểu thức đại diện (hiện ở chú thích) + các cách viết khác của cùng biểu thức. */
const GROUPS = {
  P: {
    head: (a, b) => frac(a + 'x', b), ascii: (a, b) => a + 'x/' + b,
    forms: [
      { html: (a, b) => frac(a + ' × x', b), ascii: (a, b) => '(' + a + '*x)/' + b, why: 'tử là ' + '{a} × x = {a}x' },
      { html: (a, b) => frac('x', b) + ' × ' + a, ascii: (a, b) => 'x/' + b + '*' + a, why: 'nhân phân số với {a}: nhân {a} vào tử' },
      { html: (a, b) => frac(a, b) + ' × x', ascii: (a, b) => a + '/' + b + '*x', why: 'nhân phân số với x: nhân x vào tử' },
      { html: (a, b) => frac(a, b) + 'x', ascii: (a, b) => '(' + a + '/' + b + ')x', why: 'viết liền nghĩa là nhân: giống {a}/{b} × x' },
      { html: (a, b) => a + ' × ' + frac('x', b), ascii: (a, b) => a + '*(x/' + b + ')', why: 'nhân {a} vào tử' },
    ],
  },
  Q: {
    head: (a, b) => frac('x + ' + a, b), ascii: (a, b) => '(x+' + a + ')/' + b,
    forms: [
      { html: (a, b) => frac(a + ' + x', b), ascii: (a, b) => '(' + a + '+x)/' + b, why: 'đổi chỗ hai số hạng ở tử' },
      { html: (a, b) => frac('x', b) + ' + ' + frac(a, b), ascii: (a, b) => 'x/' + b + '+' + a + '/' + b, why: 'hai phân số cùng mẫu {b}: cộng các tử' },
    ],
  },
  R: {
    head: (a, b) => 'x + ' + frac(a, b), ascii: (a, b) => 'x+' + a + '/' + b,
    forms: [
      { html: (a, b) => frac(a, b) + ' + x', ascii: (a, b) => a + '/' + b + '+x', why: 'đổi chỗ hai số hạng' },
      { html: (a, b) => frac(a + ' + ' + b + 'x', b), ascii: (a, b) => '(' + a + '+' + b + 'x)/' + b,
        why: 'tách thành {a}/{b} + {b}x/{b} = {a}/{b} + x' },
    ],
  },
  S: {
    head: (a, b) => frac('x − ' + a, b), ascii: (a, b) => '(x-' + a + ')/' + b,
    forms: [
      { html: (a, b) => frac('x', b) + ' − ' + frac(a, b), ascii: (a, b) => 'x/' + b + '-' + a + '/' + b, why: 'hai phân số cùng mẫu {b}: trừ các tử' },
      { html: (a, b) => frac('−' + a + ' + x', b), ascii: (a, b) => '(-' + a + '+x)/' + b, why: 'đổi chỗ hai số hạng ở tử' },
    ],
  },
};
const GROUP_KEYS = Object.keys(GROUPS);
const PICK = { P: 3, Q: 2, R: 2, S: 1 };
const fill = (s, a, b) => s.replace(/\{a\}/g, a).replace(/\{b\}/g, b);

/* Để test kiểm tra tính đúng đắn toán học. */
export const _groups = GROUPS;

export default {
  id: 'ch2.equivalent-expressions',
  chapter: 2,
  topic: '2.1',
  title: 'Biểu thức tương đương',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    /* a, b nguyên tố cùng nhau để a/b là phân số tối giản (tránh 3/6). */
    const b = rng.int(3, 9);
    let a;
    do { a = rng.intExcept(2, 9, [b]); } while (gcd(a, b) !== 1);
    const items = GROUP_KEYS.flatMap((g) =>
      rng.shuffle(GROUPS[g].forms.map((f, i) => i)).slice(0, PICK[g]).map((f) => ({ g, f })));
    return { a, b, items: rng.shuffle(items) };
  },

  render(p, ui) {
    const { a, b } = p;
    const legend = GROUP_KEYS.map((g, i) => '<span style="margin-right:18px;"><b>Nhóm ' + (i + 1) + ':</b> ' + GROUPS[g].head(a, b) + '</span>').join('');
    const options = GROUP_KEYS.map((g, i) => ({ value: g, label: 'Nhóm ' + (i + 1) }));
    return '<p class="q-prompt">Xếp mỗi biểu thức vào nhóm có biểu thức <b>tương đương</b> (bằng nhau với mọi giá trị của x):</p>' +
      '<div class="sub">' + legend + '</div>' +
      '<div class="sub">' + p.items.map((it, i) =>
        /* Gói biểu thức trong một <span>: .venn-row là flex, để rời thì từng phân số thành một cột. */
        '<div class="venn-row" style="padding:4px 0;"><span style="font-family:Lora, serif;font-size:16px;"><b>' + LETTERS[i] + '.</b>&nbsp; ' +
          GROUPS[it.g].forms[it.f].html(a, b) + '</span>' + ui.select('e' + i, options) + '</div>').join('') + ui.feedback('g') + '</div>';
  },

  grade(p, ans) {
    const marks = {};
    let hit = 0;
    p.items.forEach((it, i) => {
      marks['e' + i] = ans['e' + i] === it.g;
      if (marks['e' + i]) hit++;
    });
    const expected = GROUP_KEYS.map((g, k) => 'Nhóm ' + (k + 1) + ': ' +
      p.items.map((it, i) => (it.g === g ? LETTERS[i] : '')).filter(Boolean).join(', ')).join(' · ');
    const r = partial('g', hit / p.items.length, 1, expected, { marks });
    r.note = 'Đúng ' + hit + '/' + p.items.length;
    return { parts: [r] };
  },

  solve(p) {
    const out = {};
    p.items.forEach((it, i) => { out['e' + i] = it.g; });
    return out;
  },

  describe(p) {
    return 'Biểu thức tương đương với a = ' + p.a + ', mẫu ' + p.b;
  },

  explain(p) {
    const { a, b } = p;
    return [
      '<p><b>Bước 1 — Hai quy tắc cần nhớ:</b></p>' +
        '<p>&nbsp;&nbsp;• Nhân một số với phân số: nhân số đó vào <i>tử</i>: ' + a + ' × ' + frac('x', b) + ' = ' + frac(a + 'x', b) + ' = ' + frac(a, b) + ' × x</p>' +
        '<p>&nbsp;&nbsp;• Cộng/trừ hai phân số cùng mẫu: cộng/trừ các <i>tử</i>, giữ mẫu: ' + frac('x', b) + ' + ' + frac(a, b) + ' = ' + frac('x + ' + a, b) + '</p>' +
        '<p>&nbsp;&nbsp;Chú ý: ' + frac('x + ' + a, b) + ' <b>khác</b> x + ' + frac(a, b) + ' (ở biểu thức sau chỉ có ' + a + ' được chia cho ' + b + ').</p>',
      '<p><b>Bước 2 — Biến đổi từng biểu thức về dạng đại diện:</b></p>' +
        p.items.map((it, i) => '<p>&nbsp;&nbsp;<b>' + LETTERS[i] + '.</b> ' + GROUPS[it.g].forms[it.f].html(a, b) + ' — ' +
          fill(GROUPS[it.g].forms[it.f].why, a, b) + ' → ' + GROUPS[it.g].head(a, b) + ' (Nhóm ' + (GROUP_KEYS.indexOf(it.g) + 1) + ')</p>').join(''),
      '<p><b>Bước 3 — Kết quả:</b></p>' + GROUP_KEYS.map((g, k) => '<p>&nbsp;&nbsp;Nhóm ' + (k + 1) + ' (' + GROUPS[g].head(a, b) + '): <b>' +
        p.items.map((it, i) => (it.g === g ? LETTERS[i] : '')).filter(Boolean).join(', ') + '</b></p>').join(''),
    ];
  },
};
