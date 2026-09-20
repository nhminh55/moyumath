# moyumath

Trang web luyện tập & kiểm tra Toán 7, hiện chỉ có nội dung Chương 1 (Số tự
nhiên, số nguyên, số hữu tỉ). Static site (HTML/CSS/JS thuần, không build
step), dữ liệu lưu trên Firebase Firestore. Toàn bộ giao diện bằng tiếng Việt.

## Cấu trúc trang

- `login.html` — đăng nhập bằng username/password lưu trong `localStorage`
  (`moyumath_user`, `moyumath_displayName`, `moyumath_class`).
- `index.html` — trang cá nhân / hub các chương, là trang mặc định sau đăng
  nhập. Hiển thị thống kê, hồ sơ năng lực (radar theo 5 chủ đề 1.1–1.5), lịch
  sử kiểm tra, nhận xét & đề xuất luyện lại.
- `exam.html` — bài kiểm tra 15 phút Chương 1 (5 câu, dùng `QuizLogic`).
- `kiemtra-1tiet-chuong1.html` — bài kiểm tra 1 tiết Chương 1 (7 câu, dùng
  `Test1Tiet`).
- `practice.html` — luyện tập theo từng dạng bài riêng lẻ (9 mục, gom theo
  chủ đề 1.1–1.5, mỗi mục trỏ vào một `num` của `QuizLogic` hoặc `Test1Tiet`,
  xem `SOURCES`/`ORDER` trong file). Đơn vị tính là "lượt" (1 lượt = 1 lần
  nộp + chấm điểm 1 đề, có thể gồm nhiều ý a/b/c). Mục tiêu cơ sở 10
  lượt/dạng bài, không khoá khi vượt mốc — học sinh luyện tiếp vô hạn để cải
  thiện điểm. Thưởng sao (lưu tổng ở `localStorage['moyumath_stars']`) tại 2
  mốc: 10 lượt (+5⭐) và 20 lượt (+5⭐ nếu điểm trung bình 10 lượt gần nhất
  ≥ 80%, ngược lại +2⭐) — mỗi dạng tối đa 2 mốc thưởng, cờ `reward10`/
  `reward20` lưu trong Firestore (`giới hạn luyện tập/{key}`) để không lặp
  thưởng. Nếu điểm trung bình của khối 10 lượt đó dưới 5/10 (50%) thì
  **không** tặng sao — bắt làm lại từ đầu (reset `attempts`/`scores` của
  dạng đó) thay vì cho qua mốc.
- `admin.html` — dashboard giáo viên: xem/sửa danh sách học sinh, thống kê
  điểm, lịch sử bài làm.

## Logic sinh đề / chấm điểm

- `js/generators-ch1.js` — logic **sinh đề** thuần (random hoá dữ liệu câu
  hỏi Chương 1), tách khỏi phần render HTML và chấm điểm. Không đụng DOM.
- `js/evaluator.js` — chuẩn hoá & so sánh input toán học của học sinh (dấu
  mũ `^` vs ký tự trên `²³`, dấu nhân `x`/`×`/`*`, thứ tự thừa số không quan
  trọng, dấu phẩy thập phân `,` vs `.`) để tránh chấm sai khi học sinh gõ
  đúng nhưng khác cú pháp mong đợi.
- `logic.js` (`window.QuizLogic`) và `logic-1tiet.js` (`window.Test1Tiet`) —
  mỗi file giữ `gen` (gọi vào `generators-ch1.js`), `render` (in HTML vào
  `#q{n}-body`) và `grade` (đọc DOM, dùng `evaluator.js` để so khớp, ghi
  feedback). Hai bộ độc lập nhau nhưng cùng quy ước `maxPoints`, `gen/render/
  grade['q'+n]`, và div `#q{n}-body` — nhờ vậy `practice.html` có thể tái sử
  dụng đúng khung UI của cả hai cho từng dạng câu riêng lẻ.
- Thứ tự nạp script bắt buộc: `evaluator.js` → `generators-ch1.js` →
  `logic.js` / `logic-1tiet.js` → script của trang.

## Quy chuẩn dữ liệu Firestore (JSON đề bài & bài làm)

Collection gốc: `Đã làm/{displayName}/...`

- `bài làm` (bài kiểm tra 15 phút / 1 tiết đã nộp):
  ```
  { createdAt, examType, score, byQuestion: { "<label>": { earned, max } } }
  ```
- `luyện tập` (một phiên luyện tập trên `practice.html`, có thể gồm nhiều
  dạng câu):
  ```
  { createdAt, updatedAt, totalQuestions, totalCorrect, score,
    byQuestion: { "<label>": { count, correct, totalEarned, max } },
    wrongDetails: [...] }
  ```
- `giới hạn luyện tập` (đếm số lượt đã làm & tiến độ thưởng sao / dạng bài):
  ```
  { label, attempts, scores: [phần trăm điểm mỗi lượt],
    reward10, reward20, reward20Amount, updatedAt }
  ```
- `<label>` là nhãn hiển thị của dạng câu (vd `"Câu 1"`, `"Ước & số nguyên
  tố"`) — **phải khớp chính xác** giữa `exam.html`/`kiemtra-1tiet-chuong1.html`
  và `SOURCES[...].label` trong `practice.html`, vì `index.html` gộp điểm
  theo đúng chuỗi label này để vẽ hồ sơ năng lực và gợi ý luyện lại.

## Quy trình làm việc

- Mỗi lần hoàn thành một tính năng mới (hoặc thay đổi lớn về cấu trúc/logic),
  **phải ghi chú lại vào [`DONE.md`](DONE.md)**: ngày tháng, tính năng/thay
  đổi, các file liên quan. Đây là nhật ký để theo dõi tiến độ dự án, không
  phải changelog cho người dùng cuối.

## Styling

- `css/style.css` — design tokens dùng chung: bảng màu (`--paper`, `--ink`,
  `--pen-red`/`--pen-green`, `--gold`...), reset cơ bản, nền "giấy" của
  `body`, component `.card`. Hiện được `index.html` dùng; các trang còn lại
  (`admin.html`, `exam.html`, `practice.html`,
  `kiemtra-1tiet-chuong1.html`) vẫn khai báo lặp lại các token này trong
  `<style>` riêng — có thể chuyển sang dùng chung file này khi cần dọn dẹp
  thêm, miễn giữ đúng giá trị đang có (một số trang override
  `font-family`/`padding` khác nhau).
- Font: `Lora` (serif, văn bản đề bài / "tờ giấy kiểm tra"), `Inter` (sans,
  UI/nav/label), `Caveat` (viết tay, điểm số/số liệu nổi bật).
- Input đáp số dùng class `.blank` (gạch chân chấm chấm), feedback dùng
  `.feedback.correct` / `.feedback.wrong` với icon ✓/✗.
