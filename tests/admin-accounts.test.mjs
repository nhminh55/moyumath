/* Test cho js/runner/admin-accounts.js (quy tắc tài khoản học sinh ở trang admin). */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ADMIN_EMAILS, isAdminEmail, normalizeUsername, validateNewAccount, generatePassword,
} from '../js/runner/admin-accounts.js';
import { readFileSync } from 'node:fs';

const users = [{ username: 'mochi', displayName: 'Mochi' }, { username: 'an', displayName: 'Nguyễn An' }];
const ok = { username: 'binh', displayName: 'Bình', password: 'abc' };

test('isAdminEmail: chỉ email trong danh sách, không phân biệt hoa thường', () => {
  assert.ok(isAdminEmail('nhminh55@moyumath.github.io'));
  assert.ok(isAdminEmail(' NHMINH55@moyumath.github.io '));
  assert.ok(!isAdminEmail('someone@moyumath.github.io'));
  assert.ok(!isAdminEmail(null));
});

test('ADMIN_EMAILS trùng danh sách trong firestore.rules', () => {
  const rules = readFileSync(new URL('../firestore.rules', import.meta.url), 'utf8');
  for (const e of ADMIN_EMAILS) assert.ok(rules.includes("'" + e + "'"), e);
});

test('normalizeUsername', () => {
  assert.equal(normalizeUsername('  Mo Chi '), 'mochi');
  assert.equal(normalizeUsername(undefined), '');
});

test('validateNewAccount: hợp lệ', () => {
  assert.equal(validateNewAccount(ok, users), null);
});

test('validateNewAccount: thiếu trường, sai định dạng, dấu /', () => {
  assert.match(validateNewAccount({ ...ok, password: '' }, users), /điền đủ/);
  assert.match(validateNewAccount({ ...ok, username: 'bình' }, users), /chữ thường/);
  assert.match(validateNewAccount({ ...ok, displayName: 'A/B' }, users), /"\/"/);
});

test('validateNewAccount: trùng tên đăng nhập hoặc tên hiển thị (không phân biệt hoa thường, khoảng trắng)', () => {
  assert.match(validateNewAccount({ ...ok, username: 'mochi' }, users), /đã tồn tại/);
  assert.match(validateNewAccount({ ...ok, displayName: '  mochi ' }, users), /gộp/);
  assert.match(validateNewAccount({ ...ok, displayName: 'NGUYỄN AN' }, users), /gộp/);
});

test('generatePassword: độ dài, bảng chữ dễ đọc', () => {
  for (let i = 0; i < 200; i++) {
    const p = generatePassword();
    assert.equal(p.length, 6);
    assert.match(p, /^[a-hjkmnp-z2-9]+$/);
  }
  assert.equal(generatePassword(4, () => 0), 'aaaa');
  assert.equal(generatePassword(3, () => 0.9999), '999');
});
