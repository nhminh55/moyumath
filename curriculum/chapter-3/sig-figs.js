/* Làm tròn đến một số chữ số có nghĩa cho trước (Đề cương giữa kỳ I — Câu 18, 19, 20).
   Số lưu dạng { M, e } = M × 10^e (M nguyên dương) để làm tròn chính xác bằng số nguyên. */
import { fmtScaled } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const LABELS = ['a', 'b', 'c', 'd'];

/* Các kiểu số: rất nhỏ (0,000…), nhỏ hơn 1, có phần nguyên và phần thập phân, số nguyên lớn. */
const TYPES = {
  tiny(rng) { const M = rng.int(10000, 999999); return { M, e: -(String(M).length + rng.int(2, 3)), maxN: 3 }; },
  small(rng) { const M = rng.int(1000, 99999); return { M, e: -String(M).length, maxN: 3 }; },
  mixed(rng) { const M = rng.int(10000, 9999999); return { M, e: -(String(M).length - rng.int(1, 3)), maxN: 4 }; },
  big(rng) { const M = rng.int(100000, 99999999); return { M, e: 0, maxN: 3 }; },
};

const show = (M, e) => fmtScaled(M, -e, { group: e >= 0 });

/* Làm tròn M × 10^e đến n chữ số có nghĩa (làm tròn "nửa lên"). → { q, e2 } với kết quả = q × 10^e2 */
export function roundSig(M, e, n) {
  const d = String(M).length - n;
  if (d <= 0) return { q: M, e2: e };
  const p = 10 ** d, rem = M % p;
  return { q: Math.floor(M / p) + (rem * 2 >= p ? 1 : 0), e2: e + d };
}

function itemsOf(p) {
  return p.items.map((it) => {
    const { q, e2 } = roundSig(it.M, it.e, it.n);
    return { ...it, q, e2, text: show(it.M, it.e), answer: fmtScaled(q, -e2, { group: e2 >= 0 && q * 10 ** e2 >= 10000 }) };
  });
}

export default {
  id: 'ch3.sig-figs',
  chapter: 3,
  topic: '3.2',
  title: 'Làm tròn đến chữ số có nghĩa',
  shortTitle: 'Chữ số có nghĩa',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    return {
      items: rng.shuffle(Object.keys(TYPES)).map((t) => {
        const { M, e, maxN } = TYPES[t](rng);
        const m = M % 10 === 0 ? M + 1 : M;
        return { M: m, e, n: rng.int(1, Math.min(maxN, String(m).length - 1)) };
      }),
    };
  },

  render(p, ui) {
    return '<p class="q-prompt">Làm tròn mỗi số sau đến số chữ số có nghĩa (cscn) cho trong ngoặc:</p>' +
      itemsOf(p).map((it, i) =>
        '<div class="sub"><span class="sub-label">' + LABELS[i] + '.</span> ' + it.text + ' &nbsp;(' + it.n + ' cscn) ≈ ' +
          ui.blank('i' + i, { width: 120 }) + ui.feedback('i' + i, { inline: true }) + '</div>').join('');
  },

  grade(p, ans) {
    return {
      parts: itemsOf(p).map((it, i) =>
        part('i' + i, sameNumber(num(ans['i' + i]), Number(fmtScaled(it.q, -it.e2).replace(',', '.'))), 0.25, it.answer)),
    };
  },

  solve(p) {
    const out = {};
    itemsOf(p).forEach((it, i) => { out['i' + i] = it.answer; });
    return out;
  },

  describe(p) {
    return itemsOf(p).map((it) => it.text + ' (' + it.n + ' cscn)').join(' ; ');
  },

  explain(p) {
    const steps = itemsOf(p).map((it, i) => {
      const digits = String(it.M), kept = digits.slice(0, it.n), next = Number(digits[it.n]);
      const up = next >= 5;
      const tail = it.e2 >= 0 ? 'các chữ số phía sau (trước dấu phẩy) thay bằng 0' : 'bỏ các chữ số phía sau';
      return '<p><b>' + LABELS[i] + ')</b> ' + it.text + ' — làm tròn đến ' + it.n + ' chữ số có nghĩa</p>' +
        '<p>&nbsp;&nbsp;• Chữ số có nghĩa đầu tiên (chữ số khác 0 đầu tiên từ trái sang) là <b>' + digits[0] + '</b>; ' +
          'giữ ' + it.n + ' chữ số: <b>' + kept.split('').join(' ') + '</b></p>' +
        '<p>&nbsp;&nbsp;• Chữ số ngay sau là <b>' + next + '</b> ' + (up ? '≥ 5 → cộng thêm 1 vào chữ số giữ lại cuối cùng' : '&lt; 5 → giữ nguyên') +
          '; ' + tail + '</p>' +
        '<p>&nbsp;&nbsp;⟹ ' + it.text + ' ≈ <b>' + it.answer + '</b></p>';
    });
    steps[0] = '<p><b>Nhớ:</b> các số 0 đứng đầu (như 0,00…) <i>không</i> phải chữ số có nghĩa; ' +
      'đếm từ chữ số khác 0 đầu tiên. Số 0 ở cuối phần thập phân sau khi làm tròn vẫn phải giữ (vd 32,0 có 3 cscn).</p>' + steps[0];
    return steps;
  },
};
