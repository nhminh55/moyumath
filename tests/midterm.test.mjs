/* Bất biến toán học của các dạng bài thêm cho đề cương ôn tập giữa kỳ I (ngoài test chung ở curriculum.test.mjs). */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRng } from '../js/core/rng.js';
import { totalEarned } from '../js/core/grading.js';
import { gcdAll, isPrime, fmtScaled, fmtDec } from '../js/core/mathfmt.js';
import { equivalent } from '../js/core/evaluator.js';
import { getProblem } from '../js/runner/registry.js';
import { _groups } from '../curriculum/chapter-2/equivalent-expressions.js';
import { sameLinearEquation } from '../curriculum/chapter-2/equation-word.js';
import { integersOf } from '../curriculum/chapter-2/inequality.js';
import { roundSig } from '../curriculum/chapter-3/sig-figs.js';

const SEEDS = 500;
function eachParams(id, fn) {
  const p = getProblem(id);
  for (let seed = 1; seed <= SEEDS; seed++) fn(p.generate({ rng: createRng(seed), difficulty: 'medium' }), p);
}

test('fmtDec / fmtScaled', () => {
  assert.equal(fmtDec(0.1 * 3), '0,3');
  assert.equal(fmtDec(-1.5), '−1,5');
  assert.equal(fmtDec(100), '100');
  assert.equal(fmtDec(1040000, { group: true }), '1 040 000');
  assert.equal(fmtScaled(320, 1), '32,0');
  assert.equal(fmtScaled(964, 6), '0,000964');
  assert.equal(fmtScaled(104, -4, { group: true }), '1 040 000');
});

test('ch1.prime-check: 8 số khác nhau, có 3–5 số nguyên tố', () => {
  eachParams('ch1.prime-check', ({ nums }) => {
    assert.equal(new Set(nums).size, 8);
    const k = nums.filter(isPrime).length;
    assert.ok(k >= 3 && k <= 5, nums.join(','));
  });
});

test('ch1.gcd-word: số phần quà là ƯCLN của ba số', () => {
  eachParams('ch1.gcd-word', ({ g, n }) => assert.equal(gcdAll(...n), g));
});

test('ch1.power-equation: nghiệm thỏa phương trình; chấp nhận "vô nghiệm" đúng chỗ', () => {
  eachParams('ch1.power-equation', ({ items }, p) => {
    assert.equal(items.filter((it) => !it.roots.length).length, 1);
    for (const it of items) {
      const f = new Function('x', 'return ' + it.prompt.replace('x²', 'x**2').replace('x³', 'x**3').replace('−', '-').replace('= 0', '')
        .replace(/^x\*\*2 = (\d+)$/, 'x**2 - $1'));
      for (const r of it.roots) assert.equal(f(r), 0, it.prompt + ' tại ' + r);
    }
  });
  const p = getProblem('ch1.power-equation');
  const params = p.generate({ rng: createRng(3) });
  const none = params.items.findIndex((it) => !it.roots.length);
  const ok = (s) => p.grade(params, { ['i' + none]: s }).parts[none].correct;
  for (const s of ['vô nghiệm', 'Vô nghiệm', 'vo nghiem', 'không có x', '∅']) assert.ok(ok(s), s);
  assert.ok(!ok('0'));
  const two = params.items.findIndex((it) => it.roots.length === 2);
  const [r1, r2] = params.items[two].roots;
  assert.ok(p.grade(params, { ['i' + two]: 'x = ' + r1 + ' hoặc x = ' + r2 }).parts[two].correct);
  assert.ok(!p.grade(params, { ['i' + two]: String(r1) }).parts[two].correct, 'thiếu nghiệm âm phải sai');
});

test('ch2.equivalent-expressions: mỗi cách viết tương đương đúng nhóm của nó, không tương đương nhóm khác', () => {
  for (const [a, b] of [[7, 8], [3, 5], [2, 9]]) {
    for (const [g, G] of Object.entries(_groups)) {
      for (const f of G.forms) {
        for (const [h, H] of Object.entries(_groups)) {
          assert.equal(equivalent(f.ascii(a, b), H.ascii(a, b)), g === h, f.ascii(a, b) + ' vs nhóm ' + h);
        }
      }
    }
  }
});

test('ch2.equation-word: nghiệm đúng; phương trình tương đương được chấp nhận, "x = nghiệm" thì không', () => {
  eachParams('ch2.equation-word', ({ rect: R }) => {
    assert.equal(R.p * R.x + R.q, R.r * (R.x + R.s));
    assert.equal(R.u * R.y + R.v, R.w * R.y + R.z);
  });
  assert.ok(sameLinearEquation('13 = 7 + 2x', ['2x+7', '13']));
  assert.ok(sameLinearEquation('2*x+7=13', ['2x+7', '13']));
  assert.ok(sameLinearEquation('x : 3 - 7 = 8', ['x/3-7', '8']));
  assert.ok(!sameLinearEquation('2x + 7 = 14', ['2x+7', '13']));
  assert.ok(!sameLinearEquation('2x + 7', ['2x+7', '13']));
  const p = getProblem('ch2.equation-word');
  const params = p.generate({ rng: createRng(5) });
  assert.equal(p.grade(params, { eq: 'x = ' + params.v.x }).parts[0].correct, false);
});

test('ch2.inequality: liệt kê số nguyên theo dấu ≤ / <', () => {
  assert.deepEqual(integersOf({ l: 2, r: 7, kind: 'co' }), [2, 3, 4, 5, 6]);
  assert.deepEqual(integersOf({ l: 2, r: 7, kind: 'oc' }), [3, 4, 5, 6, 7]);
  assert.deepEqual(integersOf({ l: -15, r: -10, kind: 'oc' }), [-14, -13, -12, -11, -10]);
  eachParams('ch2.inequality', ({ lines, list }) => {
    assert.notEqual(lines[0].kind, lines[1].kind);
    assert.ok(integersOf(list).length >= 2);
  });
});

test('ch3.mul-div-tenths: kết quả khớp phép tính thật', () => {
  const p = getProblem('ch3.mul-div-tenths');
  const factor = { 0: 0.1, 1: 0.01, 2: 10, 3: 100 };
  eachParams('ch3.mul-div-tenths', (params) => {
    const ans = p.solve(params);
    params.items.forEach((it, i) => {
      const v = it.m / 10 ** it.k * factor[it.op];
      assert.ok(Math.abs(Number(ans['i' + i].replace(',', '.')) - v) < 1e-9, ans['i' + i] + ' vs ' + v);
      assert.doesNotMatch(ans['i' + i], /,\d*0$/, 'không có số 0 thừa cuối phần thập phân');
    });
  });
});

test('ch3.sig-figs: các ví dụ trong đề cương', () => {
  const r = (M, e, n) => { const { q, e2 } = roundSig(M, e, n); return fmtScaled(q, -e2, { group: e2 >= 0 }); };
  assert.equal(r(96377, -8, 3), '0,000964');
  assert.equal(r(76513, -5, 3), '0,765');
  assert.equal(r(319906, -4, 3), '32,0');
  assert.equal(r(1039752, 0, 3), '1 040 000');
  assert.equal(r(23000969, 0, 3), '23 000 000');
  assert.equal(r(987654, -3, 3), '988');
  assert.equal(r(4012345, -6, 1), '4');
  assert.equal(r(4012345, -6, 2), '4,0');
  assert.equal(r(4012345, -6, 4), '4,012');
  assert.equal(r(4012345, -6, 6), '4,01235');
  assert.equal(r(246815, -2, 1), '2 000');
  assert.equal(r(781, -4, 1), '0,08');
});

test('ch3.estimate: số đã làm tròn có 1 chữ số có nghĩa và đúng là làm tròn của số thật', () => {
  const round1 = (x) => { const pw = 10 ** Math.floor(Math.log10(Math.abs(x))); return Math.sign(x) * Math.round(Math.abs(x) / pw) * pw; };
  eachParams('ch3.estimate', ({ items }) => {
    for (const it of items) {
      assert.equal(round1(it.a / 10), it.ra, it.a / 10 + ' → ' + it.ra);
      assert.equal(round1(it.b / 10), it.rb, it.b / 10 + ' → ' + it.rb);
      if (it.op === ':') assert.ok(Number.isInteger(it.ra / it.rb));
    }
  });
});

test('ch4.order-decimals: đáp án mẫu đúng thứ tự; chấm từng vị trí', () => {
  const p = getProblem('ch4.order-decimals');
  eachParams('ch4.order-decimals', (params) => {
    assert.equal(new Set(params.a).size, 4);
    assert.equal(new Set(params.b.items.map((it) => it.v)).size, 4);
  });
  const params = p.generate({ rng: createRng(9) });
  const ans = p.solve(params);
  [ans.a0, ans.a1] = [ans.a1, ans.a0];
  assert.equal(totalEarned(p.grade(params, ans)), 0.75);
});

test('ch2.formula-word: chấp nhận số có dấu tách nghìn', () => {
  const p = getProblem('ch2.formula-word');
  const params = { ctx: 0, extra: 0, p: 25000, q: 6000, k: 10000, x: 6, y: 12 };
  for (const [a, b] of [['25000x + 6000y - 10000', '212000'], ['25.000x + 6.000y − 10.000', '212.000'], ['T = 6000y + 25 000x − 10 000', '212 000 đồng']]) {
    assert.equal(totalEarned(p.grade(params, { a, b })), 1, a + ' | ' + b);
  }
  assert.equal(totalEarned(p.grade(params, { a: '25000x + 6000y + 10000', b: '232000' })), 0);
});

test('config/reviews.json: mọi dạng bài tồn tại và luyện tập được; đề thi thử trỏ đúng', async () => {
  const fs = await import('node:fs');
  const path = await import('node:path');
  const { ROOT } = await import('./helpers/paths.mjs');
  const read = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'config', f), 'utf8'));
  const reviews = read('reviews.json'), presets = read('presets.json');
  for (const [id, r] of Object.entries(reviews)) {
    assert.ok(presets[r.exam], id + ': không có preset ' + r.exam);
    assert.equal(presets[r.exam].review, id);
    if (r.source) assert.ok(fs.existsSync(path.join(ROOT, r.source)), 'thiếu file ' + r.source);
    for (const item of r.items) {
      assert.ok(item.problems.length > 0, item.label);
      for (const pid of item.problems) {
        const p = getProblem(pid);
        assert.ok(p, item.label + ': không có dạng bài ' + pid);
        assert.notEqual(p.practice, false, pid + ' không có ở trang luyện tập');
      }
    }
  }
  const exam = presets['thithu-giuaky1'];
  assert.equal(exam.durationMin, 90);
  assert.deepEqual([...new Set(exam.items.map((it) => getProblem(it.problem).chapter))].sort(), [1, 2, 3, 4]);
});
