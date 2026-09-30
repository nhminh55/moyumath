/* Bài toán thực tế dùng ƯCLN: chia đều ba loại đồ vào nhiều phần quà nhất (Đề cương giữa kỳ I — Câu 4). */
import { factorize, gcdAll, formatFactorization } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const CONTEXTS = [
  { who: 'Khối 7 quyên góp được', items: ['hộp bút', 'quyển vở', 'ba lô'], what: 'phần quà' },
  { who: 'Cô giáo có', items: ['cái bánh', 'hộp sữa', 'gói kẹo'], what: 'túi quà' },
  { who: 'Một cửa hàng nhập về', items: ['quả cam', 'quả táo', 'quả lê'], what: 'giỏ trái cây' },
  { who: 'Thư viện nhận được', items: ['truyện tranh', 'sách khoa học', 'từ điển'], what: 'thùng sách' },
];
const GCDS = [6, 8, 10, 12, 15, 18, 20, 24, 30];
const FIELDS = ['a', 'b', 'c'];

const commonFactorization = (maps) => {
  const out = {};
  for (const p of Object.keys(maps[0])) if (maps.every((m) => m[p])) out[p] = Math.min(...maps.map((m) => m[p]));
  return out;
};

export default {
  id: 'ch1.gcd-word',
  chapter: 1,
  topic: '1.1',
  title: 'Bài toán thực tế về ƯCLN',
  shortTitle: 'Bài toán ƯCLN',
  points: 1.5,
  difficulties: ['medium'],

  generate({ rng }) {
    const ctx = rng.int(0, CONTEXTS.length - 1);
    const g = rng.pick(GCDS);
    let m;
    do {
      m = [rng.int(2, 9), rng.int(2, 9), rng.int(2, 9)];
    } while (new Set(m).size < 3 || gcdAll(...m) !== 1);
    m.sort((x, y) => x - y);
    return { ctx, g, n: m.map((k) => k * g) };
  },

  render(p, ui) {
    const c = CONTEXTS[p.ctx];
    const list = c.items.map((it, i) => p.n[i] + ' ' + it).join(', ');
    return '<p class="q-prompt">' + c.who + ' ' + list + '. Có thể chia được <b>nhiều nhất</b> bao nhiêu ' + c.what +
        ' sao cho mỗi loại đều được chia đều vào các ' + c.what + '? Khi đó mỗi ' + c.what + ' có bao nhiêu đồ mỗi loại?</p>' +
      '<div class="sub"><span class="sub-label">a.</span> Số ' + c.what + ' nhiều nhất: ' +
        ui.blank('g', { width: 70 }) + ui.feedback('g') + '</div>' +
      '<div class="sub"><span class="sub-label">b.</span> Mỗi ' + c.what + ' có:' +
        c.items.map((it, i) => '<div class="factor-row">' + ui.blank(FIELDS[i], { width: 60 }) + ' ' + it +
          ui.feedback(FIELDS[i], { inline: true }) + '</div>').join('') + '</div>';
  },

  grade(p, ans) {
    return {
      parts: [
        part('g', sameNumber(num(ans.g), p.g), 0.75, String(p.g)),
        ...FIELDS.map((f, i) => part(f, sameNumber(num(ans[f]), p.n[i] / p.g), 0.25, String(p.n[i] / p.g))),
      ],
    };
  },

  solve(p) {
    const out = { g: String(p.g) };
    FIELDS.forEach((f, i) => { out[f] = String(p.n[i] / p.g); });
    return out;
  },

  describe(p) {
    return 'Chia ' + p.n.join(', ') + ' vào nhiều phần quà nhất';
  },

  explain(p) {
    const c = CONTEXTS[p.ctx];
    const maps = p.n.map(factorize);
    return [
      '<p><b>Bước 1 — Nhận ra dạng bài:</b> số ' + c.what + ' phải chia hết cả ' + p.n.join(', ') +
        ' → là <i>ước chung</i> của ba số. Muốn <i>nhiều nhất</i> → tìm <b>ƯCLN(' + p.n.join(', ') + ')</b>.</p>',
      '<p><b>Bước 2 — Phân tích ra thừa số nguyên tố:</b></p>' +
        p.n.map((n, i) => '<p>&nbsp;&nbsp;' + n + ' = ' + formatFactorization(maps[i]) + '</p>').join(''),
      '<p><b>Bước 3 — Tìm ƯCLN</b> (thừa số chung, số mũ nhỏ nhất):</p>' +
        '<p>&nbsp;&nbsp;ƯCLN(' + p.n.join(', ') + ') = ' + formatFactorization(commonFactorization(maps)) + ' = <b>' + p.g + '</b></p>' +
        '<p>⟹ Chia được nhiều nhất <b>' + p.g + ' ' + c.what + '</b>.</p>',
      '<p><b>Bước 4 — Số đồ mỗi loại trong một ' + c.what + ':</b></p>' +
        c.items.map((it, i) => '<p>&nbsp;&nbsp;' + p.n[i] + ' : ' + p.g + ' = <b>' + p.n[i] / p.g + '</b> ' + it + '</p>').join(''),
    ];
  },
};
