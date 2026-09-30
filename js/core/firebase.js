/* Firebase dùng chung cho các trang mới (các trang cũ vẫn còn bản config riêng — sẽ gom ở Giai đoạn 1/5).
   Nên nạp file này bằng import() động để trang vẫn chạy được khi không tải được SDK. */
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

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
