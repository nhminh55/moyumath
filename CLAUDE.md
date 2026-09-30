# CLAUDE.md — moyumath

Web app for practicing and taking Grade 7 Math tests (Chapters 1 and 2 done). Static HTML/CSS/JS with native ES modules, no build step (serve over HTTP, not `file://`). Data lives in Firebase Firestore (config in `js/core/firebase.js`; `login.html` and `admin.html` still have their own inline copy).

Reply in Vietnamese. Don't ask trivial questions; ask only when a key requirement is missing.

## Finding code (save tokens)

- For structure/code-flow questions, use `graphify query "<question>"`, `graphify path "<A>" "<B>"`, `graphify explain "<concept>"` BEFORE grep/Read (the hooks in `.claude/settings.json` will remind you).
- Read/grep raw files only if the graph is missing or wrong. Read `graphify-out/GRAPH_REPORT.md` only for a broad overview.
- After editing code, run `graphify update .`

## Structure

| File | Role |
|---|---|
| `login.html` | Login (user/pass in `localStorage`) |
| `index.html` + `js/pages/index-page.js` | Dashboard: stats, per-chapter topic radar, history, suggestions |
| `exam.html` + `js/runner/exam-page.js` | The only exam runner: `exam.html?preset=<id>` (alias `?type=15m&chapter=2`) |
| `practice.html` + `js/runner/practice-page.js` | The only practice runner: `practice.html?chapter=N&problem=<id>` (legacy `?q=` works) |
| `admin.html` | Teacher dashboard |
| `config/presets.json` | Exam matrix: fixed `items` or random `sections` (pool by chapter/topic, count, difficulty ratio) |
| `curriculum/chapter-N/*.js` | One problem type per file (see `curriculum/README.md`); registered in `chapter-N/index.js`; `_*.js` are helpers |
| `js/core/` | `evaluator.js` (answer parsing/equivalence), `mathfmt.js`, `rng.js` (seeded), `grading.js`, `firebase.js`, `auth.js`, `storage.js`, `escape.js` |
| `js/ui/` | `question-view.js` (the `ui` given to `render`, collect/show results), `matching.js`, `timer.js`, `toast.js` |
| `js/runner/` | `registry.js` (lookup + legacy label/key mapping), `preset-resolver.js`, `stars.js`, `stats.js` |
| `js/scratchpad.js` | Scratchpad (classic script, loaded before the page module) |
| `css/style.css`, `css/components.css`, `css/pages/*.css` | Tokens/base, shared components, per-page styles |
| `tests/*.test.mjs` | `npm test` (Node built-in runner, no dependencies) |
| `scripts/bump.js` | `npm run bump`: bumps `?v=` on CSS/JS referenced from HTML (not on `import`s inside modules) |

## Problem modules

- Interface: `id`, `chapter`, `topic`, `title`, `shortTitle?`, `points`, `difficulties`, `practice?`, `legacy?`, and pure functions `generate({rng})`, `render(params, ui)`, `grade(params, answers)`, `solve(params)`, `describe?(params)`, `explain(params)`. No DOM/Firebase/`window` inside modules.
- Never change an existing `id` or `legacy` entry: they key Firestore stats and star progress.
- Adding a weekly type = new file + one line in `chapter-N/index.js` + `npm test` (runs 1000 seeds per type; `grade(solve())` must equal `points`).

## Firestore & practice

- Test results: `Đã làm/{displayName}/bài làm`; practice: `Đã làm/{displayName}/luyện tập`.
- New docs keep the legacy fields (`score`, `byQuestion` keyed by old labels, `examType`, `chapter`) and add `byProblem` (+ `presetId`, `seed` for exams). Dashboards read both through `js/runner/stats.js`.
- Progress/reward flags: `giới hạn luyện tập/{key}` where key = `legacy.practiceKey` or the problem id; fields `attempts`, `scores`, `reward10`, `reward10Amount`, `reward20`, `reward20Amount`.
- Don't change the data structure unless the task requires it.
- Stars (rules in `js/runner/stars.js`; total derived from Firestore and cached in `moyumath_stars`), max 2 milestones per question type:
  - 10-attempt milestone: +5⭐.
  - 20-attempt milestone: avg of last 10 attempts ≥ 80% → +5⭐, otherwise +2⭐.
  - Avg of last 10 attempts < 50%: no reward; reset `attempts` and `scores` for that type and restart the cycle.
  - "Luyện lại từ đầu" resets attempts/scores but keeps earned stars (a milestone is never awarded twice).

## UI

- Tokens: `--paper`, `--ink`, `--pen-red`, `--pen-green`, `--gold` (in `css/style.css`). Page CSS must still use the same tokens.
- Fonts: `Lora` (problem text), `Inter` (UI), `Caveat` (scores).
- Answer input `.blank`; feedback `.feedback.correct` / `.feedback.wrong` (created by `ui.blank` / `ui.feedback`). Reuse them; don't create new classes.
- Escape any Firestore/user value before putting it into HTML (`js/core/escape.js`).

## Workflow

1. Make the smallest possible change; keep the architecture and inter-module APIs; don't touch unrelated files.
2. Run `npm test`; for UI changes also open the page on a local HTTP server.
3. After coding: `graphify update .`
4. Review `git status` + `git diff`, commit only relevant files, then commit and push to GitHub.

## Reading documents (PDF/DOCX/PPTX/XLSX)

- Prefer `markitdown <file>` to convert to Markdown; don't commit intermediate files, don't modify source files, don't install extra dependencies on your own.
- If the content depends on layout/images/charts, or the PDF is scanned: inspect the original file directly; don't trust empty or incomplete MarkItDown output.
- Teachers' source materials are in `resources/`.