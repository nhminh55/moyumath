/* Firebase dùng chung cho các trang mới (các trang cũ vẫn còn bản config riêng — sẽ gom ở Giai đoạn 1/5).
   Nên nạp file này bằng import() động để trang vẫn chạy được khi không tải được SDK. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getFirestore, collection, addDoc, doc, setDoc, getDocs, serverTimestamp,
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
