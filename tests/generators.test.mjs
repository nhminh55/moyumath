/* Test đặc tả cho js/generators-ch1.js và js/generators-ch2.js: sinh nhiều đề ngẫu nhiên
   và kiểm tra đáp án được tính đúng với đề. Đây là lưới an toàn khi port sang curriculum/.
   Các test `todo` là lỗi toán đã biết (xem PROBLEM.md mục B). */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLegacy, repeat } from './helpers/load-legacy.mjs';

const N = 1000;
const W = loadLegacy('js/generators-ch1.js', 'js/generators-ch2.js');
const C1 = W.Chuong1Generators;
const C2 = W.Chuong2Generators;
const { gcdOf, factorize } = C1.helpers;

const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);
const productOf = (f) => Object.entries(f).reduce((p, [b, e]) => p * Number(b) ** e, 1);
const isPrime = (n) => n > 1 && Object.keys(factorize(n)).length === 1 && factorize(n)[n] === 1;

/* "3 × [(−4) − 5]" -> -27 : chuyển ký hiệu hiển thị sang JS để kiểm tra đáp án. */
function evalPrompt(s) {
  const js = s
    .replace(/−/g, '-').replace(/×/g, '*').replace(/÷/g, '/')
    .replace(/\[/g, '(').replace(/\]/g, ')')
    .replace(/√(\d+)/g, 'Math.sqrt($1)').replace(/²/g, '**2');
  return Function(`return (${js});`)();
}

test('tổng điểm mỗi đề = 10', () => {
  assert.equal(sum(C1.basic.maxPoints), 10);
  assert.equal(sum(C1.tiet.maxPoints), 10);
  const m = C2.basic.maxPoints; // exam-ch2.html dùng câu 1..6
  assert.equal(m[1] + m[2] + m[3] + m[4] + m[5] + m[6], 10);
});

test('mỗi câu có đủ gen + explain', () => {
  for (const lib of [C1.basic, C1.tiet, C2.basic]) {
    for (const k of Object.keys(lib.maxPoints)) {
      assert.equal(typeof lib.gen['q' + k], 'function', 'gen q' + k);
      assert.equal(typeof lib.explain['q' + k], 'function', 'explain q' + k);
    }
  }
});

test('explain chạy được trên mọi đề sinh ra', () => {
  for (const lib of [C1.basic, C1.tiet, C2.basic]) {
    for (const k of Object.keys(lib.maxPoints)) {
      repeat(100, () => {
        const html = lib.explain['q' + k](lib.gen['q' + k]());
        assert.equal(typeof html, 'string');
        assert.doesNotMatch(html, /undefined|NaN/, 'q' + k);
      });
    }
  }
});

/* ---------------- Chương 1 — 15 phút ---------------- */
test('ch1 15p q1: phân tích, ƯCLN, BCNN đúng', () => {
  repeat(N, () => {
    const d = C1.basic.gen.q1();
    assert.equal(productOf(d.f1), d.n1);
    assert.equal(productOf(d.f2), d.n2);
    assert.ok(Object.keys(d.f1).every((p) => isPrime(Number(p))));
    assert.equal(d.gcd, gcdOf(d.n1, d.n2));
    assert.equal(d.gcd * d.lcm, d.n1 * d.n2);
  });
});

test('ch1 15p q2: x² = k² có hai nghiệm ±k', () => {
  repeat(N, () => {
    const d = C1.basic.gen.q2();
    assert.deepEqual([...d.xTarget], [d.k, -d.k]);
  });
});

test('ch1 15p q3: quy tắc lũy thừa', () => {
  repeat(N, () => {
    const { c3 } = C1.basic.gen.q3();
    assert.equal(c3.ansA, c3.p1a + c3.p2a);
    assert.equal(c3.ansB, c3.p1b - c3.p2b);
    assert.ok(c3.ansB >= 2);
    assert.equal(c3.ansC, c3.p1c * c3.p2c);
    assert.equal(c3.ansD, c3.p1d - 1);
  });
});

test('ch1 15p q4: a² + √b × (c − d)', () => {
  repeat(N, () => {
    const { c4 } = C1.basic.gen.q4();
    assert.equal(c4.sqrtB ** 2, c4.b);
    assert.equal(c4.result, c4.a ** 2 + c4.sqrtB * (c4.c - c4.d));
  });
});

test('ch1 15p q5: 5 số, nhãn không trùng', () => {
  repeat(N, () => {
    const nums = C1.basic.gen.q5().numbers5;
    assert.equal(nums.length, 5);
    assert.equal(new Set(nums.map((n) => n.label)).size, 5);
  });
});

/* ---------------- Chương 1 — 1 tiết ---------------- */
test('ch1 1 tiết q1: phân tích n1, ước nguyên tố của n2', () => {
  repeat(N, () => {
    const d = C1.tiet.gen.q1();
    assert.notEqual(d.n1, d.n2);
    assert.equal(productOf(d.f1), d.n1);
    assert.ok(d.primes2.every((p) => isPrime(p) && d.n2 % p === 0));
  });
});

test('ch1 1 tiết q2: ƯCLN, BCNN', () => {
  repeat(N, () => {
    const d = C1.tiet.gen.q2();
    assert.equal(d.gcd, gcdOf(d.n1, d.n2));
    assert.equal(d.gcd * d.lcm, d.n1 * d.n2);
  });
});

test('ch1 1 tiết q3: nhân chia số nguyên', () => {
  repeat(N, () => {
    for (const it of C1.tiet.gen.q3().items) {
      assert.equal(it.op === '×' ? it.a * it.b : it.a / it.b, it.result);
    }
  });
});

test('ch1 1 tiết q4: đáp án khớp biểu thức hiển thị', () => {
  repeat(N, () => {
    for (const it of C1.tiet.gen.q4().items) {
      assert.equal(evalPrompt(it.prompt), it.result, it.prompt);
    }
  });
});

test('ch1 1 tiết q5: căn bậc hai, x³ = k', () => {
  repeat(N, () => {
    const d = C1.tiet.gen.q5();
    assert.equal(d.sqrtN ** 2, d.n);
    assert.equal(d.m ** 3, d.k);
  });
});

test('ch1 1 tiết q6: quy tắc lũy thừa', () => {
  repeat(N, () => {
    const d = C1.tiet.gen.q6();
    assert.equal(d.mul.ans, d.mul.m + d.mul.n);
    assert.equal(d.div.ans, d.div.m - d.div.n);
    assert.ok(d.div.ans >= 1);
    assert.equal(d.pow.ans, d.pow.m * d.pow.n);
  });
});

/* ---------------- Chương 2 ---------------- */
test('ch2 q1: giá trị biểu thức', () => {
  repeat(N, () => {
    const d = C2.basic.gen.q1();
    assert.equal(d.ans1, d.a1 * d.A - d.b1 * d.B);
    assert.equal(d.ans2, d.c * d.X ** 2 + d.d * d.X);
  });
});

test('ch2 q2/q6: nối — mỗi vế trái có đúng một vế phải', () => {
  repeat(N, () => {
    for (const d of [C2.basic.gen.q2(), C2.basic.gen.q6()]) {
      const L = [...d.left].map((x) => x.originalIndex).sort();
      const R = [...d.right].map((x) => x.originalIndex).sort();
      assert.deepEqual(L, [0, 1, 2, 3]);
      assert.deepEqual(R, [0, 1, 2, 3]);
    }
  });
});

test('ch2 q3: mỗi ý có ít nhất một đáp án chấp nhận', () => {
  repeat(N, () => {
    const d = C2.basic.gen.q3();
    assert.ok(d.a.ans.length >= 1 && d.b.ans.length >= 1);
  });
});

test('ch2 q4: phép nhân lại khớp đề', () => {
  repeat(N, () => {
    const d = C2.basic.gen.q4();
    assert.equal(d.a_factor * d.a1, d.a_term1);
    assert.equal(d.a_factor * d.b1, d.a_term2);
    assert.equal(d.c_factor * d.e3, d.c_term1);
    assert.equal(d.c_factor * d.f3, d.c_term2);
    assert.equal(d.c_factor * d.g3, d.c_term3);
  });
});

test('ch2 q4: nhân tử chung phải là ƯCLN', { todo: 'vd 4x + 8 nhưng đáp án chờ 2(2x + 4) — PROBLEM.md B' }, () => {
  repeat(N, () => {
    const d = C2.basic.gen.q4();
    assert.equal(d.a_factor, gcdOf(d.a_term1, d.a_term2));
    assert.equal(d.c_factor, gcdOf(gcdOf(d.c_term1, d.c_term2), d.c_term3));
  });
});

test('ch2 q5: khai triển đúng', () => {
  repeat(N, () => {
    const { a, b, c } = C2.basic.gen.q5();
    assert.equal(a.ans_x, a.a * a.b);
    assert.equal(a.ans_num, -a.a * a.c);
    assert.equal(b.ans_x, b.a * b.b + b.d * b.e);
    assert.equal(b.ans_num, b.a * b.c + b.d * b.f);
    assert.equal(c.ans_x, c.a * c.b - c.d * c.e);
    assert.equal(c.ans_num, c.a * c.c - c.d * c.f);
  });
});

test('ch2 q5/q7: hệ số hiển thị không bằng 0 hoặc ±1', { todo: 'đáp án chờ "0x+5", "1x^2" — PROBLEM.md B' }, () => {
  repeat(N, () => {
    const q5 = C2.basic.gen.q5();
    const q7 = C2.basic.gen.q7();
    for (const coef of [q5.c.ans_x, q7.ans_x2]) {
      assert.ok(![0, 1, -1].includes(coef), 'hệ số ' + coef);
    }
  });
});

test('ch2 q7: thu gọn đa thức', () => {
  repeat(N, () => {
    const d = C2.basic.gen.q7();
    assert.equal(d.ans_x3, d.a + d.d);
    assert.equal(d.ans_x2, d.b - d.e);
    assert.equal(d.ans_x, -d.c);
    assert.equal(d.ans_num, d.f);
  });
});

test('ch2 q8: chia hết cho k', () => {
  repeat(N, () => {
    const d = C2.basic.gen.q8();
    for (const [coef, ans] of [[d.a, d.ans_x2], [d.b, d.ans_x], [d.c, d.ans_num]]) {
      assert.ok(Number.isInteger(ans));
      assert.equal(ans * d.k, coef);
    }
  });
});

test('ch2 q9: Ax + B = C', () => {
  repeat(N, () => {
    const d = C2.basic.gen.q9();
    assert.equal(d.A * d.ans + d.B, d.C);
  });
});
