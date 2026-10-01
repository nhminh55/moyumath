/* Đồng hồ thời gian học (luyện tập + kiểm tra) và mốc thưởng mỗi ngày (js/runner/study-time.js).
   - Chỉ tính khi tab đang hiện và học sinh có thao tác trong 3 phút gần nhất (hoặc isBusy(), vd. đang
     làm bài kiểm tra có giờ).
   - Trạng thái hôm nay nằm ở localStorage "moyumath_study" (đọc–sửa–ghi mỗi giây, nên tải lại trang
     hay mở nhiều tab vẫn không mất/không đếm trùng); phần chưa lưu ("pending") được cộng dồn lên
     Firestore mỗi 30 giây, khi rời tab và ngay khi đạt mốc. */
import { local } from '../core/storage.js';
import {
  DAILY_GOALS, IDLE_LIMIT_SEC, MAX_TICK_SEC, dayKey, daySeconds, goalsFromDoc, goalFields, newlyReached, nextGoal,
  starsOfGoals, studyStars, formatStudyClock,
} from '../runner/study-time.js';
import { playSound, createSoundToggle } from './sound.js';
import { celebrate } from './confetti.js';
import { showToast } from './toast.js';

const KEY = 'moyumath_study';
const FLUSH_EVERY_MS = 30000;
const ACTIVITY_EVENTS = ['pointerdown', 'pointermove', 'keydown', 'input', 'wheel', 'scroll', 'touchstart'];

const fresh = (name, day) => ({ name, day, sec: 0, goals: {}, pending: { practice: 0, exam: 0 } });

/* Trạng thái lưu trên trình duyệt này của học sinh `name` (null nếu chưa có / của người khác). */
export function readLocalStudy(name) {
  const s = local.getJSON(KEY);
  return s && s.name === name && s.pending ? s : null;
}

/* Gộp phần hôm nay chưa kịp lưu lên Firestore vào days (để trang cá nhân hiển thị đúng ngay). */
export function mergeLocalToday(days, name, today = dayKey()) {
  const s = readLocalStudy(name);
  if (!s || s.day !== today) return days;
  const remote = days[today] || {};
  const practiceSec = (remote.practiceSec || 0) + s.pending.practice;
  const examSec = (remote.examSec || 0) + s.pending.exam;
  const lost = Math.max(0, s.sec - practiceSec - examSec); // lần ghi bị mất khi đóng trang
  return {
    ...days,
    [today]: { ...remote, practiceSec: practiceSec + lost, examSec, ...goalFields({ ...goalsFromDoc(remote), ...s.goals }) },
  };
}

function buildPill(withTimer) {
  const pill = document.createElement('div');
  pill.className = 'study-pill';
  if (withTimer) {
    pill.innerHTML =
      '<span class="study-pill-icon" aria-hidden="true">⏱</span>' +
      '<span class="study-pill-main">' +
        '<span class="study-pill-time">0:00</span>' +
        '<span class="study-pill-track"><span class="study-pill-fill"></span></span>' +
      '</span>' +
      '<span class="study-pill-goal"></span>';
  }
  pill.append(createSoundToggle());
  document.body.append(pill);
  return pill;
}

export function startStudyTimer({ mode, studentName, isBusy = () => false, onStars = () => {} }) {
  const pill = buildPill(!!studentName);
  if (!studentName) return { stars: () => 0 };

  let days = {};          // các ngày đã tải từ Firestore
  let lastInput = Date.now(), lastTick = Date.now();
  const fb = () => import('../core/firebase.js');
  const write = (s) => local.setJSON(KEY, s);

  /* Cộng dồn phần pending (số giây nguyên) lên Firestore; lỗi thì trả lại vào pending. */
  function flush(s = readLocalStudy(studentName), force = false) {
    if (!s) return;
    const p = { practice: Math.floor(s.pending.practice), exam: Math.floor(s.pending.exam) };
    if (!p.practice && !p.exam && !force) return;
    s.pending.practice -= p.practice;
    s.pending.exam -= p.exam;
    write(s);
    const { day } = s;
    fb().then((m) => m.addStudyTime(studentName, day, { practiceSec: p.practice, examSec: p.exam }, goalFields(s.goals)))
      .catch((err) => {
        console.error('Lỗi lưu thời gian học:', err);
        const cur = readLocalStudy(studentName);
        if (cur && cur.day === day) {
          cur.pending.practice += p.practice;
          cur.pending.exam += p.exam;
          write(cur);
        }
      });
  }

  /* Trạng thái hôm nay; sang ngày mới thì lưu nốt ngày cũ rồi bắt đầu lại từ 0. */
  function read() {
    const today = dayKey();
    let s = readLocalStudy(studentName);
    if (s && s.day !== today) flush(s);
    if (!s || s.day !== today) write(s = fresh(studentName, today));
    return s;
  }

  function stars(s = read()) {
    const past = Object.fromEntries(Object.entries(days).filter(([d]) => d !== s.day));
    return studyStars(past) + starsOfGoals({ ...goalsFromDoc(days[s.day]), ...s.goals });
  }

  function render(s, active) {
    const next = nextGoal(s.sec);
    const prevMin = DAILY_GOALS.filter((g) => s.sec >= g.min * 60).pop()?.min || 0;
    const ratio = next ? (s.sec - prevMin * 60) / ((next.min - prevMin) * 60) : 1;
    pill.querySelector('.study-pill-time').textContent = formatStudyClock(s.sec);
    pill.querySelector('.study-pill-fill').style.width = Math.round(Math.min(1, ratio) * 100) + '%';
    pill.querySelector('.study-pill-goal').textContent = next ? next.min + '′ +' + next.stars + '⭐' : '🏆';
    pill.classList.toggle('paused', !active);
    pill.title = 'Thời gian học hôm nay (luyện tập + kiểm tra)' + (active ? '' : ' — đang tạm dừng, chạm hoặc gõ để tính tiếp') +
      '\nMốc hôm nay: ' + DAILY_GOALS.map((g) => (s.goals[g.min] ? '✓ ' : '') + g.min + ' phút +' + g.stars + '⭐').join(' · ') +
      '\nKhông tính khi rời trang hoặc không thao tác quá ' + IDLE_LIMIT_SEC / 60 + ' phút.';
  }

  function announce(reached) {
    const top = reached[reached.length - 1];
    const gained = reached.reduce((n, g) => n + g.stars, 0);
    showToast('🎉 Hôm nay bé đã học được ' + top.min + ' phút! +' + gained + ' ⭐', { duration: 6000 });
    pill.classList.remove('flash');
    void pill.offsetWidth; // chạy lại hiệu ứng
    pill.classList.add('flash');
    if (!isBusy()) { // đang làm bài kiểm tra thì chỉ báo nhẹ, không làm phân tâm
      playSound('goal');
      celebrate();
    }
    onStars(stars());
  }

  function tick() {
    const now = Date.now();
    const dt = Math.min((now - lastTick) / 1000, MAX_TICK_SEC);
    lastTick = now;
    const active = document.visibilityState === 'visible' && (isBusy() || now - lastInput < IDLE_LIMIT_SEC * 1000);
    const s = read();
    if (active) {
      s.sec += dt;
      s.pending[mode] += dt;
      const reached = newlyReached(s.sec, s.goals);
      for (const g of reached) s.goals[g.min] = g.stars;
      write(s);
      if (reached.length) {
        flush(s, true);
        announce(reached);
      }
    }
    render(s, active);
  }

  for (const ev of ACTIVITY_EVENTS) window.addEventListener(ev, () => { lastInput = Date.now(); }, { passive: true, capture: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
    lastTick = Date.now();
  });
  window.addEventListener('pagehide', () => flush());
  setInterval(tick, 1000);
  setInterval(() => flush(), FLUSH_EVERY_MS);
  flush(); // phần còn lại từ lần trước (nếu có)
  tick();

  fb().then((m) => m.loadStudyDays(studentName)).then((remote) => {
    days = remote;
    const s = read();
    /* Thiết bị khác có thể đã học thêm hôm nay — lấy số lớn hơn, gộp các mốc đã nhận. */
    s.sec = Math.max(s.sec, daySeconds(remote[s.day]) + s.pending.practice + s.pending.exam);
    s.goals = { ...goalsFromDoc(remote[s.day]), ...s.goals };
    write(s);
    onStars(stars());
  }).catch((err) => console.error('Lỗi tải thời gian học:', err));

  return { stars: () => stars() };
}
