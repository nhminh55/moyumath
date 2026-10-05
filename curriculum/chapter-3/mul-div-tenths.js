/* Nhân, chia một số với 0,1 và 0,01 (Đề cương giữa kỳ I — Câu 17).
   Số được lưu dạng { m, k } = m × 10^(−k) để tính và hiển thị chính xác (không sai số dấu phẩy động). */
import { fmtScaled } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const LABELS = ['a', 'b', 'c', 'd', 'e', 'f'];
/* shift: số chữ số dời dấu phẩy (âm = sang trái). */
const OPS = [
  { op: '× 0,1', shift: -1, same: ': 10', dir: 'sang trái 1 chữ số' },
  { op: '× 0,01', shift: -2, same: ': 100', dir: 'sang trái 2 chữ số' },
  { op: ': 0,1', shift: 1, same: '× 10', dir: 'sang phải 1 chữ số' },
  { op: ': 0,01', shift: 2, same: '× 100', dir: 'sang phải 2 chữ số' },
];

/* kind 3 = số nhỏ hơn 1 (0,5 ; 0,55), như 0,55 : 0,1 và 0,45 : 0,01 trong phiếu học tập 3.1. */
function makeNumber(rng) {
  const kind = rng.int(0, 3);
  if (kind === 3) {
    const k = rng.int(1, 2);
    return { m: k === 1 ? rng.int(2, 9) : rng.intExcept(11, 99, [20, 30, 40, 50, 60, 70, 80, 90]), k };
  }
  const k = kind;
  let m = k === 0 ? rng.int(12, 480) : k === 1 ? rng.int(11, 999) : rng.int(101, 999);
  if (k > 0 && m % 10 === 0) m += 1;
  return { m, k };
}

const show = ({ m, k }) => fmtScaled(m, k);
/* Bỏ số 0 thừa ở cuối phần thập phân: 120 × 0,1 = "12" chứ không phải "12,0". */
function resultOf(it) {
  let m = it.m, k = it.k - OPS[it.op].shift;
  while (k > 0 && m % 10 === 0) { m /= 10; k--; }
  return { m, k };
}
const valueOf = ({ m, k }) => Number(fmtScaled(m, k).replace(',', '.'));

export default {
  id: 'ch3.mul-div-tenths',
  chapter: 3,
  topic: '3.1',
  title: 'Nhân, chia với 0,1 và 0,01',
  shortTitle: 'Nhân, chia với 0,1 và 0,01',
  points: 1.5,
  difficulties: ['medium'],

  generate({ rng }) {
    const ops = rng.shuffle([0, 1, 2, 3, rng.int(0, 3), rng.int(0, 3)]);
    return { items: ops.map((op) => ({ ...makeNumber(rng), op })) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Tính:</p>' + p.items.map((it, i) =>
      '<div class="sub"><span class="sub-label">' + LABELS[i] + '.</span> ' + show(it) + ' ' + OPS[it.op].op + ' = ' +
        ui.blank('i' + i, { width: 90 }) + ui.feedback('i' + i, { inline: true }) + '</div>').join('');
  },

  grade(p, ans) {
    return {
      parts: p.items.map((it, i) => {
        const r = resultOf(it);
        return part('i' + i, sameNumber(num(ans['i' + i]), valueOf(r)), 0.25, show(r));
      }),
    };
  },

  solve(p) {
    const out = {};
    p.items.forEach((it, i) => { out['i' + i] = show(resultOf(it)); });
    return out;
  },

  describe(p) {
    return p.items.map((it) => show(it) + ' ' + OPS[it.op].op).join(' ; ');
  },

  explain(p) {
    const steps = p.items.map((it, i) => {
      const o = OPS[it.op];
      return '<p><b>' + LABELS[i] + ')</b> ' + show(it) + ' ' + o.op + ' = ' + show(it) + ' ' + o.same +
        ' → dời dấu phẩy ' + o.dir + ' = <b>' + show(resultOf(it)) + '</b></p>';
    });
    steps[0] = '<p><b>Quy tắc:</b> × 0,1 giống : 10 và × 0,01 giống : 100 (dời dấu phẩy sang <i>trái</i> 1 hoặc 2 chữ số); ' +
      ': 0,1 giống × 10 và : 0,01 giống × 100 (dời dấu phẩy sang <i>phải</i> 1 hoặc 2 chữ số). Thiếu chữ số thì thêm số 0.</p>' + steps[0];
    return steps;
  },
};
