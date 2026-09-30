/* Chuẩn hoá & so sánh input toán học của học sinh (thay cho js/evaluator.js cũ).
   Thuần — chỉ nhận string và trả về giá trị/kết quả so sánh, không đụng DOM.
   Khác bản cũ:
   - num() từ chối chuỗi có ký tự thừa ("12abc" → NaN).
   - parseNumberSet() hiểu "2,5" là số thập phân; phân tách bằng ";" hoặc ", " hoặc khoảng trắng.
   - Thêm parseExpr/equivalent (so biểu thức theo giá trị) và parsePolynomial (dạng đã thu gọn). */

const SUP_TO_CHAR = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
const SUP_RUN = /[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g;
/* U+2212 (dấu trừ toán học), en dash, em dash — bàn phím điện thoại hay chèn thay cho "-". */
const MINUS_VARIANTS = /[−–—]/g;
/* Ký hiệu nhân trong phân tích thừa số (ở đây "x" là dấu nhân, không phải biến). */
const FACTOR_MULT = /[x×X*·⋅]/g;

export function normalizeMinus(str) {
  return String(str).replace(MINUS_VARIANTS, '-');
}

function supToCaret(str) {
  return str.replace(SUP_RUN, (m) => '^' + m.split('').map((c) => SUP_TO_CHAR[c]).join(''));
}

const NUM_RE = /^[+-]?(\d+([.,]\d+)?|[.,]\d+)$/;

/* "3,5" / "3.5" / "−4" → số; chuỗi không phải một số hợp lệ → NaN. */
export function num(str) {
  if (str === null || str === undefined) return NaN;
  const s = normalizeMinus(str).replace(/\s+/g, '');
  if (!NUM_RE.test(s)) return NaN;
  return parseFloat(s.replace(',', '.'));
}

export function sameNumber(a, b, eps = 1e-9) {
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < eps;
}

/* "2^2 x 3 x 5", "2² × 3 · 5", "5*3*2^2" → { 2: 2, 3: 1, 5: 1 }; sai cú pháp → null. */
export function parseFactorization(str) {
  if (!str) return null;
  const s = supToCaret(normalizeMinus(str).replace(/\s+/g, ''));
  const tokens = s.replace(FACTOR_MULT, ' ').split(' ').filter(Boolean);
  if (!tokens.length) return null;
  const map = {};
  for (const t of tokens) {
    const m = /^(\d+)(?:\^(\d+))?$/.exec(t);
    if (!m) return null;
    const base = Number(m[1]);
    map[base] = (map[base] || 0) + (m[2] ? Number(m[2]) : 1);
  }
  return map;
}

export function factorizationMatches(map, target) {
  if (!map) return false;
  const keys1 = Object.keys(map).filter((k) => map[k] !== 0);
  const keys2 = Object.keys(target);
  return keys1.length === keys2.length && keys2.every((k) => map[k] === target[k]);
}

/* "8 ; −8", "x = 8 hoặc x = -8", "2, 3, 5", "2,5" (= 2.5) → mảng số không trùng. */
export function parseNumberSet(str) {
  if (!str) return [];
  const s = normalizeMinus(str)
    .replace(/[^\d.,;+\-\s]/g, ' ')
    .replace(/;/g, ' ')
    .replace(/,(?=\s|[+-]|$)/g, ' ');
  const out = [];
  for (const tok of s.split(/\s+/).filter(Boolean)) {
    const v = num(tok);
    if (Number.isNaN(v)) return [NaN];
    if (!out.includes(v)) out.push(v);
  }
  return out;
}

export function sameNumberSet(a, b, eps = 1e-9) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => sameNumber(v, sb[i], eps));
}

export function sameIndexSet(a, b) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

/* Tập nhỏ nhất chứa số: N, Z hay Q. */
export function regionOf(v) {
  if (Number.isInteger(v) && v >= 0) return 'N';
  if (Number.isInteger(v)) return 'Z';
  return 'Q';
}

/* ---------------- Biểu thức đại số ----------------
   Cú pháp: số, biến một chữ cái (x, y, m...), + - * / ^, ngoặc (), [] ; nhân ngầm "2x", "3(x+1)",
   "(x+1)(x-1)", "xy". Ở đây "x" luôn là biến; dấu nhân viết bằng * × · ⋅. "÷" và ":" là chia. */

function normalizeExpr(str) {
  return supToCaret(normalizeMinus(String(str)))
    .toLowerCase()
    .replace(/[×·⋅]/g, '*')
    .replace(/[÷:]/g, '/')
    .replace(/[[{]/g, '(').replace(/[\]}]/g, ')')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/\s+/g, '');
}

function tokenize(s) {
  const tokens = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (m) { tokens.push({ t: 'num', v: parseFloat(m[0]) }); i += m[0].length; continue; }
    if (/[a-z]/.test(c)) { tokens.push({ t: 'var', v: c }); i++; continue; }
    if ('+-*/^()'.includes(c)) { tokens.push({ t: c }); i++; continue; }
    return null;
  }
  return tokens;
}

/* Trả về AST hoặc null nếu sai cú pháp. */
export function parseExpr(str) {
  if (str === null || str === undefined || !String(str).trim()) return null;
  const tokens = tokenize(normalizeExpr(str));
  if (!tokens) return null;
  let pos = 0;
  const peek = () => tokens[pos];
  const eat = (t) => (peek() && peek().t === t ? tokens[pos++] : null);

  function expr() {
    let node = term();
    while (node && peek() && (peek().t === '+' || peek().t === '-')) {
      const op = tokens[pos++].t;
      const rhs = term();
      if (!rhs) return null;
      node = { t: 'bin', op, a: node, b: rhs };
    }
    return node;
  }
  function term() {
    let node = unary();
    while (node && peek()) {
      const t = peek().t;
      if (t === '*' || t === '/') {
        pos++;
        const rhs = unary();
        if (!rhs) return null;
        node = { t: 'bin', op: t, a: node, b: rhs };
      } else if (t === 'num' || t === 'var' || t === '(') {
        const rhs = power();
        if (!rhs) return null;
        node = { t: 'bin', op: '*', a: node, b: rhs };
      } else break;
    }
    return node;
  }
  function unary() {
    if (eat('-')) { const a = unary(); return a && { t: 'neg', a }; }
    if (eat('+')) return unary();
    return power();
  }
  function power() {
    const base = atom();
    if (base && eat('^')) {
      const e = unary();
      return e && { t: 'bin', op: '^', a: base, b: e };
    }
    return base;
  }
  function atom() {
    const tok = peek();
    if (!tok) return null;
    if (tok.t === 'num') { pos++; return { t: 'num', v: tok.v }; }
    if (tok.t === 'var') { pos++; return { t: 'var', v: tok.v }; }
    if (eat('(')) {
      const e = expr();
      return e && eat(')') ? e : null;
    }
    return null;
  }

  const ast = expr();
  return ast && pos === tokens.length ? ast : null;
}

export function evalExpr(ast, env) {
  switch (ast.t) {
    case 'num': return ast.v;
    case 'var': return ast.v in env ? env[ast.v] : NaN;
    case 'neg': return -evalExpr(ast.a, env);
    default: {
      const a = evalExpr(ast.a, env), b = evalExpr(ast.b, env);
      if (ast.op === '+') return a + b;
      if (ast.op === '-') return a - b;
      if (ast.op === '*') return a * b;
      if (ast.op === '/') return a / b;
      return Math.pow(a, b);
    }
  }
}

function varsOf(ast, out = new Set()) {
  if (ast.t === 'var') out.add(ast.v);
  if (ast.a) varsOf(ast.a, out);
  if (ast.b) varsOf(ast.b, out);
  return out;
}

const SAMPLE_POINTS = [1.37, -2.71, 0.53, 3.19, -0.87, 5.41, 7.93];

/* Hai biểu thức bằng nhau với mọi giá trị biến? (thử tại nhiều điểm).
   `input` là chuỗi học sinh gõ, `expected` là chuỗi đáp án. Biến lạ (không có trong đáp án) → sai. */
export function equivalent(input, expected) {
  const a = parseExpr(input), b = parseExpr(expected);
  if (!a || !b) return false;
  const vb = varsOf(b);
  for (const v of varsOf(a)) if (!vb.has(v)) return false;
  const names = [...vb];
  let checked = 0;
  for (let i = 0; i < SAMPLE_POINTS.length; i++) {
    const env = {};
    names.forEach((n, j) => { env[n] = SAMPLE_POINTS[(i + j * 3) % SAMPLE_POINTS.length]; });
    const va = evalExpr(a, env), vbv = evalExpr(b, env);
    if (!Number.isFinite(vbv)) continue;
    if (!Number.isFinite(va)) return false;
    if (Math.abs(va - vbv) > 1e-9 * Math.max(1, Math.abs(vbv))) return false;
    checked++;
  }
  return checked >= 3;
}

/* Học sinh viết đúng dạng "nhân tử × (…)" hoặc "(…) × nhân tử"? `factor` dạng ascii, vd "3x". */
export function isFactoredBy(input, factor) {
  const s = normalizeExpr(input).replace(/\*/g, '');
  const f = normalizeExpr(factor).replace(/\*/g, '');
  const inner = s.startsWith(f + '(') && s.endsWith(')') ? s.slice(f.length + 1, -1)
    : s.startsWith('(') && s.endsWith(')' + f) ? s.slice(1, -(f.length + 1))
    : null;
  return inner !== null && parseExpr(inner) !== null;
}

/* Đa thức một biến ở dạng tổng các đơn thức, không ngoặc: "3x^2 - x + 5", "5 - x + 3x²".
   → { terms: { 2: 3, 1: -1, 0: 5 }, collected } ; collected=false nếu có hai hạng tử cùng bậc.
   Sai dạng → null. */
export function parsePolynomial(str, variable = 'x') {
  if (!str) return null;
  const s = normalizeExpr(str);
  if (!s || /[()]/.test(s)) return null;
  const re = new RegExp('^([+-]?)(\\d+(?:\\.\\d+)?)?\\*?(' + variable + '(?:\\^(\\d+))?)?');
  const terms = {};
  let collected = true;
  let rest = s;
  let first = true;
  while (rest.length) {
    const m = re.exec(rest);
    if (!m || m[0] === '' || (!m[2] && !m[3]) || (!first && !m[1])) return null;
    const coef = (m[1] === '-' ? -1 : 1) * (m[2] ? parseFloat(m[2]) : 1);
    const deg = m[3] ? (m[4] ? Number(m[4]) : 1) : 0;
    if (deg in terms) collected = false;
    terms[deg] = (terms[deg] || 0) + coef;
    rest = rest.slice(m[0].length);
    first = false;
  }
  for (const d of Object.keys(terms)) if (terms[d] === 0) delete terms[d];
  return { terms, collected };
}

/* Input là đa thức đã thu gọn và bằng đa thức mong đợi. `expected`: [[hệ số, bậc], ...] */
export function polynomialMatches(input, expected, variable = 'x') {
  const p = parsePolynomial(input, variable);
  if (!p || !p.collected) return false;
  const want = {};
  for (const [c, d] of expected) if (c !== 0) want[d] = (want[d] || 0) + c;
  const k1 = Object.keys(p.terms), k2 = Object.keys(want);
  return k1.length === k2.length && k2.every((d) => sameNumber(p.terms[d], want[d]));
}
