# CLAUDE.md — moyumath

Web app for practicing and taking Grade 7 Math tests (Chapters 1 and 2 done). Static HTML/CSS/JS, no build step. Data lives in Firebase Firestore (`firebaseConfig` is inline in each HTML file).

Reply in Vietnamese. Don't ask trivial questions; ask only when a key requirement is missing.

## Finding code (save tokens)

- For structure/code-flow questions, use `graphify query "<question>"`, `graphify path "<A>" "<B>"`, `graphify explain "<concept>"` BEFORE grep/Read (the hooks in `.claude/settings.json` will remind you).
- Read/grep raw files only if the graph is missing or wrong. Read `graphify-out/GRAPH_REPORT.md` only for a broad overview.
- Don't read all of `DONE.md` (it's long); read only the first ~30 lines when needed.
- After editing code, run `graphify update .`

## Structure

| File | Role |
|---|---|
| `login.html` | Login (user/pass in `localStorage`) |
| `index.html` | Dashboard: stats, 5-topic radar, history, feedback |
| `exam.html` / `exam-ch2.html` | 15-min test, Ch1 (`QuizLogic`) / Ch2 (`QuizLogicCh2`) |
| `kiemtra-1tiet-chuong1.html` | Ch1 one-period test (`Test1Tiet`) |
| `practice.html` / `practice-ch2.html` | Practice by question type |
| `admin.html` | Teacher dashboard |
| `js/generators-ch1.js`, `js/generators-ch2.js` | Question generation (pure, must NOT touch the DOM) |
| `js/evaluator.js` | Normalize & compare answers (`^`/Unicode superscripts, `x`/`×`/`*`, `,`/`.` decimals, Unicode minus) |
| `logic.js`, `logic-1tiet.js`, `logic-ch2.js` | `window.QuizLogic` / `Test1Tiet` / `QuizLogicCh2`: `gen`, `render` (into `#q{n}-body`), `grade` |
| `js/scratchpad.js` | Scratchpad |
| `css/style.css` | Shared styles |

`fix_*.py`, `redesign.py`, `revert_font.py` are one-off scripts; ignore them.

## Script loading order (keep as is)

`generators-chN.js` → `evaluator.js` → `logic*.js` → `scratchpad.js` → page-specific script. Check module dependencies before changing this.

## Firestore & practice

- Test results: `Đã làm/{displayName}/bài làm`; practice: `Đã làm/{displayName}/luyện tập`.
- Reward flags: `giới hạn luyện tập/{key}` with `reward10`, `reward20`.
- Don't change the data structure unless the task requires it.
- Each question type's `<label>` must MATCH EXACTLY between the test files and `SOURCES[...].label` in `practice*.html` (so `index.html` can aggregate scores for the 5-topic radar).
- Stars (`moyumath_stars`), max 2 milestones per question type:
  - 10-attempt milestone: +5⭐.
  - 20-attempt milestone: avg of last 10 attempts ≥ 80% → +5⭐, otherwise +2⭐.
  - Avg of last 10 attempts < 50%: no reward; reset `attempts` and `scores` for that type and restart the cycle.

## UI

- Tokens: `--paper`, `--ink`, `--pen-red`, `--pen-green`, `--gold` (in `css/style.css`). Pages with their own `<style>` must still use the same tokens.
- Fonts: `Lora` (problem text), `Inter` (UI), `Caveat` (scores).
- Answer input `.blank`; feedback `.feedback.correct` / `.feedback.wrong`. Reuse them; don't create new classes.

## Workflow

1. Make the smallest possible change; keep the architecture and inter-module APIs; don't touch unrelated files.
2. After coding: `graphify update .`
3. For a new feature or major structural/logic change, add a NEW entry at the TOP of `DONE.md` (date, 1–3 lines of changes, related files).
4. Review `git status` + `git diff`, commit only relevant files, then commit and push to GitHub.

## Reading documents (PDF/DOCX/PPTX/XLSX)

- Prefer `markitdown <file>` to convert to Markdown; don't commit intermediate files, don't modify source files, don't install extra dependencies on your own.
- If the content depends on layout/images/charts, or the PDF is scanned: inspect the original file directly; don't trust empty or incomplete MarkItDown output.
- Teachers' source materials are in `resources/`.