/* Chương 1 — đăng ký các dạng bài. Thứ tự trong `problems` là thứ tự "Dạng 1, 2, ..." trên trang
   luyện tập (các dạng có `practice: false` chỉ dùng trong đề kiểm tra, xếp cuối).
   Thêm dạng bài mới: tạo file trong thư mục này rồi thêm 1 dòng import + 1 phần tử vào `problems`. */
import primeFactorize from './prime-factorize.js';
import gcdLcm from './gcd-lcm.js';
import intMulDiv from './int-mul-div.js';
import orderOfOps from './order-of-ops.js';
import evalSqrtExpr from './eval-sqrt-expr.js';
import sqrtCbrt from './sqrt-cbrt.js';
import squareEq from './square-eq.js';
import powerRules from './power-rules.js';
import numberSets from './number-sets.js';
import gcdLcmPair from './gcd-lcm-pair.js';
import powerRulesMixed from './power-rules-mixed.js';
import numberSetsFraction from './number-sets-fraction.js';
import primeCheck from './prime-check.js';
import gcdWord from './gcd-word.js';
import powerEquation from './power-equation.js';
import mixedCalc from './mixed-calc.js';

export default {
  chapter: 1,
  title: 'Chương 1 — Số nguyên',
  /* Chủ đề = trục của biểu đồ radar ở index.html. */
  topics: [
    { id: '1.1', short: 'Ước & SNT', full: '1.1 Ước số, bội số và số nguyên tố' },
    { id: '1.2', short: 'Nhân, chia', full: '1.2 Phép nhân và phép chia hai số nguyên' },
    { id: '1.3', short: 'Căn bậc', full: '1.3 Căn bậc hai và căn bậc ba' },
    { id: '1.4', short: 'Số mũ', full: '1.4 Số mũ' },
  ],
  problems: [
    primeFactorize,
    gcdLcm,
    intMulDiv,
    orderOfOps,
    evalSqrtExpr,
    sqrtCbrt,
    squareEq,
    powerRules,
    numberSets,
    gcdLcmPair,
    powerRulesMixed,
    numberSetsFraction,
    /* Thêm cho đề cương ôn tập giữa kỳ I (đặt cuối để giữ số "Dạng" cũ). */
    primeCheck,
    gcdWord,
    powerEquation,
    mixedCalc,
  ],
};
