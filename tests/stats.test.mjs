/* Thống kê cho index/admin (js/runner/stats.js) với doc cũ và mới. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { examEntries, practiceEntries, aggregate, topicScores, classify, problemLabel, pctOf } from '../js/runner/stats.js';
import { getChapter, getProblem } from '../js/runner/registry.js';

const oldExamCh1 = { score: '7/10', byQuestion: { 'Câu 1': { earned: 3, max: 3 }, 'Câu 2': { earned: 0, max: 1 } } }; // không có chapter
const oldExamCh2 = { chapter: 'Chương 2', byQuestion: { 'Câu 1': { earned: 1, max: 2 }, 'Câu 4': { earned: 1.5, max: 1.5 } } };
const oldExam1Tiet = { chapter: 'Chương 1', examType: 'Kiểm tra 1 tiết', byQuestion: { '1T-Câu 3': { earned: 1, max: 1.5 } } };
const newExam = {
  chapter: 'Chương 2', presetId: '15m-ch2',
  byQuestion: { 'Câu 1': { earned: 2, max: 2 } }, // phải bị bỏ qua vì đã có byProblem
  byProblem: { 'ch2.eval-expression': { earned: 2, max: 2 } },
};
const oldPractice = { byQuestion: { 'Câu 1': { count: 2, correct: 1, totalEarned: 4, max: 3 }, 'Nối phát biểu': { count: 1, correct: 1, totalEarned: 2, max: 2 }, 'Lạ': { count: 1, totalEarned: 1, max: 1 } } };
const newPractice = { chapter: 'Chương 1', byQuestion: { 'Câu 1': { count: 9, totalEarned: 0, max: 3 } }, byProblem: { 'ch1.gcd-lcm': { count: 1, correct: 1, totalEarned: 3, max: 3 } } };

test('bài kiểm tra cũ: "Câu 1" được map theo chương', () => {
  assert.deepEqual(examEntries(oldExamCh1).map((e) => e.problem.id), ['ch1.gcd-lcm', 'ch1.square-eq']);
  assert.deepEqual(examEntries(oldExamCh2).map((e) => e.problem.id), ['ch2.eval-expression', 'ch2.common-factor']);
  assert.deepEqual(examEntries(oldExam1Tiet).map((e) => e.problem.id), ['ch1.int-mul-div']);
});

test('doc mới: dùng byProblem, bỏ qua byQuestion', () => {
  assert.deepEqual(examEntries(newExam).map((e) => [e.problem.id, e.earned]), [['ch2.eval-expression', 2]]);
  assert.deepEqual(practiceEntries(newPractice).map((e) => [e.problem.id, e.max]), [['ch1.gcd-lcm', 3]]);
});

test('phiên luyện tập cũ không có chapter: map được cả nhãn Chương 1 lẫn Chương 2, bỏ nhãn lạ', () => {
  assert.deepEqual(practiceEntries(oldPractice).map((e) => [e.problem.id, e.earned, e.max]),
    [['ch1.gcd-lcm', 4, 6], ['ch2.match-statements', 2, 2]]);
});

test('aggregate: "Câu 1" Chương 1 và Chương 2 không còn bị trộn', () => {
  const { all, practice } = aggregate([oldExamCh1, oldExamCh2, newExam], [oldPractice, newPractice]);
  assert.deepEqual(all['ch1.gcd-lcm'], { earned: 3 + 4 + 3, max: 3 + 6 + 3 });
  assert.deepEqual(all['ch2.eval-expression'], { earned: 1 + 2, max: 2 + 2 });
  assert.deepEqual(practice['ch1.gcd-lcm'], { earned: 7, max: 9 });
  assert.equal(practice['ch2.eval-expression'], undefined, 'radar chỉ dùng luyện tập');
});

test('topicScores: gom theo chủ đề của chương', () => {
  const { practice } = aggregate([], [oldPractice, newPractice]);
  const t = topicScores(getChapter(1), practice);
  assert.equal(t.length, 5);
  assert.equal(t[0].topic.id, '1.1');
  assert.equal(Math.round(t[0].pct), 78);
  assert.equal(t[1].pct, null);
});

test('classify + nhãn hiển thị', () => {
  const c = classify({ 'ch1.gcd-lcm': { earned: 9, max: 10 }, 'ch2.expand': { earned: 1, max: 10 }, 'ch1.square-eq': { earned: 7, max: 10 } });
  assert.deepEqual(c.strong.map((x) => x.problem.id), ['ch1.gcd-lcm']);
  assert.deepEqual(c.weak.map((x) => x.problem.id), ['ch2.expand']);
  assert.deepEqual(c.mid.map((x) => x.problem.id), ['ch1.square-eq']);
  assert.equal(problemLabel(getProblem('ch2.common-factor')), 'C2 · Đặt nhân tử chung');
  assert.equal(pctOf({ earned: 0, max: 0 }), null);
});
