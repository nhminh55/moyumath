/* Hiển thị một dạng bài trong trình duyệt: cung cấp `ui` thật cho problem.render(), rồi thu đáp án,
   khôi phục đáp án, tô ✓/✗ theo kết quả grade(), khoá ô nhập, chèn lời giải.
   Tất cả id đều có tiền tố `ns` nên nhiều câu trên cùng một trang không đụng nhau. */
import { round2 } from '../core/grading.js';
import { escapeAttr } from '../core/escape.js';
import { initMatching } from './matching.js';

/* 1.5 → "1,5" (hiển thị kiểu Việt Nam). */
export function fmtPoints(x) {
  return String(round2(x)).replace('.', ',');
}

function createUi(ns) {
  const fid = (f) => ns + '-' + String(f).replace(/[^\w-]/g, '_');
  const attrs = (field) => ' id="' + fid(field) + '" data-field="' + escapeAttr(field) + '"';
  return {
    blank(field, { width, placeholder } = {}) {
      return '<input type="text" class="blank" autocomplete="off" autocapitalize="off" spellcheck="false"' + attrs(field) +
        (width ? ' style="width:' + Number(width) + 'px;"' : '') +
        (placeholder ? ' placeholder="' + escapeAttr(placeholder) + '"' : '') + '>';
    },
    /* Chọn một đáp án: các nút radio hiện sẵn mọi lựa chọn (không dùng <select> — khó xem hết lựa chọn). */
    radios(field, options) {
      return '<div class="checkbox-grid" data-kind="radios" role="radiogroup"' + attrs(field) + '>' +
        options.map((o) => '<label class="chk"><input type="radio" name="' + fid(field) + '" value="' + escapeAttr(o.value) + '">' +
          o.label + '</label>').join('') + '</div>';
    },
    checkboxes(field, labels) {
      return '<div class="checkbox-grid" data-kind="checkboxes"' + attrs(field) + '>' +
        labels.map((l, i) => '<label class="chk"><input type="checkbox" data-idx="' + i + '">' + l + '</label>').join('') + '</div>';
    },
    matching(field, { left, right }) {
      const item = (it, side) => '<div class="match-item" tabindex="0" data-id="' + escapeAttr(it.id) + '">' +
        (side === 'right' ? '<span class="dot"></span>' : '') +
        '<span class="match-marker">' + it.marker + '</span><span class="match-text">' + it.html + '</span>' +
        (side === 'left' ? '<span class="dot"></span>' : '') + '</div>';
      return '<div class="matching-widget" data-kind="matching"' + attrs(field) + '>' +
        '<div class="match-col match-left">' + left.map((it) =>
          item(it, 'left') + '<div class="feedback" data-fb="' + escapeAttr(field + '.' + it.id) + '"></div>').join('') + '</div>' +
        '<div class="match-col match-right">' + right.map((it) => item(it, 'right')).join('') + '</div>' +
        '<svg class="match-lines" aria-hidden="true"></svg></div>';
    },
    feedback(field, { inline = false } = {}) {
      const tag = inline ? 'span' : 'div';
      return '<' + tag + ' class="feedback" data-fb="' + escapeAttr(field) + '"></' + tag + '>';
    },
    hint(text) {
      return '<span class="hint">' + text + '</span>';
    },
  };
}

export function mountQuestion(container, problem, params, ns) {
  container.innerHTML = problem.render(params, createUi(ns));
  const widgets = new Map();
  container.querySelectorAll('[data-kind="matching"]').forEach((el) => widgets.set(el.dataset.field, initMatching(el)));
  const fieldEls = () => [...container.querySelectorAll('[data-field]')];
  const byField = (f) => container.querySelector('[data-field="' + CSS.escape(f) + '"]');

  function collect() {
    const out = {};
    for (const el of fieldEls()) {
      const f = el.dataset.field;
      if (el.dataset.kind === 'checkboxes') {
        out[f] = [...el.querySelectorAll('input[type=checkbox]')].filter((b) => b.checked).map((b) => Number(b.dataset.idx));
      } else if (el.dataset.kind === 'matching') {
        out[f] = widgets.get(f).get();
      } else if (el.dataset.kind === 'radios') {
        out[f] = el.querySelector('input:checked')?.value ?? '';
      } else {
        out[f] = el.value;
      }
    }
    return out;
  }

  function restore(answers) {
    if (!answers) return;
    for (const el of fieldEls()) {
      const v = answers[el.dataset.field];
      if (v === undefined) continue;
      if (el.dataset.kind === 'checkboxes') {
        el.querySelectorAll('input[type=checkbox]').forEach((b) => { b.checked = v.includes(Number(b.dataset.idx)); });
      } else if (el.dataset.kind === 'matching') {
        widgets.get(el.dataset.field).set(v);
      } else if (el.dataset.kind === 'radios') {
        el.querySelectorAll('input').forEach((b) => { b.checked = b.value === String(v); });
      } else {
        el.value = v;
      }
    }
  }

  function clearResult() {
    container.querySelectorAll('.feedback').forEach((f) => { f.className = 'feedback'; f.innerHTML = ''; });
    container.querySelectorAll('.marked-correct, .marked-wrong').forEach((x) => x.classList.remove('marked-correct', 'marked-wrong'));
  }

  function clearAnswers() {
    restore(Object.fromEntries(fieldEls().map((el) => [el.dataset.field,
      el.dataset.kind === 'checkboxes' ? [] : el.dataset.kind === 'matching' ? {} : ''])));
    clearResult();
  }

  function showResult(result) {
    clearResult();
    for (const p of result.parts) {
      const fb = container.querySelector('[data-fb="' + CSS.escape(p.field) + '"]');
      if (fb) {
        const notes = p.correct
          ? [p.note, '+' + fmtPoints(p.earned) + ' điểm']
          : [p.note, p.expected && 'Đáp án: ' + p.expected, p.earned > 0 && '(' + fmtPoints(p.earned) + ' điểm)'];
        const note = notes.filter(Boolean).join(' · ');
        fb.className = 'feedback show ' + (p.correct ? 'correct' : 'wrong');
        fb.innerHTML = '<span class="mark">' + (p.correct ? '✓' : '✗') + '</span>' + (note ? '<span class="note">' + note + '</span>' : '');
      }
      for (const [f, ok] of Object.entries(p.marks || {})) {
        const el = byField(f);
        /* Nhóm radio: tô lựa chọn đã chọn (chưa chọn gì thì chỉ có feedback). */
        (el?.dataset.kind === 'radios' ? el.querySelector('.chk:has(input:checked)') : el)?.classList.add(ok ? 'marked-correct' : 'marked-wrong');
      }
      if (p.expectedChecked) {
        byField(p.field)?.querySelectorAll('.chk').forEach((label) => {
          const box = label.querySelector('input');
          const should = p.expectedChecked.includes(Number(box.dataset.idx));
          label.classList.add(box.checked === should ? 'marked-correct' : 'marked-wrong');
        });
      }
    }
  }

  function setDisabled(v) {
    container.querySelectorAll('input').forEach((el) => { el.disabled = v; });
    widgets.forEach((w) => w.setDisabled(v));
  }

  /* Lời giải từng bước: `content` là mảng HTML (mỗi phần tử một bước) hoặc một chuỗi (một bước).
     Mỗi lần bấm nút hiện thêm một bước; hiện đủ rồi thì nút thành "Ẩn lời giải". */
  function showExplanation(content) {
    if (container.querySelector('.explain-box')) return;
    const steps = (Array.isArray(content) ? content : [content]).filter(Boolean);
    if (!steps.length) return;
    const box = document.createElement('div');
    box.className = 'explain-box';
    box.hidden = true;
    box.setAttribute('aria-live', 'polite');
    box.innerHTML = '<strong>Lời giải:</strong>';
    const actions = document.createElement('div');
    actions.className = 'explain-actions';
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'explain-link';
    const all = document.createElement('button');
    all.type = 'button';
    all.className = 'explain-link';
    all.textContent = 'Xem tất cả';
    actions.append(next, all);
    let shown = 0;

    function refresh() {
      if (box.hidden) next.textContent = 'Xem lời giải';
      else if (shown < steps.length) next.textContent = 'Bước tiếp theo (' + (shown + 1) + '/' + steps.length + ')';
      else next.textContent = 'Ẩn lời giải';
      all.hidden = steps.length < 2 || shown >= steps.length;
    }

    function reveal(upTo) {
      let last = null;
      for (; shown < upTo; shown++) {
        last = document.createElement('div');
        last.className = 'explain-step';
        last.innerHTML = steps[shown];
        box.append(last);
      }
      box.hidden = false;
      refresh();
      last?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    next.addEventListener('click', () => {
      if (box.hidden) reveal(Math.max(shown, 1));
      else if (shown < steps.length) reveal(shown + 1);
      else { box.hidden = true; refresh(); }
    });
    all.addEventListener('click', () => reveal(steps.length));
    refresh();
    container.append(box, actions);
  }

  function removeExplanation() {
    container.querySelectorAll('.explain-actions, .explain-box').forEach((x) => x.remove());
  }

  return { collect, restore, clearAnswers, clearResult, showResult, setDisabled, showExplanation, removeExplanation,
    redraw: () => widgets.forEach((w) => w.redraw()) };
}
