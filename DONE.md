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
- Viết lại `js/scratchpad.js` thành **cửa sổ nổi (floating modal)** kiểu
  ALEKS thay vì canvas phủ đè lên `.sheet` — canvas cũ che mất chữ đề bài.
  API gọi vào không đổi (`Scratchpad.init(container)` /
  `window.clearScratchpad()`), nên `exam.html`, `kiemtra-1tiet-chuong1.html`,
  `practice.html` không cần sửa gì.
  - `init()` chèn 1 nút `📝 Bảng nháp` dạng tab nhô lên góc trên-phải của
    `container` (dùng `position:absolute; top:-17px`, không che nội dung
    header có sẵn), bấm vào mở/đóng một `div.sp-modal` `position:fixed`
    gắn vào `document.body` (kích thước mặc định 450×400px, `max-width:
    92vw; max-height:80vh` cho màn nhỏ).
  - Cửa sổ nháp có thanh tiêu đề (kéo thả bằng Pointer Events trên
    `header`, chuyển từ neo `right/top` sang `left/top` khi bắt đầu kéo,
    giới hạn trong viewport) + nút ghim 📌 (`sp-pinned`: dock cứng sang nửa
    phải màn hình, `width:clamp(320px,50vw,480px); height:100dvh` — dùng
    cho tablet/iPad) + nút đóng ✕ + hàng công cụ (3 màu bút, 2 độ dày, nút
    🗑️ Xóa hết).
  - Vùng vẽ `.sp-canvas-wrap` có nền kẻ ô ly mờ (`linear-gradient` lưới
    24px) thay cho nền trắng trơn, canvas trong suốt nằm trên. Vẫn giữ
    nguyên cơ chế lưu nét theo toạ độ tỉ lệ 0–1 + `ResizeObserver` +
    Pointer Events (coalesced events, `setPointerCapture`,
    `touch-action:none`) để tối ưu Apple Pencil/S-Pen như bản cũ.
  - Bỏ hẳn khái niệm "bật/tắt nháp" đè lên đề bài (không cần nữa vì canvas
    nháp giờ nằm trong cửa sổ riêng, không chồng lên ô nhập đáp án) — đóng
    cửa sổ chỉ ẩn đi, không xoá nét, mở lại vẫn còn nguyên bài đang nháp.
- Bỏ tiếp bản cửa sổ nổi ở trên, đổi `js/scratchpad.js` sang **layout chia
  3 cột dạng split-pane có resizer kéo được** (vì cửa sổ nổi vẫn có lúc đè
  lên nội dung khi kéo tới gần đề bài). API gọi vào vẫn không đổi
  (`Scratchpad.init(container)`), nên 3 trang dùng nó tiếp tục không cần
  sửa gì:
  - `init()` bọc `container` (vd `.sheet`) vào một hàng flex `.sp-split`
    ngay tại đúng vị trí cũ của nó trong DOM, gắn class `.sp-main` cho
    `container`. Với `practice.html`, chỉ `#sheet` bị bọc (không phải cả
    `.col-work`), nên sidebar `.col-picker` (Cột 1) và hàng nút
    `#actionsWrap` bên dưới hoàn toàn không bị ảnh hưởng; với
    `exam.html`/`kiemtra-1tiet-chuong1.html` (không có sidebar) thì chỉ có
    2 cột hiệu dụng: đề bài + bảng nháp.
  - Cột 2 (`.sp-main{flex:1 1 0%}`) tự co giãn theo đúng ràng buộc
    width/max-width mà từng trang **đã khai báo sẵn cho `.sheet`** (không
    sửa `<style>` của trang nào cả): `exam.html`/`kiemtra-1tiet-chuong1.html`
    có `max-width:720px` nên tờ giấy kiểm tra giữ nguyên độ rộng "thật"
    như cũ dù bật hay tắt nháp; `practice.html` có `.sheet{width:100%}`
    nên co/giãn khít theo đúng yêu cầu khi bật/tắt cột 3.
  - Thanh `.sp-resizer` nằm giữa cột 2 và 3, kéo bằng Pointer Events
    (`pointerdown/move/up/cancel` + `setPointerCapture`) để mượt trên cả
    chuột và bút cảm ứng/ngón tay trên tablet. Độ rộng cột 3 mặc định 38%,
    kéo được trong khoảng `240px`–`60%` chiều rộng `.sp-split`.
  - Canvas nháp nằm trong `.sp-canvas-wrap` (nền kẻ ô ly mờ) và tự
    `resizeCanvas()` mỗi khi kích thước khung đổi, nhờ `ResizeObserver`
    gắn trực tiếp trên `.sp-canvas-wrap` — bắt được cả lúc kéo resizer lẫn
    lúc bật/tắt cột hay đổi cỡ cửa sổ trình duyệt. Nét vẽ vẫn lưu theo toạ
    độ tỉ lệ 0–1 (không phải bitmap) nên resize xong vẽ lại là vừa khít,
    không bị méo tỉ lệ hay xoá trắng.
  - Dưới 820px (điện thoại/tablet đứng), `.sp-split` chuyển
    `flex-direction:column`: cột 3 xếp xuống dưới cột 2, resizer đổi sang
    kéo dọc (`cursor:row-resize`, chỉnh chiều cao thay vì chiều rộng).
  - Nút bật/tắt vẫn là tab `📝 Bảng nháp` nhô lên góc trên-phải của
    `container` như bản trước, bấm vào toggle class `sp-off` trên
    `.sp-split` (ẩn/hiện cả resizer lẫn cột 3 bằng `display:none`).
  - Kiểm thử bằng Playwright trên cả 3 trang: cột 1 (sidebar
    `practice.html`) không đổi kích thước khi bật/tắt nháp; kéo resizer
    đổi được độ rộng cột 3 và nét vẽ cũ không bị xoá/méo sau khi resize;
    ô nhập đáp án vẫn gõ được bình thường khi cột nháp đang mở; ở khung
    nhìn hẹp (700px) layout tự xếp dọc với resizer kéo theo chiều cao;
    không có lỗi console.
- Chỉnh chiều cao + làm gọn toolbar của bảng nháp trong `js/scratchpad.js`
  (bảng nháp trước đó bị "cụt" theo nội dung đề ngắn, và toolbar còn nhiều
  chữ):
  - Thêm `MIN_HEIGHT = 600` (px), áp cho cả `.sp-main` (khung `.sheet`) lẫn
    `.sp-col` (cột bảng nháp) — trước đó `.sp-split{align-items:flex-start}`
    khiến `.sp-col` (dù có `align-self:stretch`) bị kéo ngắn theo chiều cao
    thật của `.sp-main` mỗi khi đề bài ngắn (vd `practice.html` chỉ hiện 1
    câu/lượt). Trong khung hẹp xếp dọc (`@media max-width:820px`) vẫn giữ
    chiều cao cột riêng (280px, không áp mốc 600px vì sẽ quá cao trên điện
    thoại).
  - Toolbar bỏ hết nhãn chữ, chỉ còn icon: thêm nút **Cục gôm** 🧹 — chọn
    gôm thì `state.tool='eraser'`, khi vẽ set
    `ctx.globalCompositeOperation='destination-out'` (xoá đúng chỗ chạm
    vào, không đụng nền kẻ ô ly vì đó là CSS `background-image` của
    `.sp-canvas-wrap`, nằm dưới canvas trong suốt); bấm lại vào 1 trong 3
    nút màu bút sẽ tự chuyển `state.tool='pen'`
    (`globalCompositeOperation='source-over'`). Mỗi nét vẽ lưu kèm
    `composite` riêng để `redrawAll()` (chạy khi resize) tô lại đúng chế
    độ vẽ/xoá của từng nét, không bị "hồi sinh" nét đã gôm sau khi đổi kích
    thước cột.
  - 2 nút độ dày đổi nhãn chữ "Mảnh"/"Vừa" thành icon chấm tròn nhỏ/to
    (`•`/`●`, cỡ chữ 14px/19px); nút "Xóa hết" chỉ còn icon 🗑️. Toàn bộ nút
    dùng chung class `.sp-icon-btn` (nút tròn 28px) + trạng thái
    `.sp-selected` (viền vàng nổi bật) để rõ đang chọn màu/gôm/độ dày nào —
    màu bút và gôm loại trừ lẫn nhau qua `refreshToolSelection()`.
  - Thu nhỏ cụm nút hành động `#actionsWrap` (Đáp án / Luyện tiếp câu khác
    / Chuyển sang dạng tiếp theo / Luyện lại từ đầu) ở `practice.html`:
    thêm rule `.actions button{padding:8px 16px; font-size:12.5px;
    border-radius:18px;}` (specificity cao hơn rule `button{}` gốc nên
    không cần sửa từng nút) và giảm `gap`/`margin` của `.actions`.
  - Kiểm thử bằng Playwright: `.sheet`/`.sp-col` cao ≥600px kể cả khi chọn
    1 câu ngắn; toolbar không còn chữ "Mảnh/Vừa/Xóa hết"; chọn gôm rồi tô
    lên nét bút cũ làm alpha-sum của canvas về 0 (xoá sạch, không méo);
    chọn lại màu bút tự bỏ chọn gôm và vẽ lại bình thường; nút hành động ở
    `practice.html` nhỏ gọn hẳn so với trước; không có lỗi console.
- Sửa lỗi vừa phát sinh ở trên: gán `min-height:600px` chung cho `.sp-main`
  khiến **khung đề bài màu trắng** bị kéo giãn dài ngoằng (đề ngắn nhưng
  card vẫn cao 600px, thừa một khoảng trắng vô lý bên trong) và đẩy cụm nút
  hành động xuống thấp hơn cần thiết. Tách hẳn chiều cao 2 cột trong
  `js/scratchpad.js`:
  - `.sp-main` (cột giữa — khung đề bài): bỏ `min-height`, đổi thành
    `align-self:flex-start; height:auto;` — luôn ôm vừa đúng chiều cao nội
    dung câu hỏi thật, không phụ thuộc cột nháp cao hay thấp.
  - `.sp-col` (cột phải — bảng nháp): tách riêng hằng số
    `COL_MIN_HEIGHT=600` và `COL_VIEWPORT_OFFSET=130`, đặt
    `height:calc(100vh - 130px); min-height:600px; align-self:flex-start;`
    — chiều cao luôn bám theo màn hình (không phụ thuộc cột giữa dài hay
    ngắn), tối thiểu 600px trên màn hình rất thấp. `.sp-resizer` vẫn giữ
    `align-self:stretch` để thanh kéo trải dài theo cột nào cao hơn (cột
    giữa nếu đề dài như `exam.html`, hoặc cột nháp nếu đề ngắn như
    `practice.html`).
  - Canvas vẫn tự bung 100% chiều cao còn lại của `.sp-col` qua
    `.sp-canvas-wrap{flex:1}` như cũ, không cần sửa gì thêm.
  - Kiểm thử bằng Playwright: `practice.html` (đề ngắn) — khung đề bài chỉ
    cao đúng theo nội dung thật (không còn nhảy lên 600px), cột nháp vẫn
    cao ~770px (viewport 900 − 130) độc lập; `exam.html` (đề dài, ~1950px)
    — khung đề bài giữ nguyên chiều cao thật, không bị ảnh hưởng bởi cột
    nháp ngắn hơn; màn hình hẹp (700px, xếp dọc) — khung đề bài vẫn full
    width như trước, không bị co lại theo nội dung.
- `practice.html`: bỏ hẳn nút "Chuyển sang dạng tiếp theo" (`#nextTypeBtn`,
  cùng hàm `nextTypeKey()` chỉ phục vụ nó), nút "Thoát luyện tập"
  (`#exitBtn`, cùng hàm `exitPractice()` — an toàn để xoá vì tiến trình đã
  tự lưu qua `saveProgress()` sau mỗi lần chấm/next, không cần nút thoát
  riêng để lưu) và liên kết "Kiểm tra đầy đủ" (chỉ giữ lại "← Trang cá
  nhân"). Dọn luôn CSS `#nextTypeBtn{...}` không còn dùng.
  - Chuyển `<div class="actions" id="actionsWrap">` (còn lại: Đáp án /
    Luyện tiếp câu khác / Luyện lại từ đầu) và `<p id="summaryNote">` vào
    **bên trong** `#sheet` (Cột 2), ngay sau `<section id="qActive">` —
    trước đó 2 thẻ này là **em của `.col-work`**, nằm ngoài `.sp-split` nên
    lúc nào cũng trải full chiều rộng `.col-work` (đè lên cả phần cột nháp
    khi mở), không co giãn theo cột giữa. Vì `.actions{width:100%}` vốn đã
    là CSS chung của trang, chỉ cần đổi vị trí trong DOM là hàng nút tự
    động ăn theo đúng chiều rộng nội dung của `#sheet` (bên trong padding),
    tắt nháp thì giãn hết cỡ, bật nháp thì co lại — không cần thêm CSS
    riêng cho `.actions`.
  - Kiểm thử bằng Playwright: `#actionsWrap`/`#summaryNote` nằm trong cây
    con của `#sheet`; khi tắt nháp hàng nút rộng bằng bề ngang nội dung
    `#sheet` (816px sheet ↔ 710px actions, chênh đúng bằng padding trái+
    phải của `.sheet`); khi bật nháp cả hai cùng co lại tỉ lệ (492px sheet
    ↔ 386px actions) và mép phải hàng nút (958px) không chạm tới mép trái
    cột nháp (1013px); còn đúng 3 nút Đáp án/Luyện tiếp câu khác/Luyện lại
    từ đầu; không có lỗi console.
- Thêm tính năng **cuộn dọc + mở rộng bảng nháp** (kiểu ALEKS) vào
  `js/scratchpad.js`, cho bé đặt tính dài mà không hết chỗ:
  - `.sp-canvas-wrap` (khung chứa canvas trong cột 3) đổi từ "vừa khít,
    không cuộn" sang khung cuộn thật: `overflow-y:auto; overflow-x:hidden;
    position:relative;` + thanh cuộn mảnh, bo tròn qua
    `::-webkit-scrollbar*` (Chrome/Safari/Edge) và `scrollbar-width:thin;
    scrollbar-color` (Firefox). `<canvas>` không còn `position:absolute;
    inset:0` mà là phần tử block bình thường, cao hơn khung nhìn thấy bao
    nhiêu thì khung cuộn xuất hiện bấy nhiêu; nền kẻ ô ly (`background-image`
    lưới 24px) chuyển từ `.sp-canvas-wrap` sang thẳng `<canvas>` để lưới
    phủ hết toàn bộ chiều cao đã mở rộng, không chỉ phần nhìn thấy ban đầu.
  - Nút icon ➕ **"Thêm chỗ nháp"** trong toolbar: mỗi lần bấm cộng thêm
    `EXTRA_HEIGHT_STEP = 500px` vào `state.extraHeight`, gọi lại
    `resizeCanvas()` rồi `canvasWrap.scrollTo({top: scrollHeight,
    behavior:'smooth'})` để tự cuộn xuống đúng phần giấy mới thêm.
  - **Bảo toàn nét vẽ khi tăng chiều cao** — đổi hẳn cách lưu toạ độ nét
    vẽ thay vì "tỉ lệ 0–1 cả 2 trục" như trước: trục X vẫn lưu theo tỉ lệ
    0–1 chiều rộng (để kéo resizer đổi độ rộng cột vẫn co giãn ngang mượt
    như cũ), còn trục Y đổi sang lưu **pixel tuyệt đối** (`yAbs`, không
    chia cho chiều cao). Nhờ vậy khi `resizeCanvas()` chạy lại sau khi
    tăng `extraHeight`, các nét cũ được vẽ lại đúng y nguyên vị trí pixel
    cũ — chỉ có thêm giấy trắng nối vào phía dưới, không bị co giãn/dịch
    chỗ theo chiều cao mới. Đây là cách làm thay thế tốt hơn gợi ý ban đầu
    (backup bitmap qua `getImageData`/offscreen canvas): vẫn đạt đúng mục
    tiêu "không mất nét, không méo" nhưng giữ nét vẽ luôn sắc nét ở mọi
    `devicePixelRatio` thay vì phải phóng/thu một tấm ảnh bitmap.
    `relPoint()` cũng đổi sang lấy toạ độ từ `canvas.getBoundingClientRect()`
    (thay vì khung cuộn ngoài) nên tự động đúng vị trí con trỏ dù đang
    cuộn tới đâu, không cần cộng thêm `scrollTop` thủ công.
  - **Phân biệt vẽ vs cuộn bằng cảm ứng**: thêm `state.activePointers`
    (Map theo dõi mọi pointer đang chạm) — bút cảm ứng hoặc giữ chuột
    trái luôn vẽ; chạm 1 ngón cũng vẽ (để bé không có bút vẫn dùng được);
    nhưng ngay khi ngón tay **thứ 2** chạm vào canvas, `cancelCurrentStroke()`
    huỷ ngay nét đang vẽ dở (vẽ lại toàn bộ canvas từ `state.strokes` để
    xoá sạch vệt lem lỡ tay) rồi chuyển sang `state.scrollGesture=true`,
    dùng độ chênh Y trung bình giữa 2 ngón mỗi lần `pointermove` để tự tay
    chỉnh `canvasWrap.scrollTop` (vì canvas có `touch-action:none` nên
    trình duyệt không tự cuộn bằng cảm ứng được, phải cuộn thủ công qua
    JS). Chế độ cuộn giữ nguyên tới khi nhấc hết mọi ngón, tránh vô tình vẽ
    lem khi nhấc bớt 1 ngón giữa chừng. Cuộn bằng thanh scrollbar hoặc con
    lăn chuột vẫn hoạt động bình thường vì không đi qua canvas.
  - Kiểm thử bằng Playwright: bấm ➕ 1 lần canvas cao thêm đúng 500px, tự
    cuộn xuống đúng đáy (`scrollTop = scrollHeight - clientHeight`); bấm
    lần 2 cộng dồn đúng +1000px tổng; nét vẽ ở gần đầu trang vẫn nguyên vị
    trí pixel sau khi mở rộng + cuộn về đầu lại; giả lập cử chỉ 2 ngón tay
    (2 `PointerEvent` `pointerType:'touch'` riêng biệt di chuyển cùng lúc)
    khiến `scrollTop` tăng đúng theo cử chỉ thay vì để lại nét vẽ; kéo
    resizer đổi độ rộng, gôm, tắt/bật cột, xoá hết vẫn hoạt động bình
    thường như trước (không hồi quy); không có lỗi console.
