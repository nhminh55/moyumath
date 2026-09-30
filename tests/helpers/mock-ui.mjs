/* `ui` giả cho test: render ra HTML tối giản và ghi lại các ô nhập / ô feedback mà module tạo ra,
   để test kiểm tra solve() chỉ dùng ô có thật và mọi part.field đều có chỗ hiển thị. */
export function createMockUi() {
  const inputs = new Map();   // field -> kind
  const feedbacks = new Set();
  const add = (field, kind) => {
    if (inputs.has(field)) throw new Error('Ô nhập bị trùng: ' + field);
    inputs.set(field, kind);
  };
  const ui = {
    blank(field) { add(field, 'text'); return '<input data-field="' + field + '">'; },
    select(field, options) {
      if (!options.length) throw new Error('select rỗng: ' + field);
      add(field, 'select');
      return '<select data-field="' + field + '"></select>';
    },
    checkboxes(field, labels) { add(field, 'checkboxes'); return '<div data-field="' + field + '">' + labels.join(' ') + '</div>'; },
    matching(field, { left, right }) {
      add(field, 'matching');
      for (const it of left) feedbacks.add(field + '.' + it.id);
      return '<div data-field="' + field + '">' + [...left, ...right].map((x) => x.marker + ' ' + x.html).join(' ') + '</div>';
    },
    feedback(field) {
      if (feedbacks.has(field)) throw new Error('Ô feedback bị trùng: ' + field);
      feedbacks.add(field);
      return '<div data-fb="' + field + '"></div>';
    },
    hint(text) { return '<span class="hint">' + text + '</span>'; },
  };
  return { ui, inputs, feedbacks };
}
