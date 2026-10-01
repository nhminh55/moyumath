/* Thời gian học & mốc thưởng mỗi ngày (js/runner/study-time.js). */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DAILY_GOALS, dayKey, daySeconds, goalsFromDoc, goalFields, newlyReached, nextGoal, starsOfGoals, studyStars,
  streakDays, formatStudyClock, formatMinutes,
} from '../js/runner/study-time.js';

test('mốc mỗi ngày: 15′ +1⭐, 30′ +2⭐, 60′ +3⭐', () => {
  assert.deepEqual(DAILY_GOALS, [{ min: 15, stars: 1 }, { min: 30, stars: 2 }, { min: 60, stars: 3 }]);
});

test('dayKey theo giờ địa phương', () => {
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
  assert.equal(dayKey(new Date(2026, 9, 1, 0, 0)), '2026-10-01');
});

test('newlyReached chỉ trả mốc đủ giờ mà chưa nhận', () => {
  assert.deepEqual(newlyReached(14 * 60 + 59, {}), []);
  assert.deepEqual(newlyReached(15 * 60, {}).map((g) => g.min), [15]);
  assert.deepEqual(newlyReached(31 * 60, { 15: 1 }).map((g) => g.min), [30]);
  assert.deepEqual(newlyReached(61 * 60, {}).map((g) => g.min), [15, 30, 60]);
  assert.deepEqual(newlyReached(90 * 60, { 15: 1, 30: 2, 60: 3 }), []);
});

test('nextGoal', () => {
  assert.equal(nextGoal(0).min, 15);
  assert.equal(nextGoal(15 * 60).min, 30);
  assert.equal(nextGoal(60 * 60), null);
});

test('goalFields ⇄ goalsFromDoc', () => {
  const goals = { 15: 1, 30: 2 };
  assert.deepEqual(goalFields(goals), { goal15: 1, goal30: 2 });
  assert.deepEqual(goalsFromDoc({ goal15: 1, goal30: 2, practiceSec: 5 }), goals);
  assert.deepEqual(goalsFromDoc(undefined), {});
  assert.deepEqual(goalsFromDoc({ goal60: true }), { 60: 3 }); // cờ boolean → số sao mặc định của mốc
});

test('sao: cộng theo mốc của mọi ngày', () => {
  assert.equal(starsOfGoals({ 15: 1, 30: 2, 60: 3 }), 6);
  assert.equal(studyStars({ '2026-09-30': { goal15: 1 }, '2026-10-01': { goal15: 1, goal30: 2 }, '2026-10-02': {} }), 4);
});

test('daySeconds gộp luyện tập + kiểm tra', () => {
  assert.equal(daySeconds({ practiceSec: 100, examSec: 50 }), 150);
  assert.equal(daySeconds(undefined), 0);
});

test('chuỗi ngày: hôm nay chưa đạt thì vẫn giữ chuỗi tới hôm qua', () => {
  const ok = { practiceSec: 15 * 60 };
  const today = new Date(2026, 9, 3, 10);
  assert.equal(streakDays({}, today), 0);
  assert.equal(streakDays({ '2026-10-01': ok, '2026-10-02': ok }, today), 2);
  assert.equal(streakDays({ '2026-10-01': ok, '2026-10-02': ok, '2026-10-03': ok }, today), 3);
  assert.equal(streakDays({ '2026-10-01': ok, '2026-10-03': ok }, today), 1);
  assert.equal(streakDays({ '2026-10-02': { practiceSec: 60 }, '2026-10-01': ok }, today), 0);
  assert.equal(streakDays({ '2026-09-30': ok, '2026-10-01': ok }, new Date(2026, 9, 1)), 2); // qua tháng
});

test('định dạng thời gian', () => {
  assert.equal(formatStudyClock(0), '0:00');
  assert.equal(formatStudyClock(754.9), '12:34');
  assert.equal(formatStudyClock(3723), '1:02:03');
  assert.equal(formatMinutes(754), '12 phút');
  assert.equal(formatMinutes(3600), '1 giờ');
  assert.equal(formatMinutes(3900), '1 giờ 5 phút');
});
