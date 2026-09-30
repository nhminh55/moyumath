/* Test đặc tả cho js/evaluator.js — ghi lại hành vi HIỆN TẠI trước khi refactor.
   Các test đánh dấu `todo` là lỗi đã biết (xem PROBLEM.md), không làm fail bộ test. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadLegacy, plain } from './helpers/load-legacy.mjs';

const Ev = loadLegacy('js/evaluator.js').MathEvaluator;

test('num: chấp nhận dấu phẩy thập phân và dấu trừ Unicode', () => {
  assert.equal(Ev.num('3,5'), 3.5);
  assert.equal(Ev.num('3.5'), 3.5);
  assert.equal(Ev.num('−4'), -4);
  assert.equal(Ev.num('–4'), -4);
  assert.equal(Ev.num('  12 '), 12);
  assert.ok(Number.isNaN(Ev.num('')));
  assert.ok(Number.isNaN(Ev.num(null)));
});

test('num: từ chối chuỗi có ký tự thừa', { todo: 'parseFloat chấp nhận "12abc" = 12' }, () => {
  assert.ok(Number.isNaN(Ev.num('12abc')));
});

test('parseFactorization: các cách gõ lũy thừa và dấu nhân', () => {
  const target = { 2: 2, 3: 1, 5: 1 };
  for (const s of ['2^2 x 3 x 5', '2²×3·5', '2^2*3*5', '5 x 3 x 2^2', '2 x 2 x 3 x 5', '2^2 X 3 ⋅ 5']) {
    assert.deepEqual(plain(Ev.parseFactorization(s)), target, s);
    assert.ok(Ev.factorizationMatches(Ev.parseFactorization(s), target), s);
  }
});

test('factorizationMatches: sai thừa số hoặc thiếu thừa số bị từ chối', () => {
  const target = { 2: 2, 3: 1, 5: 1 };
  for (const s of ['4 x 3 x 5', '2^2 x 3', '2^2 x 3 x 5 x 7', '60', '']) {
    assert.equal(Ev.factorizationMatches(Ev.parseFactorization(s), target), false, s);
  }
});

test('parseNumberSet + sameNumberSet: nhiều đáp số, bỏ trùng', () => {
  assert.deepEqual(plain(Ev.parseNumberSet('8 ; −8')), [8, -8]);
  assert.deepEqual(plain(Ev.parseNumberSet('8, -8, 8')), [8, -8]);
  assert.ok(Ev.sameNumberSet(Ev.parseNumberSet('-8;8'), [8, -8]));
  assert.equal(Ev.sameNumberSet(Ev.parseNumberSet('8'), [8, -8]), false);
});

test('parseNumberSet: số thập phân dấu phẩy', { todo: '"2,5" bị tách thành 2 và 5' }, () => {
  assert.deepEqual(plain(Ev.parseNumberSet('2,5')), [2.5]);
});

test('sameIndexSet: không phụ thuộc thứ tự', () => {
  assert.ok(Ev.sameIndexSet([2, 0, 1], [0, 1, 2]));
  assert.equal(Ev.sameIndexSet([0, 1], [0, 1, 2]), false);
});

test('regionOf: tập nhỏ nhất chứa số', () => {
  assert.equal(Ev.regionOf(0), 'N');
  assert.equal(Ev.regionOf(7), 'N');
  assert.equal(Ev.regionOf(-3), 'Z');
  assert.equal(Ev.regionOf(2.5), 'Q');
  assert.equal(Ev.regionOf(-0.5), 'Q');
});
