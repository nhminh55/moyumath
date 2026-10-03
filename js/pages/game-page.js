/* Phòng trò chơi (game.html?id=<id trò chơi trong Tiệm Phép Thuật>).
   Chơi được khi: đã mua trò chơi (kho "tiệm phép thuật") và còn giờ chơi hôm nay — mỗi 15 phút học mở 15 phút chơi,
   mỗi lượt tối đa 15 phút (js/runner/play-time.js). Lần đầu sau khi mua: 15 phút chơi thử miễn phí, không cần học trước. Giờ chơi đếm ở js/ui/play-timer.js; trò chơi ở js/games/<game>.js. */
import { currentStudent, logout } from '../core/auth.js';
import { escapeHtml } from '../core/escape.js';
import { createRng } from '../core/rng.js';
import { ITEM_BY_ID, normalizeInventory, ownedGame, trialLeftSec } from '../runner/shop.js';
import { dayKey, formatStudyClock, formatMinutes } from '../runner/study-time.js';
import { sessionSec, studyToNextBlockSec, PLAY_BLOCK_SEC } from '../runner/play-time.js';
import { storeCosmetics } from '../ui/cosmetics.js';
import { playStatus, startPlayClock, dailyLedger, trialLedger } from '../ui/play-timer.js';
import { playSound, bindClickSounds, createSoundToggle } from '../ui/sound.js';
import { celebrate } from '../ui/confetti.js';

const $ = (id) => document.getElementById(id);
const esc = escapeHtml;
const name = currentStudent().displayName;
const id = new URLSearchParams(location.search).get('id');
const item = ITEM_BY_ID[id]?.category === 'game' ? ITEM_BY_ID[id] : null;
const fb = () => import('../core/firebase.js');

let gameModule = null;  // js/games/<game>.js
let game = null;        // { stop() } của ván đang chơi

const BACK = '<a class="secondary" href="shop.html#games">Về Tiệm</a>';
const PRACTICE = '<a class="primary" href="practice.html">✏️ Đi luyện tập</a>';

function message(icon, title, html, actions) {
  $('stage').innerHTML = '<div class="card game-msg"><div class="game-msg-icon" aria-hidden="true">' + icon + '</div>' +
    '<h2>' + title + '</h2>' + html + '<div class="game-actions">' + actions + '</div></div>';
}

/* Giải thích giờ chơi hôm nay; dùng cho màn hình chờ và khi hết giờ. */
function statusNote({ studySec, playedSec }) {
  return '<p class="game-note">Hôm nay bé đã học <b>' + formatMinutes(studySec) + '</b> và đã chơi <b>' + formatMinutes(playedSec) + '</b>. ' +
    'Cứ học đủ ' + PLAY_BLOCK_SEC / 60 + ' phút là mở thêm ' + PLAY_BLOCK_SEC / 60 + ' phút chơi.</p>';
}

function lockedScreen(st, title = 'Chưa đến giờ chơi') {
  const need = studyToNextBlockSec(st.studySec);
  message('🔒', title, statusNote(st) +
    '<p class="game-note">Học thêm <b>' + formatMinutes(need + 59) + '</b> nữa để mở ' + PLAY_BLOCK_SEC / 60 + ' phút chơi nhé!</p>', PRACTICE + BACK);
}

async function loadStatus() {
  const m = await fb();
  const [shop, days] = await Promise.all([m.loadShop(name), m.loadStudyDays(name)]);
  const inv = normalizeInventory(shop);
  storeCosmetics(inv);
  return { inv, days, ...playStatus(days, name) };
}

/* Tải lại trạng thái rồi hiện màn hình chờ (hoặc khoá). */
async function showReady(afterSession = false) {
  let st;
  try {
    st = await loadStatus();
  } catch (err) {
    console.error('Lỗi tải trò chơi:', err);
    message('📡', 'Không tải được', '<p class="game-note">Kiểm tra mạng rồi tải lại trang nhé.</p>', BACK);
    return;
  }
  if (!ownedGame(st.inv, item.id)) {
    message(item.icon, 'Bé chưa có trò chơi này', '<p class="game-note">Mua "' + esc(item.name) + '" ở Tiệm Phép Thuật với ⭐ ' + item.price + '.</p>',
      '<a class="primary" href="shop.html#games">Đến Tiệm</a>');
    return;
  }
  const { trial, len } = nextSession(st);
  if (!len) { lockedScreen(st, afterSession ? '⏰ Hết giờ chơi hôm nay' : 'Chưa đến giờ chơi'); return; }
  const note = trial
    ? '<p class="game-note">🎁 Quà mua trò chơi: bé được <b>chơi thử miễn phí ' + formatMinutes(len + 59) + '</b> ngay bây giờ — ' +
      'không cần học trước và không trừ giờ chơi hôm nay. Đồng hồ chỉ chạy khi trang đang mở.</p>'
    : statusNote(st) + '<p class="game-note">Còn <b>' + formatMinutes(st.leftSec) + '</b> chơi hôm nay — lượt này dài <b>' + formatMinutes(len) + '</b>. ' +
      'Đồng hồ chỉ chạy khi trang đang mở.</p>';
  const label = trial ? '🎁 Chơi thử miễn phí' : afterSession ? '▶ Chơi lượt mới' : '▶ Bắt đầu chơi';
  message(afterSession ? '⏰' : item.icon, afterSession ? 'Hết lượt chơi' : esc(item.name), note,
    '<button type="button" class="primary" id="startBtn">' + label + '</button>' + BACK);
  $('startBtn').addEventListener('click', start, { once: true });
}

/* Lượt kế tiếp: dùng hết phần chơi thử miễn phí của trò vừa mua trước, rồi mới tới giờ chơi trong ngày. */
function nextSession(st) {
  const free = sessionSec(trialLeftSec(st.inv, item.id));
  return free ? { trial: true, len: free } : { trial: false, len: sessionSec(st.leftSec) };
}

/* Tải lại ngay trước khi bắt đầu (tab khác có thể vừa chơi bớt giờ). */
async function start() {
  $('startBtn').disabled = true;
  let st;
  try {
    st = await loadStatus();
  } catch (err) {
    console.error('Lỗi tải trò chơi:', err);
    message('📡', 'Không tải được', '<p class="game-note">Kiểm tra mạng rồi thử lại nhé.</p>', BACK);
    return;
  }
  const plan = nextSession(st);
  if (plan.len) startSession(st, plan);
  else lockedScreen(st);
}

function setClock(left) {
  $('clock').hidden = false;
  $('clockTime').textContent = formatStudyClock(left);
  $('clock').classList.toggle('low', left <= 60);
}

function newRound() {
  game?.stop();
  $('result').hidden = true;
  const ctx = {
    rng: createRng(),
    sound: playSound,
    info: (text) => { $('info').textContent = text; },
    win: (text) => {
      playSound('celebrate');
      celebrate();
      showResult(text);
    },
    lose: (text) => {
      playSound('partial');
      showResult(text);
    },
  };
  game = gameModule.mount($('board'), ctx);
}

function showResult(text) {
  $('resultText').textContent = text;
  $('result').hidden = false;
}

function startSession(st, { trial, len }) {
  $('stage').innerHTML =
    '<div class="game-bar"><span class="game-info" id="info"></span>' +
      '<button type="button" class="secondary" id="newRoundBtn">↻ Ván mới</button></div>' +
    '<div class="game-result" id="result" role="status" hidden><span id="resultText"></span>' +
      '<button type="button" class="primary" id="againBtn">Chơi ván mới</button></div>' +
    '<div class="game-board-wrap"><div class="game-board" id="board"></div></div>' +
    '<p class="game-help">' + esc(gameModule.HELP) + '</p>';
  $('newRoundBtn').addEventListener('click', newRound);
  $('againBtn').addEventListener('click', newRound);
  newRound();
  const day = dayKey();
  $('clock').title = trial ? 'Thời gian chơi thử miễn phí còn lại' : 'Thời gian còn lại của lượt chơi';
  startPlayClock({
    ledger: trial ? trialLedger(name, item.id) : dailyLedger(name, day, st.days[day]?.playSec || 0),
    day,
    limitSec: len,
    onTick: setClock,
    onEnd: endSession,
  });
}

function endSession() {
  game?.stop();
  game = null;
  $('clock').hidden = true;
  playSound('goal');
  showReady(true);
}

async function init() {
  $('soundSlot').append(createSoundToggle());
  bindClickSounds();
  $('logoutLink').addEventListener('click', (e) => { e.preventDefault(); logout(); });
  if (!item) {
    message('🎮', 'Không tìm thấy trò chơi', '<p class="game-note">Chọn trò chơi ở thẻ "Trò chơi" của Tiệm Phép Thuật nhé.</p>', BACK);
    return;
  }
  document.title = item.name + ' — Toán 7';
  $('gameTitle').textContent = item.name;
  $('gameIcon').textContent = item.icon;
  if (!name) {
    message('🔑', 'Hãy đăng nhập lại', '', '<a class="primary" href="login.html">Đăng nhập</a>');
    return;
  }
  try {
    gameModule = await import('../games/' + item.game + '.js');
  } catch (err) {
    console.error('Lỗi tải trò chơi:', err);
    message('📡', 'Không tải được trò chơi', '<p class="game-note">Kiểm tra mạng rồi tải lại trang nhé.</p>', BACK);
    return;
  }
  await showReady();
}

init();
