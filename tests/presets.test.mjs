/* Kiểm tra config/presets.json và js/runner/preset-resolver.js. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './helpers/load-legacy.mjs';
import { createRng } from '../js/core/rng.js';
import { totalEarned, scaleResult } from '../js/core/grading.js';
import {
  resolvePreset, validatePreset, presetIdFromParams, distributeDifficulty, nearestDifficulty, chapterLabelOf,
} from '../js/runner/preset-resolver.js';
import { getProblem } from '../js/runner/registry.js';

const PRESETS = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'presets.json'), 'utf8'));

test('mọi preset hợp lệ', () => {
  for (const [id, preset] of Object.entries(PRESETS)) assert.deepEqual(validatePreset(id, preset), []);
});

test('mọi preset: 200 seed, đáp án mẫu đạt đúng totalPoints', () => {
  for (const preset of Object.values(PRESETS)) {
    for (let seed = 1; seed <= 200; seed++) {
      const rng = createRng(seed);
      const qs = resolvePreset(preset, rng);
      assert.equal(new Set(qs.map((q) => q.problem.id)).size, qs.length, 'không trùng dạng bài trong một đề');
      let sum = 0;
      for (const q of qs) {
        const params = q.problem.generate({ rng, difficulty: q.difficulty });
        const r = scaleResult(q.problem.grade(params, q.problem.solve(params)), q.points, q.problem.points);
        sum += r.parts.reduce((s, p) => s + p.earned, 0);
      }
      assert.equal(Math.round(sum * 100) / 100, preset.totalPoints);
    }
  }
});

test('3 đề cũ giữ nguyên thứ tự câu, điểm và nhãn thống kê', () => {
  const rng = createRng(1);
  const q15 = resolvePreset(PRESETS['15m-ch1'], rng);
  assert.deepEqual(q15.map((q) => [q.problem.legacy.labels[0].label, q.points, q.label]),
    [['Câu 1', 3, 'Câu 1'], ['Câu 2', 1, 'Câu 2'], ['Câu 3', 2, 'Câu 3'], ['Câu 4', 2, 'Câu 4'], ['Câu 5', 2, 'Câu 5']]);
  const qc2 = resolvePreset(PRESETS['15m-ch2'], rng);
  assert.deepEqual(qc2.map((q) => q.points), [2, 2, 1, 1.5, 1.5, 2]);
  qc2.forEach((q, i) => assert.ok(q.problem.legacy.labels.some((l) => l.chapter === 2 && l.label === 'Câu ' + (i + 1)), q.problem.id));
  const q1t = resolvePreset(PRESETS['1tiet-ch1'], rng);
  assert.deepEqual(q1t.map((q) => q.label), [1, 2, 3, 4, 5, 6, 7].map((n) => '1T-Câu ' + n));
  q1t.forEach((q) => assert.ok(q.problem.legacy.labels.some((l) => l.label === q.label), q.problem.id));
  assert.equal(chapterLabelOf(PRESETS['15m-ch2']), 'Chương 2');
  assert.equal(chapterLabelOf(PRESETS['giuaky-hk1']), 'Chương 1–2');
});

test('sections: bốc đúng số câu theo chương, cùng seed cùng đề', () => {
  const preset = PRESETS['giuaky-hk1'];
  const a = resolvePreset(preset, createRng(42)).map((q) => q.problem.id);
  const b = resolvePreset(preset, createRng(42)).map((q) => q.problem.id);
  assert.deepEqual(a, b);
  assert.equal(a.filter((id) => id.startsWith('ch1.')).length, 4);
  assert.equal(a.filter((id) => id.startsWith('ch2.')).length, 4);
  const seen = new Set();
  for (let s = 1; s <= 200; s++) resolvePreset(preset, createRng(s)).forEach((q) => seen.add(q.problem.id));
  assert.ok(seen.size > 15, 'nhiều seed phải phủ gần hết các dạng bài');
});

test('độ khó: chia theo tỉ lệ và lùi về mức gần nhất', () => {
  assert.deepEqual(distributeDifficulty({ easy: 0.5, medium: 0.3, hard: 0.2 }, 10).sort(),
    [...Array(2).fill('hard'), ...Array(5).fill('easy'), ...Array(3).fill('medium')].sort());
  assert.equal(distributeDifficulty({ easy: 1, hard: 1 }, 3).length, 3);
  const p = getProblem('ch1.gcd-lcm'); // chỉ có 'medium'
  assert.equal(nearestDifficulty(p, 'hard'), 'medium');
  assert.equal(nearestDifficulty({ difficulties: ['easy', 'hard'] }, 'medium'), 'easy');
});

test('validatePreset bắt lỗi cấu hình', () => {
  const bad = { title: 't', heading: 'h', examType: 'x', durationMin: 15, totalPoints: 10, chapter: 1,
    items: [{ problem: 'ch1.khong-co', points: 5 }, { problem: 'ch1.gcd-lcm', points: 3 }] };
  const errs = validatePreset('bad', bad);
  assert.ok(errs.some((e) => e.includes('không tồn tại')));
  assert.ok(errs.some((e) => e.includes('tổng điểm')));
  const tooMany = { ...bad, items: undefined, sections: [{ pool: { chapters: [2] }, count: 50, pointsEach: 0.2 }] };
  assert.ok(validatePreset('x', tooMany).some((e) => e.includes('pool')));
});

test('URL: ?preset=, ?type=&chapter=, mặc định', () => {
  assert.equal(presetIdFromParams(new URLSearchParams('preset=1tiet-ch1')), '1tiet-ch1');
  assert.equal(presetIdFromParams(new URLSearchParams('type=15m&chapter=2')), '15m-ch2');
  assert.equal(presetIdFromParams(new URLSearchParams('')), '15m-ch1');
});

test('scaleResult: tổng sau co giãn không lệch do làm tròn', () => {
  const r = { parts: [{ earned: 1, max: 1 }, { earned: 1, max: 1 }, { earned: 1, max: 1 }] };
  assert.equal(totalEarned(scaleResult(r, 1.25, 3)), 1.25);
});
