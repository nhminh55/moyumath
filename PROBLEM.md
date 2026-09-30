# PROBLEM.md — Rà soát code moyumath (2026-09-30)

Tổng hợp các vấn đề hiện có và đề xuất cải thiện, để thảo luận trước khi sửa. Số dòng tham chiếu theo commit `f706c73`. Phần về Firestore rules là suy luận từ hành vi client (repo không có file rules).

## A. Bảo mật & tính toàn vẹn dữ liệu (nghiêm trọng nhất)
1. Đăng nhập học sinh chỉ kiểm tra ở client: `login.html:147-150` đọc `students/{username}` rồi so mật khẩu plaintext bằng JS → Firestore rules buộc phải cho đọc công khai → ai cũng lấy được toàn bộ mật khẩu. `admin.html:961` còn hiển thị mật khẩu.
2. "Session" = key localStorage; `localStorage.setItem('moyumath_displayName','X')` là nộp bài dưới tên người khác.
3. Giả mạo điểm: `window.__saveSubmission(...)`, `__savePracticeLimit(...)` gọi được từ devtools; `window.__answerKey` lộ đáp án (`exam.html:551`, `exam-ch2.html:555`, `kiemtra...:539`).
4. admin.html chỉ cần "đã đăng nhập Firebase Auth" (không kiểm tra email/claim admin).
5. Stored XSS: `studentName`, `examType`, `score`, `image`, `byQuestion`… chèn thẳng vào `innerHTML` ở `admin.html` (≈605-961) và `index.html:642` → chạy trong phiên admin.
6. Open redirect `login.html?redirect=...` (kể cả `javascript:`).
7. Dữ liệu keyed theo `displayName` (không phải username) → trùng tên bị gộp, đổi tên mất lịch sử, tên có `/` hỏng path.
8. Không có `firestore.rules` trong repo.

## B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp)
- Ch2 q4 (`js/generators-ch2.js:72-80`): nhân tử chung KHÔNG phải ƯCLN (vd k=2,a=2,b=4 → 4x+8, đáp án chờ `2(2x+4)`). Tương tự câu c. Render (`logic-ch2.js:221,226`) không có `y`, còn explain có `y` và dấu `−` → lời giải lệch đề.
- Ch2 q5c / q7: hệ số có thể = 0, 1, −1 → đáp án chờ `0x+5`, `1x^2` — học sinh viết đúng `x^2` bị chấm sai. Explain in `+ -3`.
- Ch2 q8: đề ghi `+ bx²`, explain ghi `− bx²`.
- Ch2 q7 ("Đa thức một biến"): `maxPoints` = 1.5 nhưng hàm chấm chỉ cho tối đa 1 → trang luyện tập không bao giờ vượt 67%, học sinh không thể đạt mốc sao ≥ 80%.
- Chấm biểu thức Ch2 bằng so chuỗi (`checkMatchExpr`) → `5 + x/3`, `-2+3x`, `2*x` bị chấm sai dù đúng.
- 1 tiết q5: đề "căn bậc hai" chấm ±, explain lại nói "căn bậc hai số học" (chỉ dương).
- Ch1 q2: placeholder `8 ; -8` nhưng hint "cách nhau bằng dấu phẩy"; `parseNumberSet` tách `2,5` thành 2 và 5.
- `num()` dùng `parseFloat` → `"12abc"` được chấp nhận là 12.
- Cộng điểm float (0.1×5, 0.34+0.33+0.33) → hiển thị kiểu 1.9999999.

## C. Luồng thi / luyện tập
- exam-ch2.html:9 redirect về `exam.html` (copy-paste).
- F5 = đề mới + đồng hồ mới (thời gian vô hạn); "Đổi đề"/"Làm lại" reset timer.
- Chấm xong không khoá input, không disable nút → nộp nhiều lần, sửa đáp án sau khi xem lời giải.
- Timer `timeLeft--` bằng setInterval → trôi khi tab nền.
- Lưu thất bại chỉ console.warn/toast, không retry; ảnh html2canvas base64 lưu trong doc → nguy cơ vượt 1 MB.
- Sao: nút Reset xoá cờ `reward10/20` (`practice.html:1368`) → farm sao vô hạn; trả lời trước khi load xong ghi đè tiến độ; `moyumath_stars` chỉ ở localStorage, không xoá khi logout (người sau thừa hưởng), không hiển thị ở đâu; migration legacy đặt `reward10=true` dù không cộng sao.
- Ch2: tên dạng bị dính text badge ("…Kiểm tra 15p") vào Firestore.
- Enter trong `<select>`/scratchpad cũng nộp bài.

## D. Thống kê / dashboard
- index.html gộp điểm theo label bỏ qua chapter → "Câu 1" Ch2 cộng vào "Câu 1" Ch1; nhãn `1T-Câu n` không khớp gì; admin chỉ biết Câu 1-5.
- index/admin tải toàn bộ bài làm (kèm ảnh base64) không phân trang.
- Ch2 hiển thị "chưa có dữ liệu" dù đã có luyện tập.

## E. Kiến trúc / bảo trì
- exam.html ≈ exam-ch2.html (~98%), kiemtra gần giống; practice.html ≈ practice-ch2.html (~90%); ~370 dòng CSS lặp; `firebaseConfig` lặp 8 file.
- render/grade phụ thuộc id DOM cố định, không test được; không có test nào (`npm test` = lỗi).
- Dead code: `showToast`, `ORDER`, `savingProgress`, `CHART_QUESTIONS` (index), nhánh if trùng ở explain q3 1 tiết.

## Lộ trình đề xuất (để thảo luận)
1. **Sửa nhanh, rủi ro thấp**: redirect ch2, bug toán Ch2 q4/q5/q7/q8, explain 1 tiết q5, placeholder, làm tròn điểm, khoá bài sau khi chấm, reset không xoá cờ sao, escape HTML trong admin/index, validate redirect, xoá `__answerKey`.
2. **Chấm biểu thức tốt hơn**: bộ parse biểu thức nhỏ trong `js/evaluator.js`, so tương đương bằng thay nhiều giá trị x + kiểm tra dạng (đã nhân tử hoá / đã thu gọn). Kèm test Node cho evaluator + generators.
3. **Bảo mật thật**: chuyển học sinh sang Firebase Auth (email giả `username@moyumath.local` hoặc custom token), path theo `uid`, viết `firestore.rules` (học sinh chỉ ghi dữ liệu của mình, admin theo email/claim), hash/không lưu mật khẩu plaintext. Cần migrate dữ liệu cũ.
4. **Gộp code trùng**: `js/firebase.js` (config + helpers), `js/exam-shell.js` (timer/nộp/lưu), `js/practice-shell.js` (sao/giới hạn), CSS chung vào `css/style.css`; trang chỉ còn cấu hình (chapter, SOURCES, logic).
5. **Dashboard**: gắn `chapter` vào key thống kê, tách ảnh khỏi doc (Storage hoặc bỏ), dùng `limit()`/phân trang.

