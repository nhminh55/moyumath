/* Chương 2 — đăng ký các dạng bài. Thứ tự trong `problems` là thứ tự "Dạng 1, 2, ..." trên trang luyện tập.
   Thêm dạng bài mới: tạo file trong thư mục này rồi thêm 1 dòng import + 1 phần tử vào `problems`. */
import matchStatements from './match-statements.js';
import writeExpression from './write-expression.js';
import evalExpression from './eval-expression.js';
import formulaTransform from './formula-transform.js';
import polySimplify from './poly-simplify.js';
import expand from './expand.js';
import polyDivide from './poly-divide.js';
import commonFactor from './common-factor.js';
import solveLinear from './solve-linear.js';
import equivalentExpressions from './equivalent-expressions.js';
import formulaWord from './formula-word.js';
import equationWord from './equation-word.js';
import inequality from './inequality.js';

export default {
  chapter: 2,
  title: 'Chương 2 — Biểu thức đại số',
  topics: [
    { id: '2.1', short: 'Lập BT', full: '2.1 Lập biểu thức' },
    { id: '2.2', short: 'Tính giá trị', full: '2.2 Tính giá trị & Công thức' },
    { id: '2.3', short: 'Đa thức 1 biến', full: '2.3 Đa thức một biến' },
    { id: '2.4', short: 'Nhân chia ĐT', full: '2.4 Nhân, chia đa thức' },
    { id: '2.5', short: 'Nhân tử & Tìm x', full: '2.5 Nhân tử & Tìm x' },
    { id: '2.6', short: 'Bất PT', full: '2.6 Bất phương trình' },
  ],
  problems: [
    matchStatements,
    writeExpression,
    evalExpression,
    formulaTransform,
    polySimplify,
    expand,
    polyDivide,
    commonFactor,
    solveLinear,
    /* Thêm cho đề cương ôn tập giữa kỳ I (đặt cuối để giữ số "Dạng" cũ). */
    equivalentExpressions,
    formulaWord,
    equationWord,
    inequality,
  ],
};
