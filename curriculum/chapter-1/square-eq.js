/* Tìm x biết x² = k² (Câu 2 — Kiểm tra 15 phút). */
import { parseNumberSet } from '../../js/core/evaluator.js';
import { partial } from '../../js/core/grading.js';

export default {
  id: 'ch1.square-eq',
  chapter: 1,
  topic: '1.4',
  title: 'Tìm x biết x² = ...',
  shortTitle: 'Lũy thừa x²',
  points: 1,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 1, label: 'Câu 2' }], practiceKey: '2' },

  generate({ rng }) {
    return { k: rng.int(2, 20) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Tìm tất cả các giá trị của <i>x</i> thoả mãn <i>x</i>² = ' + p.k * p.k + '</p>' +
      '<div class="sub"><span class="sub-label">x =</span> ' + ui.blank('x', { placeholder: 'vd: 8 ; -8' }) +
        ui.hint('Nếu có nhiều giá trị, cách nhau bằng dấu chấm phẩy ";".') + ui.feedback('x') + '</div>';
  },

  /* Đủ cả hai nghiệm: 1 điểm; đúng một nghiệm và không có giá trị sai: 0,5 điểm. */
  grade(p, ans) {
    const xs = parseNumberSet(ans.x);
    const target = [p.k, -p.k];
    const hit = target.filter((t) => xs.includes(t)).length;
    const extra = xs.filter((v) => !target.includes(v)).length;
    const earned = extra ? 0 : hit === 2 ? 1 : hit === 1 ? 0.5 : 0;
    return { parts: [partial('x', earned, 1, 'x = ' + p.k + ' hoặc x = −' + p.k, { hits: extra ? 0 : hit })] };
  },

  solve(p) {
    return { x: p.k + ' ; -' + p.k };
  },

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return 'x² = ' + p.k * p.k;
  },

  explain(p) {
    const k2 = p.k * p.k;
    return [
      '<p><b>Bài toán:</b> Tìm x biết x² = ' + k2 + '.</p>' +
        '<p>• Ta cần tìm số nào bình phương bằng ' + k2 + '.</p>' +
        '<p>• Thử số dương: ' + p.k + '² = ' + p.k + ' × ' + p.k + ' = ' + k2 + ' ✓</p>',
      '<p>• Thử số âm: (−' + p.k + ')² = (−' + p.k + ') × (−' + p.k + ') = ' + k2 + ' ✓ (âm nhân âm bằng dương)</p>',
      '<p>⟹ <b>x = ' + p.k + '</b> hoặc <b>x = −' + p.k + '</b>.</p>' +
        '<p><i>Quy tắc: x² = a (a > 0) luôn có hai nghiệm: x = √a và x = −√a.</i></p>',
    ];
  },
};
