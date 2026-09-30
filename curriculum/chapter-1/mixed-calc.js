/* Tính giá trị biểu thức có lũy thừa, căn bậc hai, căn bậc ba (Đề cương giữa kỳ I — Câu 5).
   Mỗi mẫu trả { prompt, result, work }; work = các bước biến đổi [việc làm, biểu thức sau bước đó]
   (test tính lại từng biểu thức để chắc mọi bước đều bằng kết quả). */
import { sup, minus, signStr } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const PATTERNS = {
  /* 6 × 2³ − 18 + √36 */
  A(rng) {
    const a = rng.int(2, 9), b = rng.int(2, 3), c = rng.int(5, 30), s = rng.int(2, 12);
    const p = b ** 3, result = a * p - c + s;
    return { prompt: a + ' × ' + b + '³ − ' + c + ' + √' + s * s, result,
      work: [['lũy thừa và căn: ' + b + '³ = ' + p + ' ; √' + s * s + ' = ' + s, a + ' × ' + p + ' − ' + c + ' + ' + s],
        ['nhân: ' + a + ' × ' + p + ' = ' + a * p, a * p + ' − ' + c + ' + ' + s],
        ['cộng, trừ từ trái sang phải', minus(result)]] };
  },
  /* [∛(−125) + (−11)] : (−2)² − 1 */
  B(rng) {
    const d = rng.int(2, 3), m = rng.int(2, 6), dd = d * d;
    let k = rng.int(1, 3) * dd - m;
    while (k < 1) k += dd;
    const q = (m + k) / dd, result = -q - 1;
    return { prompt: '[∛(−' + m ** 3 + ') + (−' + k + ')] : (−' + d + ')² − 1', result,
      work: [['căn bậc ba: ∛(−' + m ** 3 + ') = −' + m + ' ; lũy thừa: (−' + d + ')² = ' + dd, '[(−' + m + ') + (−' + k + ')] : ' + dd + ' − 1'],
        ['tính trong ngoặc: (−' + m + ') + (−' + k + ') = −' + (m + k), '(−' + (m + k) + ') : ' + dd + ' − 1'],
        ['chia: (−' + (m + k) + ') : ' + dd + ' = −' + q, '−' + q + ' − 1'],
        ['trừ', minus(result)]] };
  },
  /* 14 − 190 ÷ 5 − 23 × √9 */
  C(rng) {
    const P = rng.int(10, 40), R = rng.int(2, 9), q = rng.int(5, 30), S = rng.int(2, 25), t = rng.int(2, 5);
    const result = P - q - S * t;
    return { prompt: P + ' − ' + R * q + ' ÷ ' + R + ' − ' + S + ' × √' + t * t, result,
      work: [['căn: √' + t * t + ' = ' + t, P + ' − ' + R * q + ' ÷ ' + R + ' − ' + S + ' × ' + t],
        ['nhân, chia trước: ' + R * q + ' ÷ ' + R + ' = ' + q + ' ; ' + S + ' × ' + t + ' = ' + S * t, P + ' − ' + q + ' − ' + S * t],
        ['trừ từ trái sang phải', minus(result)]] };
  },
  /* 2 × (∛27 − √64) + √100 × 5⁰ */
  D(rng) {
    const k = rng.int(2, 5), a = rng.int(2, 5), b = rng.int(2, 9), c = rng.int(2, 12), n = rng.int(2, 9);
    const result = k * (a - b) + c + 0;
    return { prompt: k + ' × (∛' + a ** 3 + ' − √' + b * b + ') + √' + c * c + ' × ' + n + '⁰', result,
      work: [['căn và lũy thừa: ∛' + a ** 3 + ' = ' + a + ' ; √' + b * b + ' = ' + b + ' ; √' + c * c + ' = ' + c + ' ; ' + n + '⁰ = 1',
        k + ' × (' + a + ' − ' + b + ') + ' + c + ' × 1'],
        ['tính trong ngoặc: ' + a + ' − ' + b + ' = ' + minus(a - b), k + ' × ' + signStr(a - b) + ' + ' + c + ' × 1'],
        ['nhân', minus(k * (a - b) + 0) + ' + ' + c],
        ['cộng', minus(result)]] };
  },
  /* −108 : (−9) + 4³ − 4 × √81 */
  E(rng) {
    const D = rng.int(2, 9), q = rng.int(2, 15), b = rng.int(2, 4), k = rng.int(2, 6), s = rng.int(2, 10);
    const p = b ** 3, result = q + p - k * s;
    return { prompt: '−' + D * q + ' : (−' + D + ') + ' + b + '³ − ' + k + ' × √' + s * s, result,
      work: [['lũy thừa và căn: ' + b + '³ = ' + p + ' ; √' + s * s + ' = ' + s, '−' + D * q + ' : (−' + D + ') + ' + p + ' − ' + k + ' × ' + s],
        ['nhân, chia trước: (−' + D * q + ') : (−' + D + ') = ' + q + ' ; ' + k + ' × ' + s + ' = ' + k * s, q + ' + ' + p + ' − ' + k * s],
        ['cộng, trừ từ trái sang phải', minus(result)]] };
  },
  /* √121 × 2² + 11 × 2³ − 11 × √144 — nhận ra thừa số chung */
  F(rng) {
    const s = rng.int(3, 12), n = rng.int(2, 3), m = rng.int(2, 4), t = rng.int(2, 15);
    const pn = 2 ** n, pm = 2 ** m, inner = pn + pm - t, result = s * inner + 0;
    return { prompt: '√' + s * s + ' × 2' + sup(n) + ' + ' + s + ' × 2' + sup(m) + ' − ' + s + ' × √' + t * t, result,
      work: [['căn và lũy thừa: √' + s * s + ' = ' + s + ' ; 2' + sup(n) + ' = ' + pn + ' ; 2' + sup(m) + ' = ' + pm + ' ; √' + t * t + ' = ' + t,
        s + ' × ' + pn + ' + ' + s + ' × ' + pm + ' − ' + s + ' × ' + t],
        ['đặt ' + s + ' làm thừa số chung', s + ' × (' + pn + ' + ' + pm + ' − ' + t + ')'],
        ['tính trong ngoặc', s + ' × ' + signStr(inner)],
        ['nhân', minus(result)]] };
  },
};
const LABELS = ['a', 'b', 'c'];

export default {
  id: 'ch1.mixed-calc',
  chapter: 1,
  topic: '1.3',
  title: 'Tính giá trị biểu thức có lũy thừa và căn',
  shortTitle: 'Biểu thức có lũy thừa, căn',
  points: 1.5,
  difficulties: ['medium'],

  generate({ rng }) {
    return { items: rng.shuffle(Object.keys(PATTERNS)).slice(0, 3).map((k) => PATTERNS[k](rng)) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Tính:</p>' + p.items.map((it, i) =>
      '<div class="sub"><span class="sub-label">' + LABELS[i] + '.</span> ' + it.prompt + ' = ' +
        ui.blank('i' + i, { width: 90 }) + ui.feedback('i' + i) + '</div>').join('');
  },

  grade(p, ans) {
    return { parts: p.items.map((it, i) => part('i' + i, sameNumber(num(ans['i' + i]), it.result), 0.5, minus(it.result))) };
  },

  solve(p) {
    const out = {};
    p.items.forEach((it, i) => { out['i' + i] = String(it.result); });
    return out;
  },

  describe(p) {
    return p.items.map((it) => it.prompt).join(' ; ');
  },

  explain(p) {
    const steps = p.items.map((it, i) =>
      '<p><b>' + LABELS[i] + ')</b> ' + it.prompt + '</p>' +
      it.work.map(([what, expr], k) =>
        '<p>&nbsp;&nbsp;= ' + (k === it.work.length - 1 ? '<b>' + expr + '</b>' : expr) + ' &nbsp;<i>(' + what + ')</i></p>').join(''));
    steps[0] = '<p><b>Thứ tự thực hiện:</b> Ngoặc → Lũy thừa, căn → Nhân, chia (trái sang phải) → Cộng, trừ (trái sang phải). ' +
      'Nhớ: căn bậc ba của số âm là số âm (∛(−8) = −2); (−a)² là số dương; mọi số khác 0 mũ 0 đều bằng 1.</p>' + steps[0];
    return steps;
  },
};
