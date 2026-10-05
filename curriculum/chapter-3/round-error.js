/* Tìm lỗi sai trong một lời giải làm tròn số đến chữ số có nghĩa rồi sửa lại (phiếu học tập 3.2 — Bài 3, vd "0,890 = 0,8 (1 cscn)").
   Số lưu dạng { M, e } = M × 10^e (M nguyên dương), làm tròn bằng roundSig như dạng "Chữ số có nghĩa". */
import { fmtScaled } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';
import { roundSig } from './sig-figs.js';

const LABELS = ['a', 'b'];
const KINDS = ['trunc', 'zeros', 'up', 'place'];
const ERRORS = {
  trunc: 'Chữ số ngay sau ≥ 5 nhưng không làm tròn lên (chỉ cắt bỏ)',
  zeros: 'Đếm cả các chữ số 0 đứng đầu là chữ số có nghĩa',
  up: 'Chữ số ngay sau &lt; 5 nhưng lại làm tròn lên',
  place: 'Bỏ các chữ số phía sau mà không thay bằng chữ số 0 (số bị thay đổi giá trị)',
};

const digit = (rng, lo = 0) => rng.int(lo, 9);
/* Ghép chữ số thành M, chữ số cuối khác 0 (để không có số 0 thừa ở cuối). */
function joinDigits(ds) {
  if (ds[ds.length - 1] === 0) ds[ds.length - 1] = 1;
  return Number(ds.join(''));
}

/* Mỗi kiểu lỗi → { M, e, n, wrong: { q, e2 } }. */
const MAKE = {
  /* 0,8|90 → 0,8: chữ số ngay sau ≥ 5 mà chỉ cắt bỏ. */
  trunc(rng) {
    const n = rng.int(1, 2);
    const ds = [rng.int(1, 8), ...Array.from({ length: n - 1 }, () => digit(rng)), rng.int(5, 9), ...Array.from({ length: rng.int(0, 2) }, () => digit(rng))];
    const M = joinDigits(ds), len = String(M).length;
    const e = rng.int(0, 1) ? -len : -(len - rng.int(1, n)); // 0,xxx hoặc có phần nguyên
    const d = len - n;
    return { M, e, n, wrong: { q: Math.floor(M / 10 ** d), e2: e + d } };
  },
  /* 0,0347 (2 cscn) → 0,03: tính cả số 0 sau dấu phẩy, tức là làm tròn đến n chữ số thập phân. */
  zeros(rng) {
    for (;;) {
      const n = rng.int(2, 3);
      const M = joinDigits([rng.int(1, 8), ...Array.from({ length: n + 1 }, () => digit(rng))]);
      const e = -(String(M).length + 1);
      const right = roundSig(M, e, n), wrong = roundSig(M, e, n - 1);
      if (!sameNumber(valueOf(right), valueOf(wrong))) return { M, e, n, wrong };
    }
  },
  /* 4,3|2 (1 cscn) → 5: chữ số ngay sau < 5 mà vẫn làm tròn lên. */
  up(rng) {
    const n = rng.int(1, 2);
    const ds = [rng.int(1, 8), ...Array.from({ length: n - 1 }, () => digit(rng)), rng.int(1, 4), ...Array.from({ length: rng.int(0, 2) }, () => digit(rng))];
    const M = joinDigits(ds), len = String(M).length;
    const e = rng.int(0, 1) ? -len : -(len - rng.int(1, n));
    const d = len - n;
    return { M, e, n, wrong: { q: Math.floor(M / 10 ** d) + 1, e2: e + d } };
  },
  /* 45 678 (2 cscn) → 46: làm tròn đúng chữ số nhưng quên thay các chữ số sau bằng 0. */
  place(rng) {
    const n = rng.int(1, 2);
    const M = joinDigits([rng.int(1, 8), ...Array.from({ length: rng.int(3, 5) }, () => digit(rng))]);
    return { M, e: 0, n, wrong: { q: roundSig(M, 0, n).q, e2: 0 } };
  },
};

function valueOf({ q, e2 }) {
  return Number(fmtScaled(q, -e2).replace(',', '.'));
}
/* Kết quả làm tròn: giữ số 0 cuối phần thập phân (0,030 có 2 cscn), tách nghìn với số lớn. */
const showQ = ({ q, e2 }) => fmtScaled(q, -e2, { group: e2 >= 0 && q * 10 ** e2 >= 10000 });
const showM = (M, e) => fmtScaled(M, -e, { group: e >= 0 && M * 10 ** e >= 10000 });

function itemsOf(p) {
  return p.items.map((it) => {
    const right = roundSig(it.M, it.e, it.n);
    return { ...it, text: showM(it.M, it.e), wrongText: showQ(it.wrong), right, rightText: showQ(right) };
  });
}

export default {
  id: 'ch3.round-error',
  chapter: 3,
  topic: '3.2',
  title: 'Tìm lỗi sai khi làm tròn số',
  shortTitle: 'Tìm lỗi sai khi làm tròn',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    return { items: rng.shuffle(KINDS).slice(0, 2).map((kind) => ({ kind, ...MAKE[kind](rng) })) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Mỗi lời giải sau đều <b>sai</b>. Hãy chỉ ra lỗi sai và sửa lại cho đúng:</p>' +
      itemsOf(p).map((it, i) =>
        '<div class="sub"><span class="sub-label">' + LABELS[i] + '.</span> Làm tròn ' + it.text + ' đến ' + it.n + ' chữ số có nghĩa: &nbsp;' +
          '<b>' + it.text + ' ≈ ' + it.wrongText + '</b>' +
          '<div class="factor-row">Lỗi sai là:</div>' + ui.radios('k' + i, KINDS.map((k) => ({ value: k, label: ERRORS[k] }))) + ui.feedback('k' + i, { inline: true }) +
          '<div class="factor-row">Sửa lại: ' + it.text + ' ≈ ' + ui.blank('c' + i, { width: 120 }) + ui.feedback('c' + i, { inline: true }) + '</div></div>').join('');
  },

  grade(p, ans) {
    return {
      parts: itemsOf(p).flatMap((it, i) => {
        const ok = ans['k' + i] === it.kind;
        return [
          part('k' + i, ok, 0.25, ERRORS[it.kind], { marks: { ['k' + i]: ok } }),
          part('c' + i, sameNumber(num(ans['c' + i]), valueOf(it.right)), 0.25, it.rightText),
        ];
      }),
    };
  },

  solve(p) {
    const out = {};
    itemsOf(p).forEach((it, i) => { out['k' + i] = it.kind; out['c' + i] = it.rightText; });
    return out;
  },

  describe(p) {
    return itemsOf(p).map((it) => it.text + ' ≈ ' + it.wrongText + ' (' + it.n + ' cscn)').join(' ; ');
  },

  explain(p) {
    return itemsOf(p).map((it, i) => {
      const digits = String(it.M), kept = digits.slice(0, it.n), next = Number(digits[it.n]);
      const why = {
        trunc: 'Chữ số ngay sau là ' + next + ' ≥ 5 nên phải cộng thêm 1 vào chữ số giữ lại cuối cùng, không được chỉ cắt bỏ.',
        zeros: 'Các chữ số 0 đứng đầu (0,0…) <i>không</i> phải chữ số có nghĩa; phải đếm từ chữ số khác 0 đầu tiên là ' + digits[0] + '.',
        up: 'Chữ số ngay sau là ' + next + ' &lt; 5 nên giữ nguyên chữ số giữ lại, không làm tròn lên.',
        place: 'Các chữ số bỏ đi ở phần nguyên phải được thay bằng chữ số 0, nếu không giá trị của số bị thay đổi (' +
          it.wrongText + ' nhỏ hơn ' + it.text + ' rất nhiều).',
      }[it.kind];
      return '<p><b>' + LABELS[i] + ')</b> ' + it.text + ' ≈ ' + it.wrongText + ' — lỗi: <b>' + ERRORS[it.kind] + '</b></p>' +
        '<p>&nbsp;&nbsp;• ' + why + '</p>' +
        '<p>&nbsp;&nbsp;• Giữ ' + it.n + ' chữ số có nghĩa: <b>' + kept.split('').join(' ') + '</b>; chữ số ngay sau là <b>' + next + '</b> ' +
          (next >= 5 ? '≥ 5 → làm tròn lên' : '&lt; 5 → giữ nguyên') + '</p>' +
        '<p>&nbsp;&nbsp;⟹ Sửa lại: ' + it.text + ' ≈ <b>' + it.rightText + '</b></p>';
    });
  },
};
