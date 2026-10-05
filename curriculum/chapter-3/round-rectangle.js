/* Làm tròn độ dài các cạnh hình chữ nhật đến 1 chữ số có nghĩa rồi ước lượng chu vi, diện tích (phiếu học tập 3.2 — Bài 2).
   Chiều rộng 0,xx m (lưu theo phần trăm), chiều dài x,x hoặc xx,x m (lưu theo phần mười);
   sau khi làm tròn đến 1 cscn, cả hai cạnh đều là số nguyên lần 0,1 nên chu vi, diện tích tính chính xác bằng số nguyên. */
import { fmtDec } from '../../js/core/mathfmt.js';
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';
import { roundSig } from './sig-figs.js';

const nz = (m) => (m % 10 === 0 ? m + 1 : m);

/* { M, e } (M × 10^e) làm tròn đến 1 cscn → số phần mười. */
function tenthsOf({ M, e }) {
  const { q, e2 } = roundSig(M, e, 1);
  return q * 10 ** (e2 + 1);
}

function sizes(p) {
  const w = tenthsOf(p.w), l = tenthsOf(p.l);
  return {
    wText: fmtDec(p.w.M / 100), lText: fmtDec(p.l.M / 10),
    w, l, per: 2 * (w + l), area: w * l, // per: phần mười, area: phần trăm
  };
}

function figure(lText, wText) {
  const label = (x, y, t, anchor) => '<text x="' + x + '" y="' + y + '" text-anchor="' + anchor +
    '" font-family="Inter, sans-serif" font-size="13" fill="currentColor">' + t + '</text>';
  return '<svg width="240" height="100" viewBox="0 0 240 100" style="color:var(--ink);max-width:100%;display:block;margin:8px 0;">' +
    '<rect x="60" y="10" width="170" height="56" style="fill:var(--gold-soft)" stroke="currentColor" stroke-width="1.5"/>' +
    label(52, 43, wText + ' m', 'end') + label(145, 88, lText + ' m', 'middle') + '</svg>';
}

/* Một dòng giải thích làm tròn đến 1 cscn: digits = các chữ số có nghĩa của số, text = số viết như đề. */
function roundLine(name, text, M, tenths) {
  const digits = String(M), next = Number(digits[1]);
  return '&nbsp;&nbsp;• ' + name + ' ' + text + ' m: chữ số có nghĩa đầu tiên là ' + digits[0] + ', chữ số ngay sau là ' + next +
    (next >= 5 ? ' ≥ 5 → làm tròn lên' : ' &lt; 5 → giữ nguyên') + ' → ' + text + ' ≈ <b>' + fmtDec(tenths / 10) + '</b> m';
}

export default {
  id: 'ch3.round-rectangle',
  chapter: 3,
  topic: '3.2',
  title: 'Làm tròn cạnh để ước lượng chu vi, diện tích',
  shortTitle: 'Ước lượng chu vi, diện tích',
  points: 1,
  difficulties: ['medium'],

  generate({ rng }) {
    return {
      w: { M: nz(rng.int(11, 99)), e: -2 },
      l: { M: nz(rng.int(0, 1) ? rng.int(15, 99) : rng.int(101, 999)), e: -1 },
    };
  },

  render(p, ui) {
    const s = sizes(p);
    return '<p class="q-prompt">Cho hình chữ nhật có chiều dài ' + s.lText + ' m và chiều rộng ' + s.wText + ' m. ' +
        'Hãy làm tròn độ dài mỗi cạnh đến <b>1 chữ số có nghĩa</b> rồi tính:</p>' + figure(s.lText, s.wText) +
      '<div class="sub"><span class="sub-label">a.</span> Làm tròn: &nbsp;chiều dài ≈ ' + ui.blank('l', { width: 80 }) + ' m' +
        ui.feedback('l', { inline: true }) + ' &nbsp; chiều rộng ≈ ' + ui.blank('w', { width: 80 }) + ' m' + ui.feedback('w', { inline: true }) + '</div>' +
      '<div class="sub"><span class="sub-label">b.</span> Chu vi của hình chữ nhật ≈ ' + ui.blank('p', { width: 90 }) + ' m' +
        ui.feedback('p', { inline: true }) + '</div>' +
      '<div class="sub"><span class="sub-label">c.</span> Diện tích của hình chữ nhật ≈ ' + ui.blank('s', { width: 90 }) + ' m²' +
        ui.feedback('s', { inline: true }) + '</div>';
  },

  grade(p, ans) {
    const s = sizes(p);
    const check = (f, v, text) => part(f, sameNumber(num(ans[f]), v), 0.25, text);
    return {
      parts: [
        check('l', s.l / 10, fmtDec(s.l / 10)),
        check('w', s.w / 10, fmtDec(s.w / 10)),
        check('p', s.per / 10, fmtDec(s.per / 10)),
        check('s', s.area / 100, fmtDec(s.area / 100)),
      ],
    };
  },

  solve(p) {
    const s = sizes(p);
    return { l: fmtDec(s.l / 10), w: fmtDec(s.w / 10), p: fmtDec(s.per / 10), s: fmtDec(s.area / 100) };
  },

  describe(p) {
    const s = sizes(p);
    return 'Hình chữ nhật ' + s.lText + ' m × ' + s.wText + ' m (làm tròn 1 cscn)';
  },

  explain(p) {
    const s = sizes(p), L = fmtDec(s.l / 10), W = fmtDec(s.w / 10);
    /* Giá trị đúng (chưa làm tròn) để so sánh: chu vi theo phần trăm, diện tích theo phần nghìn. */
    const exactPer = 2 * (p.l.M * 10 + p.w.M), exactArea = p.l.M * p.w.M;
    return [
      '<p><b>a)</b> Làm tròn mỗi cạnh đến 1 chữ số có nghĩa:</p>' +
        '<p>' + roundLine('Chiều dài', s.lText, p.l.M, s.l) + '<br>' + roundLine('Chiều rộng', s.wText, p.w.M, s.w) + '</p>',
      '<p><b>b)</b> Chu vi ≈ 2 · (' + L + ' + ' + W + ') = 2 · ' + fmtDec((s.l + s.w) / 10) + ' = <b>' + fmtDec(s.per / 10) + '</b> (m)</p>',
      '<p><b>c)</b> Diện tích ≈ ' + L + ' · ' + W + ' = <b>' + fmtDec(s.area / 100) + '</b> (m²)</p>' +
        '<p>&nbsp;&nbsp;Kiểm tra: với số đo đúng, chu vi = ' + fmtDec(exactPer / 100) + ' m và diện tích = ' + fmtDec(exactArea / 1000) +
          ' m² — gần với kết quả ước lượng.</p>',
    ];
  },
};
