/* Tìm x biết Ax + B = C (chỉ luyện tập). */
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

export default {
  id: 'ch2.solve-linear',
  chapter: 2,
  topic: '2.5',
  title: 'Tìm x',
  points: 1,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 2, label: 'Tìm x' }], practiceKey: 'ch2_9' },

  generate({ rng }) {
    const A = rng.int(2, 6), x = rng.int(2, 9), B = rng.int(2, 10);
    return { A, B, C: A * x + B, x };
  },

  render(p, ui) {
    return '<div class="sub"><span class="sub-label">Tìm x, biết:</span> ' + p.A + 'x + ' + p.B + ' = ' + p.C +
      '<br>x = ' + ui.blank('x', { width: 60 }) + ui.feedback('x') + '</div>';
  },

  grade(p, ans) {
    return { parts: [part('x', sameNumber(num(ans.x), p.x), 1, String(p.x))] };
  },

  solve(p) {
    return { x: String(p.x) };
  },

  explain(p) {
    return '<p><b>Giải phương trình ' + p.A + 'x + ' + p.B + ' = ' + p.C + ':</b></p>' +
      '<p><b>Bước 1 — Chuyển vế hằng số</b> (đổi dấu khi sang vế kia):</p>' +
      '<p>&nbsp;&nbsp;' + p.A + 'x = ' + p.C + ' − ' + p.B + '</p>' +
      '<p>&nbsp;&nbsp;' + p.A + 'x = ' + (p.C - p.B) + '</p>' +
      '<p><b>Bước 2 — Chia hai vế cho hệ số của x:</b></p>' +
      '<p>&nbsp;&nbsp;x = ' + (p.C - p.B) + ' : ' + p.A + '</p>' +
      '<p>&nbsp;&nbsp;x = <b>' + p.x + '</b></p>' +
      '<p><b>Thử lại:</b> ' + p.A + '·' + p.x + ' + ' + p.B + ' = ' + p.A * p.x + ' + ' + p.B + ' = ' + p.C + ' ✓</p>';
  },
};
