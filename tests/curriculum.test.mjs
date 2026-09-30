/* Kiểm tra tự động MỌI dạng bài trong curriculum/: schema, đăng ký đủ, sinh 1000 đề mỗi dạng,
   chấm đáp án mẫu solve() phải đạt tối đa, bỏ trống phải được 0, lời giải không lỗi.
   Thêm dạng bài mới không cần sửa file này. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT } from './helpers/paths.mjs';
import { createMockUi } from './helpers/mock-ui.mjs';
import { createRng } from '../js/core/rng.js';
import { totalEarned, totalMax } from '../js/core/grading.js';
import { gcd, gcdAll } from '../js/core/mathfmt.js';
import {
  allChapters, listProblems, getProblem, problemFromLegacyLabel, problemFromPracticeKey, storageKeyOf, practiceNumber,
} from '../js/runner/registry.js';

const SEEDS = 1000;
const problems = listProblems();
const BAD_TEXT = /undefined|NaN|\[object Object\]/;

test('registry: id không trùng, schema hợp lệ', () => {
  const ids = new Set();
  for (const ch of allChapters()) {
    const topicIds = ch.topics.map((t) => t.id);
    for (const p of ch.problems) {
      assert.match(p.id, /^ch\d+\.[a-z0-9-]+$/, p.id);
      assert.ok(p.id.startsWith('ch' + ch.chapter + '.'), p.id + ' nằm sai chương');
      assert.equal(p.chapter, ch.chapter, p.id);
      assert.ok(!ids.has(p.id), 'trùng id ' + p.id);
      ids.add(p.id);
      assert.ok(topicIds.includes(p.topic), p.id + ': topic ' + p.topic + ' không có trong chương');
      assert.equal(typeof p.title, 'string');
      if (p.shortTitle !== undefined) assert.equal(typeof p.shortTitle, 'string', p.id + ': shortTitle');
      if (p.describe !== undefined) assert.equal(typeof p.describe, 'function', p.id + ': describe');
      assert.ok(p.points > 0, p.id + ': points');
      assert.ok(Array.isArray(p.difficulties) && p.difficulties.length, p.id + ': difficulties');
      for (const fn of ['generate', 'render', 'grade', 'solve', 'explain']) assert.equal(typeof p[fn], 'function', p.id + '.' + fn);
    }
  }
});

test('registry: mọi file dạng bài trong curriculum/chapter-N đều được đăng ký trong index.js', async () => {
  for (const ch of allChapters()) {
    const dir = path.join(ROOT, 'curriculum', 'chapter-' + ch.chapter);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.js') && f !== 'index.js' && !f.startsWith('_'));
    for (const f of files) {
      const mod = (await import(pathToFileURL(path.join(dir, f)))).default;
      assert.ok(ch.problems.includes(mod), 'chapter-' + ch.chapter + '/' + f + ' chưa được thêm vào index.js');
    }
  }
});

test('registry: map đủ dữ liệu cũ (nhãn thống kê và key luyện tập)', () => {
  const cases = [
    ...[1, 2, 3, 4, 5].map((n) => [1, 'Câu ' + n]),
    ...[1, 2, 3, 4, 5, 6].map((n) => [2, 'Câu ' + n]),
    ...[1, 2, 3, 4, 5, 6, 7].map((n) => [1, '1T-Câu ' + n]),
    ...['Ước & số nguyên tố', 'Nhân chia số nguyên', 'Thứ tự thực hiện phép tính', 'Căn bậc hai & bậc ba'].map((l) => [1, l]),
    ...['Nối phát biểu', 'Viết biểu thức', 'Tính giá trị biểu thức', 'Lập công thức', 'Đa thức một biến',
      'Khai triển', 'Chia đa thức', 'Nhân tử chung', 'Tìm x'].map((l) => [2, l]),
  ];
  for (const [chapter, label] of cases) {
    const p = problemFromLegacyLabel('Chương ' + chapter, label);
    assert.ok(p, chapter + ' · ' + label);
    assert.equal(p.chapter, chapter, label);
  }
  /* "Câu 1" Chương 1 và Chương 2 là hai dạng khác nhau. */
  assert.notEqual(problemFromLegacyLabel('Chương 1', 'Câu 1'), problemFromLegacyLabel('Chương 2', 'Câu 1'));
  /* Doc luyện tập cũ không có field chapter. */
  assert.equal(problemFromLegacyLabel(undefined, 'Câu 1').id, 'ch1.gcd-lcm');
  assert.equal(problemFromLegacyLabel(undefined, 'Nối phát biểu').id, 'ch2.match-statements');

  const keys = [...'123456789'.split(''), ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => 'ch2_' + n)];
  const seen = new Set();
  for (const k of keys) {
    const p = problemFromPracticeKey(k);
    assert.ok(p, 'practice key ' + k);
    assert.equal(storageKeyOf(p), k);
    assert.ok(!seen.has(p.id), 'hai key cùng trỏ vào ' + p.id);
    seen.add(p.id);
  }
});

test('registry: thứ tự "Dạng" luyện tập giữ nguyên như trang cũ', () => {
  assert.deepEqual(listProblems({ chapter: 1, practice: true }).map(storageKeyOf), ['6', '1', '7', '8', '4', '9', '2', '3', '5']);
  assert.deepEqual(listProblems({ chapter: 2, practice: true }).map(storageKeyOf),
    ['ch2_1', 'ch2_2', 'ch2_3', 'ch2_4', 'ch2_5', 'ch2_6', 'ch2_7', 'ch2_8', 'ch2_9']);
  assert.equal(practiceNumber(getProblem('ch1.gcd-lcm')), 2);
});

for (const p of problems) {
  test(p.id + ': 1000 đề — render, solve, grade, explain', () => {
    for (let seed = 1; seed <= SEEDS; seed++) {
      const params = p.generate({ rng: createRng(seed), difficulty: p.difficulties[0] });
      assert.deepEqual(JSON.parse(JSON.stringify(params)), params, 'params phải JSON được');
      assert.deepEqual(p.generate({ rng: createRng(seed), difficulty: p.difficulties[0] }), params, 'cùng seed phải cùng đề');

      const { ui, inputs, feedbacks } = createMockUi();
      const html = p.render(params, ui);
      assert.equal(typeof html, 'string');
      assert.doesNotMatch(html, BAD_TEXT, 'render seed ' + seed);

      const answers = p.solve(params);
      for (const f of Object.keys(answers)) assert.ok(inputs.has(f), 'solve dùng ô không tồn tại: ' + f);

      const full = p.grade(params, answers);
      const fields = full.parts.map((x) => x.field);
      assert.equal(new Set(fields).size, fields.length, 'part.field bị trùng');
      for (const f of fields) assert.ok(feedbacks.has(f), 'thiếu ui.feedback cho ' + f);
      assert.equal(totalMax(full), p.points, 'tổng điểm các phần phải = points');
      assert.equal(totalEarned(full), p.points, 'đáp án mẫu phải đạt tối đa (seed ' + seed + ')');
      for (const part of full.parts) {
        assert.ok(part.correct, 'part ' + part.field + ' sai với đáp án mẫu (seed ' + seed + ')');
        assert.doesNotMatch(String(part.expected), BAD_TEXT);
      }

      const empty = p.grade(params, {});
      assert.equal(totalEarned(empty), 0, 'bỏ trống phải được 0 điểm');

      if (p.describe) {
        const d = p.describe(params);
        assert.ok(typeof d === 'string' && d.length > 0 && d.length < 300, 'describe seed ' + seed);
        assert.doesNotMatch(d, BAD_TEXT);
      }

      const expl = p.explain(params);
      assert.equal(typeof expl, 'string');
      assert.doesNotMatch(expl, BAD_TEXT, 'explain seed ' + seed);
    }
  });
}

/* ---- Bất biến toán học riêng của một số dạng (các lỗi đã sửa so với bản cũ) ---- */
function eachParams(id, fn) {
  const p = getProblem(id);
  for (let seed = 1; seed <= SEEDS; seed++) fn(p.generate({ rng: createRng(seed), difficulty: 'medium' }), p);
}

test('ch2.common-factor: nhân tử chung là ƯCLN', () => {
  eachParams('ch2.common-factor', (d) => {
    assert.equal(gcd(d.a1, d.b1), 1);
    assert.equal(gcdAll(d.e3, d.f3, d.g3), 1);
  });
});

test('ch2.common-factor: đáp án không phải ƯCLN bị chấm sai', () => {
  const p = getProblem('ch2.common-factor');
  const params = { k1: 4, a1: 1, b1: 2, c2: 2, d2: 3, k3: 2, e3: 2, f3: 3, g3: 5 }; // 4x + 8
  const r = p.grade(params, { a: '2(2x + 4)', b: '2x(3x + 1)', c: '(2x + 3y − 5)2' });
  assert.deepEqual(r.parts.map((x) => x.correct), [false, true, true]);
});

test('ch2.expand: ý c có hệ số x khác 0', () => {
  eachParams('ch2.expand', (d) => assert.notEqual(d.c.a * d.c.b, d.c.d * d.c.e));
});

test('ch2.poly-simplify: hệ số x² khác 0, học sinh viết "x" thay cho "1x" vẫn đúng', () => {
  eachParams('ch2.poly-simplify', (d) => assert.notEqual(d.b, d.e));
  const p = getProblem('ch2.poly-simplify');
  const params = { a: 2, b: 5, c: 3, d: 3, e: 4, f: 7 }; // 5x³ + x² − 3x + 7
  assert.ok(p.grade(params, { a: '5x^3 + x^2 - 3x + 7', b: '3' }).parts.every((x) => x.correct));
  assert.ok(p.grade(params, { a: '7 - 3x + x² + 5x³', b: '3' }).parts.every((x) => x.correct));
});

test('ch2.write-expression: chấp nhận cách viết tương đương', () => {
  const p = getProblem('ch2.write-expression');
  const params = { a: { text: '', expr: 'x/3 + 5' }, b: { text: '', expr: '4(x + 2)' } };
  const r = p.grade(params, { a: '5 + x/3', b: '(x+2)·4' });
  assert.ok(r.parts.every((x) => x.correct));
});

test('ch1.square-eq: một nghiệm được nửa điểm, có nghiệm sai được 0', () => {
  const p = getProblem('ch1.square-eq');
  assert.equal(totalEarned(p.grade({ k: 5 }, { x: '5' })), 0.5);
  assert.equal(totalEarned(p.grade({ k: 5 }, { x: '5; -5; 3' })), 0);
  assert.equal(totalEarned(p.grade({ k: 5 }, { x: 'x = 5 hoặc x = −5' })), 1);
});

test('ch1.number-sets: Venn chấm từng số 0,1 điểm, làm tròn', () => {
  const p = getProblem('ch1.number-sets');
  const params = p.generate({ rng: createRng(7), difficulty: 'medium' });
  const ans = p.solve(params);
  ans.v0 = ans.v0 === 'N' ? 'Q' : 'N';
  ans.v1 = '';
  const d = p.grade(params, ans).parts.find((x) => x.field === 'd');
  assert.equal(d.earned, 0.3);
  assert.equal(d.note, 'Đúng 3/5');
  assert.equal(d.marks.v0, false);
});
