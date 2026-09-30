/* Lập phương trình từ bài toán rồi giải (Đề cương giữa kỳ I — Câu 11, 12):
   a) "nghĩ một số, nhân/chia/cộng/trừ… được kết quả c";  b) hình chữ nhật có các cạnh đối bằng nhau → tìm x, y. */
import { num, sameNumber, parseExpr, evalExpr } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

const NAMES = ['An', 'Huy', 'Minh', 'Lan', 'Mai', 'Nam'];

/* Mỗi dạng: lời văn, phương trình (hiển thị + ascii hai vế), các bước giải. */
const VARIANTS = {
  mulAdd: {
    make: (rng) => { const a = rng.int(2, 9), b = rng.int(2, 20), x = rng.int(2, 15); return { a, b, x, c: a * x + b }; },
    text: (v) => 'nhân số đó với ' + v.a + ' rồi cộng thêm ' + v.b,
    eq: (v) => v.a + 'x + ' + v.b + ' = ' + v.c, ascii: (v) => [v.a + 'x+' + v.b, String(v.c)],
    steps: (v) => [v.a + 'x = ' + v.c + ' − ' + v.b + ' = ' + (v.c - v.b), 'x = ' + (v.c - v.b) + ' : ' + v.a + ' = ' + v.x],
  },
  mulSub: {
    make: (rng) => { const a = rng.int(2, 9), x = rng.int(3, 15), b = rng.int(1, a * x - 1); return { a, b, x, c: a * x - b }; },
    text: (v) => 'nhân số đó với ' + v.a + ' rồi trừ đi ' + v.b,
    eq: (v) => v.a + 'x − ' + v.b + ' = ' + v.c, ascii: (v) => [v.a + 'x-' + v.b, String(v.c)],
    steps: (v) => [v.a + 'x = ' + v.c + ' + ' + v.b + ' = ' + (v.c + v.b), 'x = ' + (v.c + v.b) + ' : ' + v.a + ' = ' + v.x],
  },
  divSub: {
    make: (rng) => { const a = rng.int(2, 6), b = rng.int(2, 9), t = rng.int(b + 1, b + 12); return { a, b, x: a * t, c: t - b }; },
    text: (v) => 'chia số đó cho ' + v.a + ' rồi trừ đi ' + v.b,
    eq: (v) => 'x : ' + v.a + ' − ' + v.b + ' = ' + v.c, ascii: (v) => ['x/' + v.a + '-' + v.b, String(v.c)],
    steps: (v) => ['x : ' + v.a + ' = ' + v.c + ' + ' + v.b + ' = ' + (v.c + v.b), 'x = ' + (v.c + v.b) + ' · ' + v.a + ' = ' + v.x],
  },
  divAdd: {
    make: (rng) => { const a = rng.int(2, 6), b = rng.int(2, 9), t = rng.int(2, 12); return { a, b, x: a * t, c: t + b }; },
    text: (v) => 'chia số đó cho ' + v.a + ' rồi cộng thêm ' + v.b,
    eq: (v) => 'x : ' + v.a + ' + ' + v.b + ' = ' + v.c, ascii: (v) => ['x/' + v.a + '+' + v.b, String(v.c)],
    steps: (v) => ['x : ' + v.a + ' = ' + v.c + ' − ' + v.b + ' = ' + (v.c - v.b), 'x = ' + (v.c - v.b) + ' · ' + v.a + ' = ' + v.x],
  },
  addMul: {
    make: (rng) => { const a = rng.int(2, 6), b = rng.int(2, 9), x = rng.int(2, 12); return { a, b, x, c: a * (x + b) }; },
    text: (v) => 'cộng số đó với ' + v.b + ' rồi nhân với ' + v.a,
    eq: (v) => v.a + '(x + ' + v.b + ') = ' + v.c, ascii: (v) => [v.a + '(x+' + v.b + ')', String(v.c)],
    steps: (v) => ['x + ' + v.b + ' = ' + v.c + ' : ' + v.a + ' = ' + (v.x + v.b), 'x = ' + (v.x + v.b) + ' − ' + v.b + ' = ' + v.x],
  },
  subDiv: {
    make: (rng) => { const a = rng.int(2, 6), b = rng.int(2, 9), c = rng.int(2, 12); return { a, b, x: a * c + b, c }; },
    text: (v) => 'lấy số đó trừ đi ' + v.b + ' rồi chia cho ' + v.a,
    eq: (v) => '(x − ' + v.b + ') : ' + v.a + ' = ' + v.c, ascii: (v) => ['(x-' + v.b + ')/' + v.a, String(v.c)],
    steps: (v) => ['x − ' + v.b + ' = ' + v.c + ' · ' + v.a + ' = ' + v.a * v.c, 'x = ' + v.a * v.c + ' + ' + v.b + ' = ' + v.x],
  },
};
const VARIANT_KEYS = Object.keys(VARIANTS);
const SAMPLE = [1.37, -2.71, 0.53, 3.19, -0.87];
/* "2x = 6 ⟹ x = 3", hoặc chỉ "x = 3" khi hệ số là 1. */
const solved = (k, v, rhs) => (k === 1 ? v + ' = <b>' + rhs + '</b>' : k + v + ' = ' + rhs + ' ⟹ ' + v + ' = <b>' + rhs / k + '</b>');
/* Phương trình phải chứa kết quả c của đề — "x = 3" là nghiệm chứ không phải phương trình lập từ đề. */
const mentions = (input, c) => (String(input ?? '').match(/\d+/g) || []).includes(String(c));

/* Phương trình học sinh gõ (vd "2x + 7 = 13", "13 = 7 + 2x") có tương đương phương trình đúng không:
   (trái − phải) của học sinh = k · (trái − phải) của đáp án, với cùng một hằng số k ≠ 0. */
export function sameLinearEquation(input, [lhs, rhs]) {
  const sides = String(input ?? '').split('=');
  if (sides.length !== 2) return false;
  const [a, b, c, d] = [...sides, lhs, rhs].map(parseExpr);
  if (!a || !b || !c || !d) return false;
  let k = null;
  for (const t of SAMPLE) {
    const f = evalExpr(a, { x: t }) - evalExpr(b, { x: t }), g = evalExpr(c, { x: t }) - evalExpr(d, { x: t });
    if (!Number.isFinite(f) || !Number.isFinite(g) || g === 0) return false;
    const r = f / g;
    if (k === null) k = r;
    else if (Math.abs(r - k) > 1e-9 * Math.max(1, Math.abs(k))) return false;
  }
  return k !== null && Math.abs(k) > 1e-12;
}

/* Hình chữ nhật: cạnh trên px + q = cạnh dưới r(x + s); cạnh trái uy + v = cạnh phải wy + z. */
function makeRect(rng) {
  let p, r, s, x, q;
  do {
    p = rng.int(3, 6); r = rng.int(2, p - 1); s = rng.int(2, 8); x = rng.int(2, 12);
    q = r * (x + s) - p * x;
  } while (q < 1);
  const u = rng.int(3, 6), w = rng.int(2, u - 1), y = rng.int(2, 10), v = rng.int(1, 9);
  return { p, q, r, s, x, u, v, w, y, z: (u - w) * y + v };
}

function rectSvg(R) {
  const t = (x, y, s, anchor = 'middle') => '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor +
    '" font-family="Lora, serif" font-size="15" fill="currentColor">' + s + '</text>';
  return '<svg width="300" height="170" viewBox="0 0 300 170" style="color:var(--ink);max-width:100%;">' +
    '<rect x="80" y="30" width="140" height="100" fill="none" stroke="currentColor" stroke-width="2"/>' +
    t(150, 22, R.p + 'x + ' + R.q) + t(150, 152, R.r + '(x + ' + R.s + ')') +
    t(74, 85, R.u + 'y + ' + R.v, 'end') + t(226, 85, R.w + 'y + ' + R.z, 'start') + '</svg>';
}

export default {
  id: 'ch2.equation-word',
  chapter: 2,
  topic: '2.5',
  title: 'Lập phương trình và giải',
  shortTitle: 'Lập phương trình',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    const kind = rng.pick(VARIANT_KEYS);
    return { name: rng.pick(NAMES), kind, v: VARIANTS[kind].make(rng), rect: makeRect(rng) };
  },

  render(p, ui) {
    const V = VARIANTS[p.kind];
    return '<div class="sub"><span class="sub-label">a.</span> ' + p.name + ' nghĩ đến một số. Bạn ấy ' + V.text(p.v) +
        '. Kết quả nhận được là ' + p.v.c + '. Gọi số đó là x.' +
        '<div class="factor-row">Phương trình: ' + ui.blank('eq', { width: 180, placeholder: 'vd: 2x + 7 = 13' }) + ui.feedback('eq', { inline: true }) + '</div>' +
        '<div class="factor-row">Số ' + p.name + ' nghĩ đến: x = ' + ui.blank('x', { width: 70 }) + ui.feedback('x', { inline: true }) + '</div>' +
        ui.hint('Dùng dấu : hoặc / cho phép chia, vd: x : 3 − 7 = 8') + '</div>' +
      '<div class="sub"><span class="sub-label">b.</span> Hình chữ nhật dưới đây có độ dài các cạnh như hình. Tìm x và y.' +
        '<div>' + rectSvg(p.rect) + '</div>' +
        '<div class="factor-row">x = ' + ui.blank('rx', { width: 60 }) + ui.feedback('rx', { inline: true }) +
        ' &nbsp;&nbsp; y = ' + ui.blank('ry', { width: 60 }) + ui.feedback('ry', { inline: true }) + '</div></div>';
  },

  grade(p, ans) {
    const V = VARIANTS[p.kind];
    return {
      parts: [
        part('eq', mentions(ans.eq, p.v.c) && sameLinearEquation(ans.eq, V.ascii(p.v)), 0.25, V.eq(p.v)),
        part('x', sameNumber(num(ans.x), p.v.x), 0.25, String(p.v.x)),
        part('rx', sameNumber(num(ans.rx), p.rect.x), 0.25, String(p.rect.x)),
        part('ry', sameNumber(num(ans.ry), p.rect.y), 0.25, String(p.rect.y)),
      ],
    };
  },

  solve(p) {
    const [l, r] = VARIANTS[p.kind].ascii(p.v);
    return { eq: l + ' = ' + r, x: String(p.v.x), rx: String(p.rect.x), ry: String(p.rect.y) };
  },

  describe(p) {
    return VARIANTS[p.kind].eq(p.v) + ' ; hình chữ nhật ' + p.rect.p + 'x + ' + p.rect.q + ' = ' + p.rect.r + '(x + ' + p.rect.s + ')';
  },

  explain(p) {
    const V = VARIANTS[p.kind], v = p.v, R = p.rect;
    return [
      '<p><b>a) Bước 1 — Lập phương trình:</b> gọi số ' + p.name + ' nghĩ là x.</p>' +
        '<p>&nbsp;&nbsp;"' + V.text(v) + '", "kết quả là ' + v.c + '" ⟹ <b>' + V.eq(v) + '</b></p>',
      '<p><b>a) Bước 2 — Giải bằng phép tính ngược</b> (làm ngược lại từ bước cuối):</p>' +
        V.steps(v).map((s) => '<p>&nbsp;&nbsp;' + s + '</p>').join('') +
        '<p>&nbsp;&nbsp;⟹ x = <b>' + v.x + '</b>. Thử lại: thay x = ' + v.x + ' vào ' + V.eq(v).split('=')[0] + 'được ' + v.c + ' ✓</p>',
      '<p><b>b) Tìm x:</b> hai cạnh đối của hình chữ nhật bằng nhau:</p>' +
        '<p>&nbsp;&nbsp;' + R.p + 'x + ' + R.q + ' = ' + R.r + '(x + ' + R.s + ')</p>' +
        '<p>&nbsp;&nbsp;' + R.p + 'x + ' + R.q + ' = ' + R.r + 'x + ' + R.r * R.s + ' &nbsp;<i>(khai triển)</i></p>' +
        '<p>&nbsp;&nbsp;' + R.p + 'x − ' + R.r + 'x = ' + R.r * R.s + ' − ' + R.q + ' &nbsp;<i>(chuyển vế)</i></p>' +
        '<p>&nbsp;&nbsp;' + solved(R.p - R.r, 'x', R.r * R.s - R.q) + '</p>',
      '<p><b>b) Tìm y:</b> hai cạnh đối còn lại cũng bằng nhau:</p>' +
        '<p>&nbsp;&nbsp;' + R.u + 'y + ' + R.v + ' = ' + R.w + 'y + ' + R.z + '</p>' +
        '<p>&nbsp;&nbsp;' + R.u + 'y − ' + R.w + 'y = ' + R.z + ' − ' + R.v + ' &nbsp;<i>(chuyển vế)</i></p>' +
        '<p>&nbsp;&nbsp;' + solved(R.u - R.w, 'y', R.z - R.v) + '</p>',
    ];
  },
};
