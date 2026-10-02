/* "Đăng nhập" học sinh hiện chỉ là các key trong localStorage (xem PROBLEM.md mục A).
   Gom về một chỗ để khi chuyển sang Firebase Auth chỉ cần sửa file này. */
import { local, session } from './storage.js';

/* moyumath_stars / moyumath_cosmetics (sao, trang bị Tiệm Phép Thuật) của học sinh đang đăng nhập — phải xoá để người sau không thừa hưởng. */
const KEYS = ['moyumath_user', 'moyumath_displayName', 'moyumath_class', 'moyumath_stars', 'moyumath_cosmetics'];

export function currentStudent() {
  return {
    username: local.get('moyumath_user'),
    displayName: (local.get('moyumath_displayName') || '').trim(),
    className: local.get('moyumath_class'),
  };
}

export function logout() {
  for (const k of KEYS) local.remove(k);
  /* bài kiểm tra đang làm dở (sessionStorage moyumath_exam_<đề>) — người đăng nhập sau không được thấy/nộp hộ */
  try { Object.keys(window.sessionStorage).filter((k) => k.startsWith('moyumath_exam_')).forEach((k) => session.remove(k)); } catch { /* bỏ qua */ }
  window.location.href = 'login.html';
}
