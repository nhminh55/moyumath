/* Ngăn kéo điều hướng trên điện thoại (khung css/app-shell.css): nút ☰ #navToggle mở/đóng #sidebar,
   bấm nền mờ #navBackdrop, phím Esc hoặc một liên kết "#…" trong thanh thì đóng. Tự gắn khi được nạp. */
const $ = (id) => document.getElementById(id);

function setOpen(on) {
  const was = document.body.classList.contains('nav-open');
  document.body.classList.toggle('nav-open', on);
  $('navToggle')?.setAttribute('aria-expanded', String(on));
  if ($('navBackdrop')) $('navBackdrop').hidden = !on;
  /* mở: đưa focus vào ngăn kéo; đóng khi focus đang ở trong: trả về nút ☰ */
  if (on && !was) setTimeout(() => $('sidebar').querySelector('a[href], button')?.focus(), 60); // chờ visibility của hiệu ứng trượt
  if (!on && was && $('sidebar').contains(document.activeElement)) $('navToggle')?.focus();
}

if ($('navToggle') && $('sidebar')) {
  $('navToggle').addEventListener('click', () => setOpen(!document.body.classList.contains('nav-open')));
  $('navBackdrop')?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  $('sidebar').querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', () => setOpen(false)));
}
