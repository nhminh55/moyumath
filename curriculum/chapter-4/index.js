/* Chương 4 — đăng ký các dạng bài. Thứ tự trong `problems` là thứ tự "Dạng 1, 2, ..." trên trang luyện tập.
   Hiện mới có bài 4.1 (phạm vi kiểm tra giữa kỳ I dừng ở bài này). */
import orderDecimals from './order-decimals.js';

export default {
  chapter: 4,
  title: 'Chương 4 — Số thập phân',
  topics: [
    { id: '4.1', short: 'Sắp xếp STP', full: '4.1 Sắp xếp các số thập phân' },
  ],
  problems: [
    orderDecimals,
  ],
};
