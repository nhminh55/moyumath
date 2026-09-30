/* localStorage / sessionStorage an toàn: trình duyệt chặn lưu trữ (chế độ riêng tư, iframe...)
   thì đọc trả về null và ghi bị bỏ qua, trang vẫn chạy. */
function wrap(getStore) {
  const store = () => { try { return getStore(); } catch { return null; } };
  return {
    get(key) {
      try { return store()?.getItem(key) ?? null; } catch { return null; }
    },
    set(key, value) {
      try { store()?.setItem(key, value); } catch { /* bỏ qua */ }
    },
    remove(key) {
      try { store()?.removeItem(key); } catch { /* bỏ qua */ }
    },
    getJSON(key) {
      try { return JSON.parse(this.get(key)); } catch { return null; }
    },
    setJSON(key, value) {
      this.set(key, JSON.stringify(value));
    },
  };
}

export const local = wrap(() => window.localStorage);
export const session = wrap(() => window.sessionStorage);
