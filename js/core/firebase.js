/* Firebase dùng chung cho các trang mới (các trang cũ vẫn còn bản config riêng — sẽ gom ở Giai đoạn 1/5).
   Nên nạp file này bằng import() động để trang vẫn chạy được khi không tải được SDK. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, serverTimestamp, increment, arrayUnion,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

export const firebaseConfig = {
  apiKey: 'AIzaSyCgaB8J61BqBhU4NwXq9MYBrRFRREYuxGg',
  authDomain: 'moyumath.firebaseapp.com',
  projectId: 'moyumath',
  storageBucket: 'moyumath.firebasestorage.app',
  messagingSenderId: '690475633701',
  appId: '1:690475633701:web:e839cdeee12e9b1456c3cc',
  measurementId: 'G-9RPGBW0VK5',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

/* Lưu một bài kiểm tra vào "Đã làm/{studentName}/bài làm". */
export function saveExamSubmission(studentName, data) {
  return addDoc(collection(db, 'Đã làm', studentName, 'bài làm'), {
    ...data,
    studentName,
    createdAt: serverTimestamp(),
  });
}

/* Phiên luyện tập: ghi đè cùng một doc "Đã làm/{tên}/luyện tập/{sessionId}" suốt phiên. */
export function savePracticeSession(studentName, sessionId, summary, isFirstSave) {
  const payload = { ...summary, studentName, updatedAt: serverTimestamp() };
  if (isFirstSave) payload.createdAt = serverTimestamp();
  return setDoc(doc(db, 'Đã làm', studentName, 'luyện tập', sessionId), payload, { merge: true });
}

/* Tiến độ & sao từng dạng bài: "Đã làm/{tên}/giới hạn luyện tập/{key}". Trả về [{ id, data }]. */
export async function loadPracticeLimits(studentName) {
  const snap = await getDocs(collection(db, 'Đã làm', studentName, 'giới hạn luyện tập'));
  return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
}

/* Toàn bộ bài kiểm tra + phiên luyện tập của một học sinh (trang cá nhân). */
export async function loadStudentHistory(studentName) {
  const [exams, practice] = await Promise.all([
    getDocs(collection(db, 'Đã làm', studentName, 'bài làm')),
    getDocs(collection(db, 'Đã làm', studentName, 'luyện tập')),
  ]);
  return { exams: exams.docs.map((d) => d.data()), practice: practice.docs.map((d) => d.data()) };
}

export function savePracticeLimit(studentName, key, data) {
  return setDoc(doc(db, 'Đã làm', studentName, 'giới hạn luyện tập', key), { ...data, updatedAt: serverTimestamp() }, { merge: true });
}

/* Thời gian học theo ngày: "Đã làm/{tên}/thời gian học/{YYYY-MM-DD}". Giây được cộng dồn bằng
   increment() nên nhiều tab/thiết bị cùng ghi không đè nhau; extra = cờ mốc (goal15...). */
export function addStudyTime(studentName, day, { practiceSec = 0, examSec = 0 }, extra = {}) {
  return setDoc(doc(db, 'Đã làm', studentName, 'thời gian học', day), {
    ...extra,
    day,
    studentName,
    practiceSec: increment(practiceSec),
    examSec: increment(examSec),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/* Giờ chơi đã dùng trong ngày (js/runner/play-time.js): field playSec của cùng doc thời gian học. */
export function addPlayTime(studentName, day, playSec) {
  return setDoc(doc(db, 'Đã làm', studentName, 'thời gian học', day), {
    day,
    studentName,
    playSec: increment(playSec),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/* Trả về { 'YYYY-MM-DD': data }. */
export async function loadStudyDays(studentName) {
  const snap = await getDocs(collection(db, 'Đã làm', studentName, 'thời gian học'));
  return Object.fromEntries(snap.docs.map((d) => [d.id, d.data()]));
}

/* Tiệm Phép Thuật: một doc "Đã làm/{tên}/tiệm phép thuật/kho" (js/runner/shop.js). Ghi bằng increment()/arrayUnion()
   nên hai tab cùng mua không ghi đè nhau. */
const shopDoc = (studentName) => doc(db, 'Đã làm', studentName, 'tiệm phép thuật', 'kho');
const shopWrite = (studentName, data) => setDoc(shopDoc(studentName), { ...data, studentName, updatedAt: serverTimestamp() }, { merge: true });

export async function loadShop(studentName) {
  const snap = await getDoc(shopDoc(studentName));
  return snap.exists() ? snap.data() : null;
}

export function buyShopItem(studentName, itemId, price) {
  return shopWrite(studentName, { spent: increment(price), owned: arrayUnion(itemId) });
}

export function buyShopPack(studentName, cardIds, price) {
  const cards = {};
  for (const id of cardIds) cards[id] = (cards[id] || 0) + 1;
  for (const id of Object.keys(cards)) cards[id] = increment(cards[id]);
  return shopWrite(studentName, { spent: increment(price), cards, packsOpened: increment(1) });
}

/* consume: { cardId: số bản bỏ đi }, gain: id thẻ nhận về. */
export function tradeShopCards(studentName, consume, gain) {
  const cards = {};
  for (const [id, n] of Object.entries(consume)) cards[id] = increment(-n);
  cards[gain] = increment(1);
  return shopWrite(studentName, { cards });
}

/* Giây chơi thử miễn phí đã dùng của một trò vừa mua (js/runner/play-time.js FREE_TRIAL_SEC). */
export function addTrialTime(studentName, gameId, sec) {
  return shopWrite(studentName, { trialSec: { [gameId]: increment(sec) } });
}

export function saveShopEquipped(studentName, equipped) {
  return shopWrite(studentName, { equipped });
}

/* Ảnh đại diện tự tải lên (data URL, null = xoá) + trang bị mới (avatar = 'photo' hoặc đã gỡ). */
export function saveShopPhoto(studentName, photo, equipped) {
  return shopWrite(studentName, { photo, equipped });
}
