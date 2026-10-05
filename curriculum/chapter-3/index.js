/* Chương 3 — đăng ký các dạng bài. Thứ tự trong `problems` là thứ tự "Dạng 1, 2, ..." trên trang luyện tập.
   Thêm dạng bài mới: tạo file trong thư mục này rồi thêm 1 dòng import + 1 phần tử vào `problems`. */
import mulDivTenths from './mul-div-tenths.js';
import sigFigs from './sig-figs.js';
import estimate from './estimate.js';
import formulaTenths from './formula-tenths.js';
import roundRectangle from './round-rectangle.js';
import roundError from './round-error.js';

export default {
  chapter: 3,
  title: 'Chương 3 — Giá trị theo hàng và làm tròn số',
  topics: [
    { id: '3.1', short: 'Nhân, chia 0,1', full: '3.1 Phép nhân và phép chia cho 0,1 và 0,01' },
    { id: '3.2', short: 'Làm tròn', full: '3.2 Làm tròn số' },
  ],
  problems: [
    mulDivTenths,
    formulaTenths,
    sigFigs,
    estimate,
    roundRectangle,
    roundError,
  ],
};
