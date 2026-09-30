/* Nối phát biểu lời văn với biểu thức (giỏ m quả táo) (Câu 2 — Kiểm tra 15 phút Chương 2). */
import { makePairs, renderMatching, gradeMatching, solveMatching, pairsInLeftOrder } from './_matching-shared.js';

const LEFT_MARKERS = ['A.', 'B.', 'C.', 'D.'];
const RIGHT_MARKERS = ['i', 'ii', 'iii', 'iv'];
const WHY = [
  'từ khoá "thêm" → số lượng tăng → phép <b>cộng</b>',
  'từ khoá "gấp đôi" → lặp lại 2 lần → phép <b>nhân</b> với 2',
  'từ khoá "bớt" → số lượng giảm → phép <b>trừ</b>',
  'từ khoá "một nửa" → chia thành 2 phần bằng nhau → phép <b>chia</b> cho 2',
];

export default {
  id: 'ch2.match-statements',
  chapter: 2,
  topic: '2.1',
  title: 'Nối phát biểu',
  points: 2,
  difficulties: ['medium'],
  legacy: { labels: [{ chapter: 2, label: 'Nối phát biểu' }, { chapter: 2, label: 'Câu 2' }], practiceKey: 'ch2_1' },

  generate({ rng }) {
    const a = rng.int(3, 9), b = rng.int(3, 9);
    return makePairs(rng, [
      { left: 'Cho thêm ' + a + ' quả táo vào giỏ', right: 'm + ' + a },
      { left: 'Gấp đôi số quả táo trong giỏ', right: '2m' },
      { left: 'Bớt ' + b + ' quả táo trong giỏ', right: 'm − ' + b },
      { left: 'Giảm một nửa số quả táo trong giỏ', right: 'm : 2' },
    ]);
  },

  render(p, ui) {
    return '<p class="q-prompt">Một chiếc giỏ có chứa m quả táo. Nối mỗi phát biểu với một biểu thức tương ứng.</p>' +
      renderMatching(p, ui, { leftMarkers: LEFT_MARKERS, rightMarkers: RIGHT_MARKERS.map((r) => r + '.') });
  },

  grade(p, ans) {
    return { parts: gradeMatching(p, ans, { rightMarkers: RIGHT_MARKERS, pointsEach: 0.5 }) };
  },

  solve: solveMatching,

  /* Mô tả ngắn đề (lưu vào wrongDetails cho admin). */
  describe(p) {
    return p.left.map((it) => it.text).join(' ; ');
  },

  explain(p) {
    const steps = pairsInLeftOrder(p).map(({ left, right }, i) =>
      '<p>' + (i + 1) + ') "' + left.text + '"</p>' +
      '<p>&nbsp;&nbsp;' + WHY[left.key] + '</p>' +
      '<p>&nbsp;&nbsp;⟹ nối với <b>' + right.text + '</b></p>');
    steps[0] = '<p><b>Gọi số quả táo ban đầu trong giỏ là m.</b> Nối từng phát biểu với biểu thức — ' +
      '<i>đọc kỹ từ khoá ("thêm", "bớt", "gấp", "nửa") để chọn đúng phép tính.</i></p>' + steps[0];
    return steps;
  },
};
