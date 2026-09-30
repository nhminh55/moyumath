/* "Đăng nhập" học sinh hiện chỉ là các key trong localStorage (xem PROBLEM.md mục A).
   Gom về một chỗ để khi chuyển sang Firebase Auth chỉ cần sửa file này. */
import { local } from './storage.js';

const KEYS = ['moyumath_user', 'moyumath_displayName', 'moyumath_class'];

export function currentStudent() {
  return {
    username: local.get('moyumath_user'),
    displayName: (local.get('moyumath_displayName') || '').trim(),
    className: local.get('moyumath_class'),
  };
}

export function logout() {
  for (const k of KEYS) local.remove(k);
  window.location.href = 'login.html';
}
