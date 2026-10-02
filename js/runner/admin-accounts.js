/* Quy tắc tài khoản học sinh cho trang admin (thuần, không DOM/Firebase — test ở tests/admin-accounts.test.mjs).
   Dữ liệu học sinh nằm ở "Đã làm/{displayName}/…" nên tên hiển thị phải duy nhất, không chứa "/" và không được đổi. */

/* Email admin (Firebase Auth). Phải trùng danh sách isAdmin() trong firestore.rules. */
export const ADMIN_EMAILS = ['nhminh55@moyumath.github.io'];

export function isAdminEmail(email) {
  return ADMIN_EMAILS.includes(String(email || '').trim().toLowerCase());
}

export function normalizeUsername(raw) {
  return String(raw || '').trim().toLowerCase().replace(/\s+/g, '');
}

const nameKey = (s) => String(s || '').trim().toLocaleLowerCase('vi');

/* Lỗi (chuỗi tiếng Việt cho giáo viên) hoặc null nếu tạo được. `users` = [{ username, displayName }]. */
export function validateNewAccount({ username, displayName, password }, users = []) {
  const name = String(displayName || '').trim();
  if (!username || !name || !password) return 'Vui lòng điền đủ tên đăng nhập, tên hiển thị và mật khẩu.';
  if (!/^[a-z0-9_]+$/.test(username)) return 'Tên đăng nhập chỉ nên dùng chữ thường, số, gạch dưới (không dấu, không khoảng trắng).';
  if (name.includes('/')) return 'Tên hiển thị không được chứa dấu "/".';
  if (users.some((u) => u.username === username)) return 'Tên đăng nhập "' + username + '" đã tồn tại.';
  if (users.some((u) => nameKey(u.displayName) === nameKey(name))) {
    return 'Tên hiển thị "' + name + '" đã có học sinh khác dùng — dữ liệu hai bạn sẽ bị gộp. Hãy thêm họ hoặc số để phân biệt.';
  }
  return null;
}

/* Mật khẩu ngẫu nhiên dễ đọc cho học sinh (bỏ 0/O, 1/l/I). `random` = hàm [0,1) — mặc định crypto. */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';
export function generatePassword(length = 6, random = cryptoRandom) {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[Math.floor(random() * ALPHABET.length)];
  return out;
}
function cryptoRandom() {
  const a = new Uint32Array(1);
  globalThis.crypto.getRandomValues(a);
  return a[0] / 2 ** 32;
}

/* Các collection con của "Đã làm/{tên}" — xoá vĩnh viễn một học sinh phải dọn hết. */
export const STUDENT_SUBCOLLECTIONS = ['bài làm', 'luyện tập', 'giới hạn luyện tập', 'thời gian học', 'tiệm phép thuật'];
