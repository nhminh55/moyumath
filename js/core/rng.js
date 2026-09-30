/* Bộ sinh số ngẫu nhiên có seed (mulberry32). Cùng seed → cùng đề, nên runner có thể
   lưu seed để khôi phục đề sau khi F5 hoặc để admin xem lại đúng đề học sinh đã làm. */

export function randomSeed() {
  return (Math.random() * 0x100000000) >>> 0;
}

export function createRng(seed = randomSeed()) {
  let s = seed >>> 0;
  function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  }
  function int(min, max) {
    return Math.floor(next() * (max - min + 1)) + min;
  }
  function pick(arr) {
    return arr[int(0, arr.length - 1)];
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = int(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  /* Số nguyên trong [min, max] khác mọi giá trị trong `exclude`. */
  function intExcept(min, max, exclude) {
    let v;
    do { v = int(min, max); } while (exclude.includes(v));
    return v;
  }
  return { seed, next, int, pick, shuffle, intExcept };
}
