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
  title: 'Chương 2 — Biểu thức, công thức và phương trình',
  topics: [
    { id: '2.1', short: 'Lập BT', full: '2.1 Lập biểu thức' },
    { id: '2.2', short: 'BT & Công thức', full: '2.2 Sử dụng các biểu thức và công thức' },
    { id: '2.3', short: 'Khai triển', full: '2.3 Khai triển biểu thức có chứa dấu ngoặc' },
    { id: '2.4', short: 'Nhân tử', full: '2.4 Phân tích biểu thức thành nhân tử' },
    { id: '2.5', short: 'Phương trình', full: '2.5 Lập và giải phương trình' },
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
