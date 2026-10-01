/* Quy tắc thưởng sao luyện tập (js/runner/stars.js) — khớp CLAUDE.md. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyStat, recordAttempt, resetStat, starsForStat, statFromDoc, migrateLegacy, isLegacyDoc, avgOfScores, totalStars,
} from '../js/runner/stars.js';

/* attempts: [[pct, correctParts], ...] hoặc số pct (0 phần đúng). */
function play(stat, attempts) {
  const events = [];
  for (const a of attempts) {
    const [pct, parts] = Array.isArray(a) ? a : [a, 0];
    const r = recordAttempt(stat, pct, parts);
    stat = r.stat;
    if (r.event) events.push(r.event);
  }
  return { stat, events };
}

test('mỗi phần đúng +1⭐, không giới hạn', () => {
  const { stat, events } = play(emptyStat(), [[100, 3], [50, 1], [0, 0]]);
  assert.deepEqual(events, []);
  assert.equal(stat.answerStars, 4);
  assert.equal(starsForStat(stat), 4);
  assert.equal(play(emptyStat(), Array(50).fill([100, 2])).stat.answerStars, 100);
});

test('mốc 10 lượt: +5⭐ dù điểm thấp, không làm lại chu kỳ', () => {
  const { stat, events } = play(emptyStat(), Array(10).fill(0));
  assert.deepEqual(events, [{ type: 'reward', milestone: 10, stars: 5 }]);
  assert.equal(stat.attempts, 10);
  assert.equal(stat.scores.length, 10);
  assert.equal(starsForStat(stat), 5);
});

test('mốc 20 lượt: +10⭐ dù điểm thấp', () => {
  const { stat, events } = play(emptyStat(), Array(20).fill(30));
  assert.deepEqual(events.map((e) => [e.milestone, e.stars]), [[10, 5], [20, 10]]);
  assert.equal(starsForStat(stat), 15);
});

test('tối đa 2 mốc; sao phần đúng cộng thêm', () => {
  const { stat, events } = play(emptyStat(), Array(40).fill([100, 1]));
  assert.equal(events.length, 2);
  assert.equal(starsForStat(stat), 15 + 40);
});

test('"Luyện lại từ đầu" giữ sao đã nhận và không cho nhận lại mốc (sửa lỗi farm sao)', () => {
  let { stat } = play(emptyStat(), Array(10).fill([100, 1]));
  stat = resetStat(stat);
  assert.equal(stat.attempts, 0);
  assert.equal(starsForStat(stat), 5 + 10);
  const again = play(stat, Array(10).fill(100));
  assert.deepEqual(again.events, [], 'mốc 10 đã thưởng rồi');
  const more = play(again.stat, Array(10).fill(100));
  assert.equal(more.events[0].milestone, 20);
  assert.equal(starsForStat(more.stat), 15 + 10);
});

test('điểm phong độ = TB 10 lượt gần nhất', () => {
  assert.equal(avgOfScores([]), 0);
  assert.equal(avgOfScores([0, 0, ...Array(10).fill(100)]), 100);
  assert.equal(avgOfScores([50, 100]), 75);
});

test('doc theo luật cũ được tính lại: mốc 10 = 5⭐, mốc 20 = 10⭐ bất kể amount đã lưu', () => {
  assert.equal(starsForStat(statFromDoc({ attempts: 12, scores: [], reward10: true, reward20: false, reward20Amount: 0 })), 5);
  assert.equal(starsForStat(statFromDoc({ attempts: 20, reward10: true, reward10Amount: 0, reward20: true, reward20Amount: 2 })), 15);
  assert.equal(starsForStat(statFromDoc({ attempts: 3, reward10: false, answerStars: 7 })), 7);
});

test('migrate doc trước hệ thống sao: gắn cờ mốc đã vượt, đủ sao', () => {
  const d = { attempts: 25, earnedSum: 3, maxSum: 10 };
  assert.ok(isLegacyDoc(d));
  const s = migrateLegacy(statFromDoc(d));
  assert.ok(s.reward10 && s.reward20);
  assert.equal(starsForStat(s), 15);
  assert.equal(starsForStat(migrateLegacy(statFromDoc({ attempts: 12 }))), 5);
});

test('tổng sao từ mọi dạng bài', () => {
  assert.equal(totalStars({ a: { reward10: true, reward20: true, reward20Amount: 2, answerStars: 3 }, b: emptyStat() }), 18);
});
