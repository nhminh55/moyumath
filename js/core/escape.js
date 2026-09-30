/* Escape dữ liệu người dùng / Firestore trước khi chèn vào HTML. */
const MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => MAP[c]);
}

export const escapeAttr = escapeHtml;
