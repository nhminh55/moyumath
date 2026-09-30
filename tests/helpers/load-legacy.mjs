/* Nạp các file IIFE cũ (gắn vào window.*) trong một sandbox vm để test bằng Node,
   không cần trình duyệt. Chỉ dùng cho file thuần (không đụng DOM khi nạp). */
import vm from 'node:vm';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export function loadLegacy(...files) {
  const window = {};
  const ctx = vm.createContext({ window });
  for (const f of files) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  }
  return window;
}

/* Object/Array tạo trong sandbox thuộc realm khác nên deepStrictEqual sẽ fail —
   chuyển về object thường trước khi so sánh. */
export const plain = (x) => JSON.parse(JSON.stringify(x));

export function repeat(n, fn) {
  for (let i = 0; i < n; i++) fn(i);
}
