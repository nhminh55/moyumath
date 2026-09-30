import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* Thư mục gốc của repo. */
export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
