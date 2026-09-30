/* Giải phương trình dạng x² = a, x³ − b = 0, x² + c = 0 (vô nghiệm), x² − d = 0 (Đề cương giữa kỳ I — Câu 24). */
import { minus, sup } from '../../js/core/mathfmt.js';
import { parseNumberSet, sameNumberSet } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const LABELS = ['a', 'b', 'c', 'd'];
/* Học sinh ghi "vô nghiệm" / "không có" / "∅" (có hoặc không dấu) khi phương trình không có nghiệm. */
const NO_SOLUTION = /v[oô]\s*nghi[eệ]m|kh[oô]ng\s*c[oó]|\bko\s*c[oó]|∅|\{\s*\}/i;

/* Mỗi dạng trả { kind, prompt, roots }; roots = [] nghĩa là vô nghiệm. */
const KINDS = {
  sq(rng) { const k = rng.int(2, 15); return { kind: 'sq', k, prompt: 'x² = ' + k * k, roots: [k, -k] }; },
  cube(rng) {
    const m = rng.pick([2, 3, 4, 5, -2, -3, -4, -5]);
    const c = m ** 3;
    return { kind: 'cube', k: m, prompt: 'x³ ' + (c > 0 ? '− ' + c : '+ ' + -c) + ' = 0', roots: [m] };
  },
  none(rng) { const c = rng.pick([1, 4, 9, 16, 25, 36, 49]) * rng.int(1, 2); return { kind: 'none', k: c, prompt: 'x² + ' + c + ' = 0', roots: [] }; },
  sqminus(rng) { const k = rng.int(2, 12); return { kind: 'sqminus', k, prompt: 'x² − ' + k * k + ' = 0', roots: [k, -k] }; },
};

const showRoots = (roots) => (roots.length ? roots.map(minus).join(' ; ') : 'vô nghiệm');

export default {
  id: 'ch1.power-equation',
  chapter: 1,
  topic: '1.3',
  title: 'Giải phương trình x², x³',
  shortTitle: 'Phương trình x², x³',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    return { items: rng.shuffle(Object.keys(KINDS)).map((k) => KINDS[k](rng)) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Giải các phương trình sau:</p>' + p.items.map((it, i) =>
      '<div class="sub"><span class="sub-label">' + LABELS[i] + '.</span> ' + it.prompt + ' &nbsp;⟹&nbsp; x = ' +
        ui.blank('i' + i, { width: 130 }) + ui.feedback('i' + i) + '</div>').join('') +
      ui.hint('Nhiều nghiệm thì cách nhau bằng dấu ; (vd: 3 ; −3). Không có nghiệm thì ghi: vô nghiệm');
  },

  grade(p, ans) {
    return {
      parts: p.items.map((it, i) => {
        const s = String(ans['i' + i] || '');
        const ok = it.roots.length ? !NO_SOLUTION.test(s) && sameNumberSet(parseNumberSet(s), it.roots) : NO_SOLUTION.test(s);
        return part('i' + i, ok, 0.25, showRoots(it.roots));
      }),
    };
  },

  solve(p) {
    const out = {};
    p.items.forEach((it, i) => { out['i' + i] = it.roots.length ? it.roots.join(' ; ') : 'vô nghiệm'; });
    return out;
  },

  describe(p) {
    return p.items.map((it) => it.prompt).join(' ; ');
  },

  explain(p) {
    const step = (it, i) => {
      const head = '<p><b>' + LABELS[i] + ')</b> ' + it.prompt + '</p>';
      const k = it.k;
      if (it.kind === 'sq') {
        return head + '<p>&nbsp;&nbsp;Số dương ' + k * k + ' có hai căn bậc hai: ' + k + '² = (−' + k + ')² = ' + k * k + '</p>' +
          '<p>&nbsp;&nbsp;⟹ x = <b>' + k + '</b> hoặc x = <b>−' + k + '</b></p>';
      }
      if (it.kind === 'sqminus') {
        return head + '<p>&nbsp;&nbsp;Chuyển vế: x² = ' + k * k + '</p>' +
          '<p>&nbsp;&nbsp;Vì ' + k + '² = (−' + k + ')² = ' + k * k + ' ⟹ x = <b>' + k + '</b> hoặc x = <b>−' + k + '</b></p>';
      }
      if (it.kind === 'cube') {
        const c = k ** 3;
        return head + '<p>&nbsp;&nbsp;Chuyển vế: x³ = ' + minus(c) + '</p>' +
          '<p>&nbsp;&nbsp;Mỗi số chỉ có <i>một</i> căn bậc ba: x = ∛' + (c < 0 ? '(' + minus(c) + ')' : c) + ' = <b>' + minus(k) + '</b> ' +
          '(vì ' + (k < 0 ? '(' + minus(k) + ')' : k) + sup(3) + ' = ' + minus(c) + ')</p>';
      }
      return head + '<p>&nbsp;&nbsp;Chuyển vế: x² = −' + k + '</p>' +
        '<p>&nbsp;&nbsp;Bình phương của mọi số đều ≥ 0, không thể bằng số âm −' + k + ' ⟹ phương trình <b>vô nghiệm</b></p>';
    };
    const steps = p.items.map(step);
    steps[0] = '<p><b>Nhớ:</b> x² = a (a &gt; 0) có hai nghiệm ±√a; x² = số âm thì vô nghiệm; x³ = a luôn có đúng một nghiệm x = ∛a.</p>' + steps[0];
    return steps;
  },
};
