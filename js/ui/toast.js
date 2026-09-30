/* Thông báo nhỏ ở đáy màn hình. Cần phần tử <div class="toast" id="toast"></div> trong trang. */
let timer = null;

export function showToast(message, { error = false, duration = 3000 } = {}) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className = 'toast show' + (error ? ' error' : '');
  clearTimeout(timer);
  timer = setTimeout(() => { el.className = 'toast'; }, duration);
}
