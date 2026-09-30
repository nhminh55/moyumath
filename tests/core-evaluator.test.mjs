/* Test cho js/core/evaluator.js (bản ES module dùng bởi curriculum/). */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  num, parseNumberSet, sameNumberSet, parseFactorization, factorizationMatches,
  parseExpr, equivalent, isFactoredBy, parsePolynomial, polynomialMatches,
} from '../js/core/evaluator.js';
import { formatPoly } from '../js/core/mathfmt.js';

test('num: chặt chẽ', () => {
  assert.equal(num('3,5'), 3.5);
  assert.equal(num('− 4'), -4);
  assert.equal(num('+7'), 7);
  for (const bad of ['12abc', '1.2.3', '', '  ', 'x', '5-', null, undefined]) assert.ok(Number.isNaN(num(bad)), String(bad));
});

test('parseNumberSet: dấu phẩy thập phân và các cách phân tách', () => {
  assert.deepEqual(parseNumberSet('2,5'), [2.5]);
  assert.deepEqual(parseNumberSet('8 ; −8'), [8, -8]);
  assert.deepEqual(parseNumberSet('8, -8'), [8, -8]);
  assert.deepEqual(parseNumberSet('8,-8'), [8, -8]);
  assert.deepEqual(parseNumberSet('x = 8 hoặc x = -8'), [8, -8]);
  assert.deepEqual(parseNumberSet('2, 3, 5'), [2, 3, 5]);
  assert.deepEqual(parseNumberSet('2 3 5 3'), [2, 3, 5]);
  assert.ok(sameNumberSet(parseNumberSet('-5;5'), [5, -5]));
});

test('parseFactorization: sai cú pháp → null', () => {
  assert.equal(parseFactorization('2^2 x 3a'), null);
  assert.equal(parseFactorization(''), null);
  assert.ok(factorizationMatches(parseFactorization('2²·3·5'), { 2: 2, 3: 1, 5: 1 }));
  assert.equal(factorizationMatches(null, { 2: 1 }), false);
});

test('parseExpr: cú pháp hợp lệ / không hợp lệ', () => {
  for (const ok of ['x/3+5', '2(x-3)', '(x+2)^2', '(x+2)(x+2)', '-x^2', '3xy', '1/3x + 5', '2·x', '[x + 1] : 2', 'x²+1']) {
    assert.ok(parseExpr(ok), ok);
  }
  for (const bad of ['', '2(', 'x++', '(x+1', '3 $ x', ')x(']) assert.equal(parseExpr(bad), null, bad);
});

test('equivalent: chấp nhận mọi cách viết tương đương', () => {
  assert.ok(equivalent('5 + x/3', 'x/3 + 5'));
  assert.ok(equivalent('1/3x + 5', 'x/3 + 5'));
  assert.ok(equivalent('x : 3 + 5', 'x/3 + 5'));
  assert.ok(equivalent('-2 + 3x', '3x - 2'));
  assert.ok(equivalent('(x−4)·3', '3(x - 4)'));
  assert.ok(equivalent('3x - 12', '3(x - 4)'));
  assert.ok(equivalent('(x+2)(x+2)', '(x + 2)^2'));
  assert.ok(equivalent('x² + 4x + 4', '(x + 2)^2'));
  assert.ok(equivalent('2x + 3y - 4', '2x + 3y - 4'));
});

test('equivalent: từ chối biểu thức sai hoặc biến lạ', () => {
  assert.equal(equivalent('x/3 + 6', 'x/3 + 5'), false);
  assert.equal(equivalent('(x+5)/3', 'x/3 + 5'), false);
  assert.equal(equivalent('3x(x - 4)', '3(x - 4)'), false);
  assert.equal(equivalent('y/3 + 5', 'x/3 + 5'), false);
  assert.equal(equivalent('', 'x'), false);
});

test('isFactoredBy: đúng dạng nhân tử chung', () => {
  assert.ok(isFactoredBy('4(x + 2)', '4'));
  assert.ok(isFactoredBy('(2 + x)4', '4'));
  assert.ok(isFactoredBy('3x(1 + 2x)', '3x'));
  assert.ok(isFactoredBy('3·x(2x+1)', '3x'));
  assert.equal(isFactoredBy('2(2x + 4)', '4'), false);
  assert.equal(isFactoredBy('4x + 8', '4'), false);
  assert.equal(isFactoredBy('4(x+1)+(4)', '4'), false);
});

test('parsePolynomial / polynomialMatches', () => {
  assert.deepEqual(parsePolynomial('3x^2 - x + 5'), { terms: { 2: 3, 1: -1, 0: 5 }, collected: true });
  assert.deepEqual(parsePolynomial('5 − x + 3x²').terms, { 2: 3, 1: -1, 0: 5 });
  assert.equal(parsePolynomial('3x + 2x').collected, false);
  assert.equal(parsePolynomial('3(x+1)'), null);
  assert.equal(parsePolynomial('3x5'), null);
  const want = [[3, 2], [-1, 1], [5, 0]];
  for (const s of ['3x^2-x+5', '5 - x + 3x²', '3x^2 - 1x + 5', '3*x^2 - x + 5']) assert.ok(polynomialMatches(s, want), s);
  for (const s of ['3x^2+x+5', '3x^2-x', '3x^2 - x + 2 + 3', '3(x^2) - x + 5']) assert.equal(polynomialMatches(s, want), false, s);
});

test('formatPoly: bỏ hệ số 0 và ±1', () => {
  assert.equal(formatPoly([[3, 2], [-1, 1], [5, 0]]), '3x² − x + 5');
  assert.equal(formatPoly([[1, 3], [0, 2], [-4, 0]]), 'x³ − 4');
  assert.equal(formatPoly([[-1, 1], [6, 0]], { ascii: true }), '-x+6');
  assert.equal(formatPoly([[0, 1], [0, 0]]), '0');
});
