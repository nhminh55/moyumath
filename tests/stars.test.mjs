/* Quy tắc thưởng sao luyện tập (js/runner/stars.js) — khớp CLAUDE.md. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyStat, recordAttempt, resetStat, starsForStat, statFromDoc, migrateLegacy, isLegacyDoc, avgOfScores, totalStars,
} from '../js/runner/stars.js';

function play(stat, pcts) {
  const events = [];
  for (const p of pcts) {
    const r = recordAttempt(stat, p);
    stat = r.stat;
    if (r.event) events.push(r.event);
  }
  return { stat, events };
}

test('mốc 10 lượt: +5⭐ khi TB ≥ 50%', () => {
  const { stat, events } = play(emptyStat(), Array(10).fill(60));
  assert.deepEqual(events, [{ type: 'reward', milestone: 10, stars: 5, avg: 60 }]);
  assert.equal(starsForStat(stat), 5);
  assert.equal(stat.attempts, 10);
});

test('mốc 10 lượt: TB < 50% → không thưởng, làm lại chu kỳ', () => {
  const { stat, events } = play(emptyStat(), Array(10).fill(40));
  assert.equal(events[0].type, 'redo');
  assert.equal(stat.attempts, 0);
  assert.deepEqual(stat.scores, []);
  assert.equal(starsForStat(stat), 0);
});

test('mốc 20 lượt: TB 10 lượt gần nhất ≥ 80% → +5⭐, 50–80% → +2⭐, < 50% → làm lại', () => {
  const r1 = play(emptyStat(), [...Array(10).fill(50), ...Array(10).fill(90)]);
  assert.deepEqual(r1.events.map((e) => [e.milestone, e.stars]), [[10, 5], [20, 5]]);
  assert.equal(starsForStat(r1.stat), 10);

  const r2 = play(emptyStat(), [...Array(10).fill(100), ...Array(10).fill(60)]);
  assert.equal(r2.events[1].stars, 2);
  assert.equal(starsForStat(r2.stat), 7);

  const r3 = play(emptyStat(), [...Array(10).fill(100), ...Array(10).fill(30)]);
  assert.equal(r3.events[1].type, 'redo');
  assert.equal(r3.stat.attempts, 0);
  assert.equal(starsForStat(r3.stat), 5, 'sao mốc 10 vẫn giữ');
});

test('tối đa 2 mốc: sau 20 lượt không thưởng thêm', () => {
  const { stat, events } = play(emptyStat(), Array(40).fill(100));
  assert.equal(events.length, 2);
  assert.equal(starsForStat(stat), 10);
});

test('"Luyện lại từ đầu" giữ sao đã nhận và không cho nhận lại (sửa lỗi farm sao)', () => {
  let { stat } = play(emptyStat(), Array(10).fill(100));
  stat = resetStat(stat);
  assert.equal(stat.attempts, 0);
  assert.equal(starsForStat(stat), 5);
  const again = play(stat, Array(10).fill(100));
  assert.deepEqual(again.events, [], 'mốc 10 đã thưởng rồi');
  const more = play(again.stat, Array(10).fill(100));
  assert.equal(more.events[0].milestone, 20);
  assert.equal(starsForStat(more.stat), 10);
});

test('điểm phong độ = TB 10 lượt gần nhất', () => {
  assert.equal(avgOfScores([]), 0);
  assert.equal(avgOfScores([0, 0, ...Array(10).fill(100)]), 100);
  assert.equal(avgOfScores([50, 100]), 75);
});

test('doc cũ: reward10 = true không có reward10Amount nghĩa là đã nhận 5⭐', () => {
  const s = statFromDoc({ attempts: 12, scores: [], reward10: true, reward20: false, reward20Amount: 0 });
  assert.equal(starsForStat(s), 5);
});

test('migrate doc trước hệ thống sao: không hiển thị sao chưa từng được cộng (sửa lỗi)', () => {
  const d = { attempts: 25, earnedSum: 3, maxSum: 10 }; // TB 30%
  assert.ok(isLegacyDoc(d));
  const s = migrateLegacy(statFromDoc(d), d);
  assert.ok(s.reward10 && s.reward20);
  assert.equal(starsForStat(s), 0);
  const good = { attempts: 25, earnedSum: 9, maxSum: 10 };
  assert.equal(starsForStat(migrateLegacy(statFromDoc(good), good)), 10);
  const noSums = { attempts: 12 };
  assert.equal(starsForStat(migrateLegacy(statFromDoc(noSums), noSums)), 5);
});

test('tổng sao từ mọi dạng bài', () => {
  assert.equal(totalStars({ a: { reward10: true, reward20: true, reward20Amount: 2 }, b: emptyStat() }), 7);
});
