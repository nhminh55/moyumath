# curriculum/ — các dạng bài

Mỗi dạng bài là một file ES module trong `curriculum/chapter-N/`. Module chỉ chứa phần toán: sinh đề, template HTML, chấm, lời giải. Module không được đụng tới DOM, Firebase hay `window`. Runner (`js/runner/`) lo phần hiển thị, thu đáp án, tô ✓/✗ và lưu kết quả.

## Thêm một dạng bài mới

1. Tạo file `curriculum/chapter-N/<ten-dang-bai>.js`, có thể copy từ mẫu bên dưới.
2. Thêm 1 dòng `import` và 1 phần tử vào mảng `problems` trong `curriculum/chapter-N/index.js`. Thứ tự trong mảng chính là thứ tự "Dạng 1, 2, ..." trên trang luyện tập.
3. Chạy `npm test`. Test tự sinh 1000 đề cho mỗi dạng và kiểm tra:
   - đáp án mẫu `solve()` đạt đủ `points`, còn bỏ trống thì được 0 điểm;
   - tổng điểm các phần bằng `points`;
   - mỗi `part.field` đều có `ui.feedback` tương ứng;
   - lời giải không chứa `undefined` hoặc `NaN`;
   - file đã được đăng ký trong `index.js`.
4. Nếu dạng bài dùng trong đề kiểm tra, thêm nó vào `config/presets.json`. Việc này làm ở Giai đoạn 3.

Chương mới: tạo `curriculum/chapter-N/index.js` (có `chapter`, `title`, `topics`, `problems`) rồi thêm chương đó vào `curriculum/index.js`.

File có tên bắt đầu bằng `_` (ví dụ `_matching-shared.js`) là helper dùng chung. Chúng không phải dạng bài nên không đăng ký trong `index.js`. GitHub Pages chỉ phục vụ được các file này nhờ file `.nojekyll` ở thư mục gốc, nên không được xoá `.nojekyll`.

## Interface

```js
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

export default {
  id: 'ch3.example',          // KHÔNG BAO GIỜ đổi: dùng làm khoá thống kê và Firestore
  chapter: 3,
  topic: '3.1',               // một id trong `topics` của chapter-3/index.js (trục radar)
  title: 'Tên dạng bài',
  shortTitle: 'Tên ngắn',      // (tuỳ chọn) hiện trên thẻ ở trang luyện tập: "Dạng N · Tên ngắn"
  points: 1,                  // = tổng `max` của các phần khi chấm
  difficulties: ['medium'],
  practice: true,             // false = chỉ dùng trong đề kiểm tra, không hiện ở trang luyện tập
  legacy: undefined,          // chỉ dành cho dạng bài port từ code cũ (nhãn và key Firestore cũ)

  /* Sinh tham số đề. Hàm phải THUẦN: chỉ dùng `rng` (không dùng Math.random) và trả về dữ liệu JSON được. */
  generate({ rng, difficulty }) {
    const a = rng.int(2, 9), b = rng.int(2, 9);
    return { a, b };
  },

  /* Template HTML. Chỉ tạo ô nhập qua `ui`, runner sẽ tự đặt id cho từng ô. */
  render(p, ui) {
    return '<div class="sub">' + p.a + ' + ' + p.b + ' = ' + ui.blank('s', { width: 80 }) + ui.feedback('s') + '</div>';
  },

  /* Chấm điểm. Hàm THUẦN: answers = { [field]: giá trị } do runner thu thập. */
  grade(p, answers) {
    return { parts: [part('s', sameNumber(num(answers.s), p.a + p.b), 1, String(p.a + p.b))] };
  },

  /* Đáp án mẫu, dùng cho test: grade(p, solve(p)) phải đạt tối đa. */
  solve(p) {
    return { s: String(p.a + p.b) };
  },

  /* (Tuỳ chọn) Mô tả đề một dòng, lưu vào wrongDetails để giáo viên xem câu học sinh làm sai. */
  describe(p) {
    return p.a + ' + ' + p.b;
  },

  /* Lời giải chi tiết (HTML). */
  explain(p) {
    return '<p>' + p.a + ' + ' + p.b + ' = <b>' + (p.a + p.b) + '</b></p>';
  },
};
```

### `rng` (từ `js/core/rng.js`)
`int(min, max)`, `pick(arr)`, `shuffle(arr)`, `intExcept(min, max, [loại trừ])`, `next()`. Cùng seed thì ra cùng đề.

### `ui` (do runner cung cấp)

| Hàm | Giá trị trong `answers[field]` |
|---|---|
| `ui.blank(field, { width, placeholder })` | chuỗi học sinh gõ |
| `ui.select(field, [{ value, label }], { placeholder })` | `value` được chọn (hoặc `''`) |
| `ui.checkboxes(field, labels)` | mảng chỉ số các ô được tick |
| `ui.matching(field, { left: [{ id, marker, html }], right: [...] })` | `{ [leftId]: rightId }`; ô feedback tự tạo là `field + '.' + leftId` |
| `ui.feedback(field, { inline })` | chỗ hiển thị ✓/✗ cho `part.field` |
| `ui.hint(text)` | (chỉ hiển thị) |

### Kết quả chấm (từ `js/core/grading.js`)
- `part(field, đúng?, điểm, đáp án hiển thị khi sai, extra)`
- `partial(field, điểm đạt, điểm tối đa, đáp án, extra)`

Trong `extra` có thể có:
- `marks: { [inputField]: true|false }` để tô viền từng ô;
- `expectedChecked: [...]` cho `ui.checkboxes`;
- `note` là ghi chú luôn hiển thị.

### So sánh đáp án (từ `js/core/evaluator.js`)

| Hàm | Dùng để |
|---|---|
| `num`, `sameNumber` | so sánh một số. Chấp nhận `3,5`, `−4`; từ chối `12abc` |
| `parseNumberSet`, `sameNumberSet` | nhiều đáp số, cách nhau bằng `;` hoặc `, ` |
| `parseFactorization`, `factorizationMatches` | phân tích ra thừa số nguyên tố |
| `equivalent(input, expected)` | hai biểu thức bằng nhau về giá trị (`5 + x/3` ≡ `x/3 + 5`) |
| `isFactoredBy(input, factor)` | đúng dạng "nhân tử × (…)" |
| `polynomialMatches(input, [[hệ số, bậc], ...])` | đa thức đã thu gọn, thứ tự hạng tử tuỳ ý |

Hiển thị: dùng `js/core/mathfmt.js` (`sup`, `minus`, `signStr`, `formatPoly`, `formatFactorization`...). Dấu trừ hiển thị là `−`; `formatPoly` tự bỏ hệ số 0 và ±1.
