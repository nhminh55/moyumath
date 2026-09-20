# Nhật ký tính năng

Ghi lại mỗi khi hoàn thành một tính năng mới hoặc thay đổi lớn về cấu trúc/
logic — xem quy tắc ở [`CLAUDE.md`](CLAUDE.md#quy-trình-làm-việc).

## 2026-09-19

- Trích xuất CSS dùng chung của `index.html` (`:root` tokens, reset, nền
  giấy, `.card`) ra `css/style.css`.
- Tách logic sinh đề (trước nằm lẫn trong `logic.js` / `logic-1tiet.js`)
  ra module thuần `js/generators-ch1.js`, không đụng DOM.
- Thêm `js/evaluator.js` chuẩn hoá & so sánh input toán học khi chấm điểm
  (dấu mũ, dấu nhân `x`/`×`/`*`, dấu trừ Unicode, thập phân `,`/`.`, thứ tự
  thừa số) — sửa các trường hợp học sinh gõ đúng nhưng bị chấm sai.
- Thêm `CLAUDE.md` ghi lại ngữ cảnh dự án, quy chuẩn JSON Firestore và
  styling.
- Cải tổ toàn diện logic luyện tập & thêm hệ thống thưởng sao ở
  `practice.html` (xem thêm mục cập nhật "yêu cầu làm lại nếu điểm dưới 5"
  bên dưới cùng ngày):
  - Đổi thuật ngữ cột trái sang "Dạng 1/Dạng 2" (thay "Câu N") để không
    trùng với câu hỏi con a/b/c; đơn vị tính đổi thành "lượt".
  - Bỏ khoá học sinh khi đủ 10 lượt — có thể luyện tiếp vô hạn để cải
    thiện điểm; tiến độ thanh progress ở cột trái tính theo
    `lượt đã làm / 10` (tối đa 100%), điểm % hiển thị riêng.
  - Thêm điểm phong độ (trung bình cộng dồn nếu ≤10 lượt, trung bình 10
    lượt gần nhất nếu >10) và thanh trạng thái góc trên bên phải (Lượt ·
    Điểm phong độ · ⭐ Đã nhận) với 2 nút điều hướng "Luyện tiếp câu khác"
    / "Chuyển sang dạng tiếp theo".
  - Thêm thưởng sao (localStorage `moyumath_stars`) tại mốc 10 lượt (+5⭐)
    và 20 lượt (+5⭐ nếu phong độ ≥80%, ngược lại +2⭐), tối đa 2 mốc/dạng,
    kèm modal chúc mừng; có đối chiếu ngược một lần cho dữ liệu Firestore
    cũ (trước khi có tính năng này) đã đạt mốc.
  - Đổi schema Firestore `giới hạn luyện tập/{key}`: thay `earnedSum`/
    `maxSum` bằng `scores[]` (điểm % từng lượt) + cờ `reward10`/`reward20`/
    `reward20Amount`.
- Hiệu chỉnh bố cục thẻ dạng bài ở cột trái `practice.html` thành 2 progress
  bar riêng: "Điểm" (avgOfScores, cùng công thức "Điểm phong độ") và "Lượt"
  (số lượt / mục tiêu cơ sở 10, tối đa 100% khi vẽ nhưng vẫn hiện đúng số
  lượt thật dù đã vượt mốc); dòng cuối chỉ còn hiện "⭐ Đã nhận: N" khi có
  sao.
- Thu gọn thẻ dạng bài: nhãn "Điểm"/"Lượt" đặt cùng dòng với thanh bar (bỏ
  chữ hoa/letter-spacing gây nặng nề), giảm padding/gap của `.picker-btn`.
  Cột picker (`.col-picker`) được đặt `position:sticky` + `max-height` +
  `overflow-y:auto` ở màn hình ≥769px để có thanh cuộn riêng khi danh sách
  dạng bài quá dài, không đẩy dài cả trang.
- Sửa 4 lỗi/thiếu sót UI ở `practice.html`:
  - Modal thưởng sao và hộp thoại xác nhận "Luyện lại từ đầu" trước đó dùng
    `SOURCES[key].label` (nhãn nội bộ để gộp điểm với bài kiểm tra, ví dụ
    "Câu 1") thay vì tên "Dạng N" hiển thị ở cột trái — gây lệch số (chọn
    "Dạng 2" nhưng thông báo lại nói "Câu 1"). Thêm hàm `displayNameOf(key)`
    đọc thẳng text từ `.picker-btn-title` trong DOM để luôn khớp với cột
    trái, dùng cho mọi thông báo hiển thị cho học sinh.
  - Thêm `.picker-star-badge` ("⭐ N") vào thẻ dạng bài, chỉ hiện khi dạng
    đó đã có sao (>0).
  - Sửa lại đoạn mô tả luật chơi ở đầu trang cho khớp tên nút hiện tại
    ("Đáp án", "Luyện tiếp câu khác →") và luật thưởng sao mốc 10 lượt.
  - Tách khối "Xin chào, {tên} · Đăng xuất" ra thành 1 box riêng
    (`.user-box`) ở góc phải trên header, thay vì nằm chung câu mô tả.
- Khoá nút "Luyện tiếp câu khác →" (disabled) cho tới khi bấm "Đáp án"
  chấm điểm lượt hiện tại, để học sinh không thể bấm liên tục bỏ qua câu
  khó tới khi ra câu dễ mới làm. Bật lại ngay sau `checkAnswer()`, khoá lại
  khi `nextQuestion()` sinh câu mới.
- Thiết kế lại thẻ dạng bài (cột trái) và khối trạng thái (cột phải) của
  `practice.html`:
  - Đánh số "Dạng" liên tục 1→9 xuyên suốt các chủ đề 1.1–1.5 (trước đó lặp
    lại Dạng 1/Dạng 2 ở mỗi chủ đề) — cập nhật cả nhãn nút bấm lẫn tiêu đề
    `SOURCES[...].title`.
  - Thẻ dạng bài đổi bố cục: hàng trên là tên dạng (trái) + badge % điểm
    trung bình (phải, nền màu theo `colorForPct`) + "N/10 lượt"; hàng dưới
    là 1 progress bar duy nhất (6px, bo tròn hết cỡ) theo lượt/10. Bỏ hẳn
    nhãn "Điểm"/"Lượt" rườm rà và bar điểm trung bình riêng.
  - Thẻ active: nền trắng + viền đậm màu `--ink` + vạch chỉ thị 4px bên mép
    trái (`::before`), thay cho nền tô màu + box-shadow cũ. Bỏ luôn style
    `.picker-btn.completed` (dư thừa vì progress bar lượt đã tự chuyển
    xanh khi đủ 10).
  - Thanh trạng thái góc trên bên phải (`.status-bar`) đổi từ khung viền
    mỏng sang nền màu vàng nhạt (#FBF3DD) liền khối, chữ đậm rõ; 2 nút
    "Luyện tiếp câu khác →" / "Chuyển sang dạng tiếp theo ➔" dời xuống
    nhóm với nút "Đáp án" ở `#actionsWrap` cho đúng luồng thao tác.
- Tách 2 progress bar "Điểm"/"Lượt" thành 2 cột cùng 1 dòng
  (`.picker-progress-cols` > 2× `.picker-progress-col`) thay vì xếp chồng;
  số lượt hiển thị gọn thành số (vd "13") vì đã có nhãn "Lượt" đứng trước.
  Nhân tiện phát hiện & sửa lỗi thanh bar bị co lại gần như biến mất: mặc
  định UA stylesheet của Chromium đặt `align-items:flex-start` cho
  `<button>`, khiến các span con trong `.picker-btn` (flex-column) không
  giãn hết chiều ngang — thêm `align-items:stretch` vào `.picker-btn` để
  sửa (ảnh hưởng luôn tới cả bản 1 cột trước đó).
- Sửa % trên progress bar ở cột trái `practice.html`: trước đó lấy từ
  `statsByLabel` (luỹ kế lịch sử toàn bộ phiên "luyện tập"), nay đổi sang
  dùng đúng `avgOfScores(limit.scores)` — cùng công thức với "Điểm phong độ"
  ở thanh trạng thái (trung bình cộng dồn nếu ≤10 lượt, trung bình 10 lượt
  gần nhất nếu >10) để hai nơi luôn khớp nhau. Xoá hẳn cơ chế
  `statsByLabel`/`loadProgressStats`/`__loadPracticeStats` không còn dùng.
- Xoá toàn bộ dữ liệu cũ trong 2 collection Firestore `luyện tập` và
  `giới hạn luyện tập` (mọi học sinh — Mochi, Mom, Yuki; 17 + 1 document)
  vì không tương thích với schema/luật tính điểm mới; không đụng `bài làm`
  (điểm kiểm tra) hay `students` (tài khoản).
- Bổ sung luật "dưới 5 điểm thì làm lại" ở mốc thưởng sao của `practice.html`:
  nếu điểm trung bình của khối 10 lượt (mốc 10) hoặc 10 lượt gần nhất
  (mốc 20) dưới 5/10 (50%), không tặng sao — reset `attempts`/`scores` của
  dạng đó về 0 và hiện modal yêu cầu làm lại thay vì modal chúc mừng. Dữ
  liệu Firestore cũ (không có `scores[]` chi tiết) được xử lý riêng qua
  `migrateLegacyMilestones` (dùng `earnedSum`/`maxSum` cũ làm điểm tham
  khảo, mặc định coi là đạt nếu thiếu dữ liệu) để không bị ép làm lại oan
  chỉ vì thiếu lịch sử chi tiết.

## 2026-09-20

- Thêm module nháp vẽ tay `js/scratchpad.js` (kiểu ALEKS scratchpad): canvas
  trong suốt phủ lên `.sheet` (khu vực đề bài) ở `exam.html`,
  `kiemtra-1tiet-chuong1.html`, `practice.html`, cùng thanh công cụ nổi góc
  dưới phải (bật/tắt nháp, 3 màu bút — xanh/đỏ/bút chì đen, 2 độ dày, xoá
  nháp). Tự inject CSS qua JS, không cần sửa `<style>` của từng trang.
  - Dùng Pointer Events (`pointerdown/move/up/cancel` + `setPointerCapture`)
    để hoạt động đúng với cả bút cảm ứng (Apple Pencil/S-Pen) lẫn ngón tay;
    `touch-action:none` trên canvas để tránh giật/cuộn trang khi tì tay.
    Canvas dựng lại kích thước theo `devicePixelRatio` để nét không nhoè
    trên màn hình Retina/2K, và theo dõi đổi kích thước container bằng
    `ResizeObserver` (giữ nguyên nét đã vẽ vì lưu toạ độ dạng tỉ lệ 0–1,
    không lưu bitmap).
  - Khi tắt nháp, canvas chuyển `pointer-events:none` để học sinh bấm được
    vào `<input>`/nút bên dưới; các nét vẽ vẫn giữ nguyên khi bật lại.
  - Xuất `window.Scratchpad.init(container)` và hàm độc lập
    `window.clearScratchpad()` — đã gọi ở `renderAll()`/`resetInputsOnly()`
    của `exam.html`/`kiemtra-1tiet-chuong1.html` và ở `nextQuestion()` của
    `practice.html` để tự xoá nháp mỗi khi đổi đề/lượt làm bài mới.
  - Đã kiểm thử bằng Playwright (headless Chromium) trên cả `exam.html` và
    `practice.html`: bật nháp vẽ được nét, không gây cuộn trang, tắt nháp
    vẫn nhập được vào ô đáp số, nút "Xóa nháp" xoá sạch canvas, không có lỗi
    console.
