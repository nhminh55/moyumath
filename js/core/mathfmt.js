/* Tiện ích số học và định dạng hiển thị dùng chung cho các module trong curriculum/.
   Thuần — không đụng DOM. Hiển thị dùng dấu trừ "−" và chỉ số trên (x², 2³);
   dạng "ascii" dùng "-" và "^" để so sánh với input của học sinh. */

const SUP = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '-': '⁻' };

export function sup(n) {
  return String(n).split('').map((d) => SUP[d] || d).join('');
}

/* -5 → "−5" (dấu trừ toán học để hiển thị). */
export function minus(n) {
  return n < 0 ? '−' + Math.abs(n) : String(n);
}

/* Số âm đặt trong ngoặc khi đứng sau phép tính: -5 → "(−5)". */
export function signStr(n) {
  return n < 0 ? '(' + minus(n) + ')' : String(n);
}

export function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

export function gcdAll(...xs) {
  return xs.reduce((g, x) => gcd(g, x), 0);
}

export function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}

/* 60 → { 2: 2, 3: 1, 5: 1 } */
export function factorize(n) {
  const map = {};
  let x = n;
  for (let d = 2; d * d <= x; d++) {
    while (x % d === 0) { map[d] = (map[d] || 0) + 1; x /= d; }
  }
  if (x > 1) map[x] = (map[x] || 0) + 1;
  return map;
}

export function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

const byNum = (a, b) => a - b;

/* { 2: 2, 3: 1 } → "2² × 3" (display) hoặc "2^2 x 3" (ascii). */
export function formatFactorization(f, { ascii = false } = {}) {
  return Object.keys(f).map(Number).sort(byNum)
    .map((p) => p + (f[p] > 1 ? (ascii ? '^' + f[p] : sup(f[p])) : ''))
    .join(ascii ? ' x ' : ' × ');
}

/* Các bước chia liên tiếp: 60 → ["60 ÷ 2 = 30", "30 ÷ 2 = 15", "15 ÷ 3 = 5", "5 là số nguyên tố"] */
export function divisionSteps(n) {
  const steps = [];
  let x = n;
  for (let d = 2; d * d <= x; d++) {
    while (x % d === 0) { steps.push(x + ' ÷ ' + d + ' = ' + x / d); x /= d; }
  }
  if (x > 1) steps.push(x + ' là số nguyên tố');
  return steps;
}

/* ƯCLN / BCNN dưới dạng tích lũy thừa, cho phần lời giải. */
export function gcdFactorization(f1, f2) {
  const common = {};
  for (const p of Object.keys(f1)) if (f2[p]) common[p] = Math.min(f1[p], f2[p]);
  return Object.keys(common).length ? formatFactorization(common) : '1';
}

export function lcmFactorization(f1, f2) {
  const merged = { ...f1 };
  for (const p of Object.keys(f2)) merged[p] = Math.max(merged[p] || 0, f2[p]);
  return formatFactorization(merged);
}

/* Đa thức một biến từ danh sách [hệ số, bậc]:
   formatPoly([[3,2],[-1,1],[5,0]]) → "3x² − x + 5";  { ascii: true } → "3x^2-x+5".
   Bỏ hạng tử hệ số 0, không viết hệ số ±1 trước biến, sắp theo bậc giảm dần. */
export function formatPoly(terms, { variable = 'x', ascii = false } = {}) {
  const parts = terms
    .filter(([c]) => c !== 0)
    .sort((a, b) => b[1] - a[1])
    .map(([c, deg]) => {
      const abs = Math.abs(c);
      const v = deg === 0 ? '' : variable + (deg === 1 ? '' : ascii ? '^' + deg : sup(deg));
      const coef = deg !== 0 && abs === 1 ? '' : String(abs);
      return { neg: c < 0, body: coef + v };
    });
  if (!parts.length) return '0';
  return parts.map((p, i) => {
    if (ascii) return (p.neg ? '-' : i ? '+' : '') + p.body;
    if (i === 0) return (p.neg ? '−' : '') + p.body;
    return (p.neg ? ' − ' : ' + ') + p.body;
  }).join('');
}
