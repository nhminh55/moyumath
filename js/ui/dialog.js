/* Hộp thoại dùng chung (sao thưởng ở luyện tập, hộp thoại Tiệm Phép Thuật): mở thì đưa focus vào trong,
   Tab / Shift+Tab chỉ chạy trong hộp, Esc gọi onEscape(), đóng xong trả focus về chỗ đã mở
   (nút đó bị khoá/biến mất thì về `fallback`). Trả về hàm release() — gọi khi đóng hộp thoại. */
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const usable = (el) => el && el.isConnected && !el.disabled && el.getClientRects().length > 0;

export function holdFocus(box, onEscape, { fallback } = {}) {
  const opener = document.activeElement;
  const items = () => [...box.querySelectorAll(FOCUSABLE)].filter(usable);

  function onKey(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onEscape();
      return;
    }
    if (e.key !== 'Tab') return;
    const list = items();
    if (!list.length) { e.preventDefault(); return; }
    const first = list[0], last = list[list.length - 1], inside = box.contains(document.activeElement);
    if (e.shiftKey && (!inside || document.activeElement === first)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (!inside || document.activeElement === last)) { e.preventDefault(); first.focus(); }
  }

  document.addEventListener('keydown', onKey, true);
  if (!box.hasAttribute('tabindex')) box.tabIndex = -1;
  requestAnimationFrame(() => (items()[0] || box).focus({ preventScroll: true }));

  return function release() {
    document.removeEventListener('keydown', onKey, true);
    const back = usable(opener) && opener !== document.body ? opener : fallback;
    if (usable(back)) back.focus({ preventScroll: true });
  };
}
