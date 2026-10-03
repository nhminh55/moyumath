/* Giờ chơi trò chơi (thẻ "Trò chơi" của Tiệm Phép Thuật) — thuần, test được bằng Node.
   Mỗi 15 phút học trong ngày (luyện tập + kiểm tra, js/runner/study-time.js) mở 15 phút chơi các trò đã mua;
   mỗi lượt chơi tối đa 15 phút. Giờ chơi tính theo ngày, không cộng dồn sang hôm sau.
   Số giây đã chơi: field playSec (increment) trong doc "Đã làm/{tên}/thời gian học/{YYYY-MM-DD}".
   Riêng lần đầu sau khi mua: mỗi trò có FREE_TRIAL_SEC chơi thử miễn phí (trialSec trong kho, js/runner/shop.js). */

export const PLAY_BLOCK_SEC = 15 * 60;   // học đủ mỗi 15 phút → thêm 15 phút chơi
export const SESSION_MAX_SEC = 15 * 60;  // một lượt chơi tối đa 15 phút
export const MIN_START_SEC = 30;         // còn ít hơn 30 giây thì không mở lượt mới
export const FREE_TRIAL_SEC = 15 * 60;   // mỗi trò vừa mua được chơi thử 15 phút không cần học trước (không trừ giờ chơi trong ngày)

export function playEarnedSec(studySec) {
  return Math.floor(Math.max(0, studySec) / PLAY_BLOCK_SEC) * PLAY_BLOCK_SEC;
}

export function playLeftSec(studySec, playedSec) {
  return Math.max(0, playEarnedSec(studySec) - Math.max(0, playedSec || 0));
}

/* Độ dài lượt chơi mới (0 = chưa được chơi). */
export function sessionSec(leftSec) {
  return leftSec >= MIN_START_SEC ? Math.min(SESSION_MAX_SEC, Math.floor(leftSec)) : 0;
}

/* Còn phải học bao nhiêu giây nữa để mở thêm một khối giờ chơi. */
export function studyToNextBlockSec(studySec) {
  return PLAY_BLOCK_SEC - (Math.floor(Math.max(0, studySec)) % PLAY_BLOCK_SEC);
}
