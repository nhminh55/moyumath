/* Viết biểu thức đại số từ lời văn (Câu 3 — Kiểm tra 15 phút Chương 2).
   Chấm theo giá trị tương đương: "x/3 + 5", "5 + x/3", "1/3x + 5" đều đúng. */
import { equivalent } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

/* Mỗi mẫu trả { text, expr } — expr dạng ascii để chấm, cũng dùng để hiển thị đáp án. */
const TYPES_A = [
  (rng) => { const k = rng.int(2, 5), m = rng.int(2, 9); return { text: 'Chia số đó cho ' + k + ' rồi cộng ' + m + '.', expr: 'x/' + k + ' + ' + m }; },
  (rng) => { const k = rng.int(2, 5), m = rng.int(2, 9); return { text: 'Nhân số đó với ' + k + ' rồi trừ đi ' + m + '.', expr: k + 'x - ' + m }; },
  (rng) => { const k = rng.int(2, 9), m = rng.int(2, 5); return { text: 'Cộng số đó với ' + k + ' rồi chia cho ' + m + '.', expr: '(x + ' + k + ')/' + m }; },
  (rng) => { const k = rng.int(2, 9), m = rng.int(2, 5); return { text: 'Trừ số đó đi ' + k + ' rồi nhân với ' + m + '.', expr: m + '(x - ' + k + ')' }; },
];
const TYPES_B = [
  (rng) => { const p = rng.int(10, 30), q = rng.int(2, 7); return { text: 'Lấy ' + p + ' trừ đi ' + q + ' lần số đó.', expr: p + ' - ' + q + 'x' }; },
  (rng) => { const p = rng.int(2, 9), q = rng.int(10, 30); return { text: 'Lấy ' + p + ' lần số đó trừ đi ' + q + '.', expr: p + 'x - ' + q }; },
  (rng) => { const p = rng.int(2, 9), q = rng.int(2, 9); return { text: 'Lấy tổng của số đó và ' + p + ' nhân với ' + q + '.', expr: q + '(x + ' + p + ')' }; },
  (rng) => { const p = rng.int(2, 9); return { text: 'Bình phương của tổng số đó và ' + p + '.', expr: '(x + ' + p + ')^2' }; },
];

const display = (expr) => expr.replace(/\^2/g, '²').replace(/ - /g, ' − ');

export default {
  id: 'ch2.write-expression',
  chapter: 2,
  topic: '2.1',
  title: 'Viết biểu thức',
  points: 1,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 2, label: 'Viết biểu thức' }, { chapter: 2, label: 'Câu 3' }], practiceKey: 'ch2_2' },

  generate({ rng }) {
    return { a: rng.pick(TYPES_A)(rng), b: rng.pick(TYPES_B)(rng) };
  },

  render(p, ui) {
    return '<p class="q-prompt">Bạn Minh nghĩ đến một số x. Viết biểu thức cho mỗi phát biểu sau:</p>' +
      '<div class="sub"><span class="sub-label">a.</span> ' + p.a.text +
        '<br>' + ui.blank('a', { width: 140, placeholder: 'vd: x/3 + 5' }) +
        ui.hint('Nhập phân số dùng dấu /, luỹ thừa bằng dấu ^ (vd: x/3 + 5, x^2)') + ui.feedback('a') + '</div>' +
      '<div class="sub"><span class="sub-label">b.</span> ' + p.b.text +
        '<br>' + ui.blank('b', { width: 140 }) + ui.feedback('b') + '</div>';
  },

  grade(p, ans) {
    return {
      parts: [
        part('a', equivalent(ans.a, p.a.expr), 0.5, display(p.a.expr)),
        part('b', equivalent(ans.b, p.b.expr), 0.5, display(p.b.expr)),
      ],
    };
  },

  solve(p) {
    return { a: p.a.expr, b: p.b.expr };
  },

  explain(p) {
    return '<p><b>Viết biểu thức đại số từ lời văn (gọi "số đó" là x):</b></p>' +
      '<p><b>a)</b> "' + p.a.text + '"</p>' +
      '<p>&nbsp;&nbsp;Chuyển từng hành động thành phép tính theo đúng thứ tự:</p>' +
      '<p>&nbsp;&nbsp;⟹ Biểu thức: <b>' + display(p.a.expr) + '</b></p>' +
      '<p><b>b)</b> "' + p.b.text + '"</p>' +
      '<p>&nbsp;&nbsp;Chuyển từng hành động thành phép tính:</p>' +
      '<p>&nbsp;&nbsp;⟹ Biểu thức: <b>' + display(p.b.expr) + '</b></p>' +
      '<p><i>Lưu ý: "rồi" nghĩa là thực hiện theo thứ tự → có thể cần dấu ngoặc.</i></p>';
  },
};
