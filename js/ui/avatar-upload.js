/* Ảnh đại diện tự tải lên: cắt giữa thành hình vuông, thu nhỏ còn SIZE×SIZE, nén JPEG → data URL nhỏ (~5–10 KB)
   để lưu thẳng vào doc kho của Tiệm Phép Thuật (js/runner/shop.js: photo) — không cần Firebase Storage. */
import { MAX_PHOTO_LENGTH, isPhotoDataUrl } from '../runner/shop.js';

const SIZE = 128;
const MAX_FILE_BYTES = 15 * 1024 * 1024;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
    img.src = url;
  });
}

/* File ảnh → data URL JPEG vuông. Lỗi ném ra Error có message 'type' | 'size' | 'decode'. */
export async function fileToAvatarPhoto(file) {
  if (!file || !/^image\//.test(file.type)) throw new Error('type');
  if (file.size > MAX_FILE_BYTES) throw new Error('size');
  const img = await loadImage(file);   // trình duyệt tự xoay theo EXIF (image-orientation: from-image)
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  if (!side) throw new Error('decode');
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';               // ảnh PNG trong suốt → nền trắng thay vì đen
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, SIZE, SIZE);
  for (const q of [0.85, 0.7, 0.5]) {
    const url = canvas.toDataURL('image/jpeg', q);
    if (url.length <= MAX_PHOTO_LENGTH && isPhotoDataUrl(url)) return url;
  }
  throw new Error('size');
}

/* Mở hộp chọn file (phải gọi trong lúc bé vừa bấm). → File hoặc null nếu bé huỷ. */
export function pickImageFile() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', () => resolve(input.files?.[0] || null), { once: true });
    input.addEventListener('cancel', () => resolve(null), { once: true });
    input.click();
  });
}
