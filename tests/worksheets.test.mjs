/* Dạng bài thêm theo phiếu học tập 3.1, 3.2, 4.1 (resources/Chương 3, Chương 4): kiểm tra đúng các ví dụ trong phiếu
   và các bất biến riêng (ngoài test chung ở curriculum.test.mjs). */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../js/core/rng.js';
import { totalEarned } from '../js/core/grading.js';
import { num, sameNumber } from '../js/core/evaluator.js';
import { getProblem } from '../js/runner/registry.js';

const SEEDS = 500;
function eachParams(id, fn) {
  const p = getProblem(id);
  for (let seed = 1; seed <= SEEDS; seed++) fn(p.generate({ rng: createRng(seed), difficulty: 'medium' }), p);
}

test('ch3.mul-div-tenths: có cả số nhỏ hơn 1 (0,55 : 0,1 ; 0,45 : 0,01)', () => {
  let below1 = 0;
  eachParams('ch3.mul-div-tenths', (params) => { below1 += params.items.filter((it) => it.m < 10 ** it.k).length; });
  assert.ok(below1 > SEEDS, 'số nhỏ hơn 1 phải xuất hiện thường xuyên');
  const p = getProblem('ch3.mul-div-tenths');
  const params = { items: [{ m: 55, k: 2, op: 2 }, { m: 45, k: 2, op: 3 }, { m: 5, k: 1, op: 1 }, { m: 3, k: 0, op: 2 }, { m: 53, k: 1, op: 0 }, { m: 444, k: 0, op: 1 }] };
  assert.deepEqual(Object.values(p.solve(params)), ['5,5', '45', '0,005', '30', '0,53', '4,44']);
});

test('ch3.formula-tenths: ví dụ trong phiếu (A = 12,5 m², h = 0,1 m → b = 250 m)', () => {
  const p = getProblem('ch3.formula-tenths');
  const params = { ctx: 'triB', given: { m: 125, k: 1 }, small: { m: 1, k: 1 }, order: [2, 0, 3, 1] };
  assert.deepEqual(p.solve(params), { f: '0', v: '250' });
  assert.equal(totalEarned(p.grade(params, { f: '1', v: '250' })), 0.5);
  assert.equal(totalEarned(p.grade(params, { f: '0', v: '125' })), 0.5);
  /* Chia cho 0,01 = nhân 100; kết quả có thể là số thập phân. */
  assert.equal(p.solve({ ctx: 'rect', given: { m: 435, k: 3 }, small: { m: 1, k: 2 }, order: [0, 1, 2, 3] }).v, '43,5');
  assert.equal(p.solve({ ctx: 'move', given: { m: 35, k: 1 }, small: { m: 1, k: 1 }, order: [0, 1, 2, 3] }).v, '35');
});

test('ch3.formula-tenths: đáp án = factor · big : small', () => {
  eachParams('ch3.formula-tenths', (params, p) => {
    const factor = params.ctx.startsWith('tri') ? 2 : 1;
    const v = (factor * params.given.m / 10 ** params.given.k) / (1 / 10 ** params.small.k);
    assert.ok(sameNumber(num(p.solve(params).v), v, 1e-6), p.solve(params).v + ' vs ' + v);
  });
});

test('ch3.round-rectangle: ví dụ trong phiếu (9,6 m × 0,87 m)', () => {
  const p = getProblem('ch3.round-rectangle');
  assert.deepEqual(p.solve({ w: { M: 87, e: -2 }, l: { M: 96, e: -1 } }), { l: '10', w: '0,9', p: '21,8', s: '9' });
  assert.deepEqual(p.solve({ w: { M: 95, e: -2 }, l: { M: 341, e: -1 } }), { l: '30', w: '1', p: '62', s: '30' });
});

test('ch3.round-error: ví dụ trong phiếu (0,890 ≈ 0,8 → 0,9) và lời giải sai luôn khác đáp án đúng', () => {
  const p = getProblem('ch3.round-error');
  const params = { items: [{ kind: 'trunc', M: 89, e: -2, n: 1, wrong: { q: 8, e2: -1 } }, { kind: 'place', M: 45678, e: 0, n: 2, wrong: { q: 46, e2: 0 } }] };
  assert.deepEqual(p.solve(params), { k0: 'trunc', c0: '0,9', k1: 'place', c1: '46 000' });
  eachParams('ch3.round-error', (params) => {
    const sol = p.solve(params);
    params.items.forEach((it, i) => {
      const wrongValue = Number(String(it.wrong.q * 10 ** Math.max(it.wrong.e2, 0) / 10 ** Math.max(-it.wrong.e2, 0)));
      assert.ok(!sameNumber(num(sol['c' + i]), wrongValue, 1e-9), 'lời giải sai trùng đáp án: ' + JSON.stringify(it));
      assert.equal(String(Math.abs(num(sol['c' + i]))).replace(/[^1-9]/g, '').length <= it.n, true, 'quá nhiều cscn: ' + sol['c' + i]);
    });
    assert.notEqual(params.items[0].kind, params.items[1].kind);
  });
});

test('ch4.integers-between: ví dụ trong phiếu (−3,55 < x < 3,55) và cận nguyên', () => {
  const p = getProblem('ch4.integers-between');
  const params = {
    ranges: [
      { lo: -355, hi: 355, loIn: false, hiIn: false },
      { lo: -200, hi: 170, loIn: true, hiIn: false },
    ],
  };
  assert.deepEqual(p.solve(params), { x0: '-3 ; -2 ; -1 ; 0 ; 1 ; 2 ; 3', x1: '-2 ; -1 ; 0 ; 1' });
  assert.equal(totalEarned(p.grade(params, { x0: '−3; −2; −1; 0; 1; 2; 3', x1: '-1 ; 0 ; 1' })), 0.5);
  assert.equal(p.solve({ ranges: [params.ranges[0], { lo: -250, hi: 1 * 100, loIn: false, hiIn: false }] }).x1, '-2 ; -1 ; 0');
  eachParams('ch4.integers-between', (params, q) => {
    const sol = q.solve(params);
    params.ranges.forEach((r, i) => {
      const xs = sol['x' + i].split(' ; ').map(Number);
      assert.ok(xs.length >= 1 && xs.length <= 11, sol['x' + i]);
      for (const x of xs) {
        assert.ok(r.loIn ? x * 100 >= r.lo : x * 100 > r.lo);
        assert.ok(r.hiIn ? x * 100 <= r.hi : x * 100 < r.hi);
      }
    });
  });
});
