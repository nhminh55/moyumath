# CLAUDE.md — moyumath

Web app for practicing and taking Grade 7 Math tests (Chapters 1–3 done, Chapter 4 up to 4.1 — the midterm I scope). Static HTML/CSS/JS with native ES modules, no build step (serve over HTTP, not `file://`). Data lives in Firebase Firestore (config in `js/core/firebase.js`; `login.html` and `admin.html` still have their own inline copy).

Reply in English, and write all Markdown files in English (Vietnamese is fine for UI strings shown to students). Don't ask trivial questions; ask only when a key requirement is missing.

## Finding code (save tokens)

- For structure/code-flow questions, use `graphify query "<question>"`, `graphify path "<A>" "<B>"`, `graphify explain "<concept>"` BEFORE grep/Read (the hooks in `.claude/settings.json` will remind you).
- Read/grep raw files only if the graph is missing or wrong. Read `graphify-out/GRAPH_REPORT.md` only for a broad overview.
- After editing code, run `graphify update .`

## Structure

| File | Role |
|---|---|
| `login.html` | Login (user/pass in `localStorage`) |
| `index.html` + `js/pages/index-page.js` | Homepage: continue-learning hero, chapter learning path, tests list, today's study goal, quick stats, test history, suggestions, shop card, topic radar |
| `exam.html` + `js/runner/exam-page.js` | The only exam runner: `exam.html?preset=<id>` (alias `?type=15m&chapter=2`) |
| `practice.html` + `js/runner/practice-page.js` | The only practice runner: `practice.html?chapter=N&problem=<id>` (legacy `?q=` works). Layout: app sidebar (icon rail < 1440px) · collapsible topic list (`#tocToggle`; state in `localStorage.moyumath_toc` on wide screens; ≤ 1100px starts collapsed and opens as an overlay) · white worksheet |
| `admin.html` | Teacher dashboard |
| `shop.html` + `js/pages/shop-page.js` | Tiệm Phép Thuật (reward shop): spend ⭐ on titles/badges, avatar frames, UI themes, celebration effects, 15⭐ mystery card packs; catalog & rules in `js/runner/shop.js` (pure). Layout: app sidebar · header + ⭐ balance · avatar strip · segmented tabs · item cards directly on the page background |
| `review.html` + `js/pages/review-page.js` | Review hub `review.html?id=<id>`: each item of a review sheet links to its practice types + a mock exam (content in `config/reviews.json`) |
| `config/presets.json` | Exam matrix: fixed `items` or random `sections` (pool by chapter/topic, count, difficulty ratio) |
| `curriculum/chapter-N/*.js` | One problem type per file (see `curriculum/README.md`); registered in `chapter-N/index.js`; `_*.js` are helpers |
| `js/core/` | `evaluator.js` (answer parsing/equivalence), `mathfmt.js`, `rng.js` (seeded), `grading.js`, `firebase.js`, `auth.js`, `storage.js`, `escape.js` |
| `js/ui/` | `skin.js` (Tối/Sáng skin switch), `question-view.js` (the `ui` given to `render`, collect/show results), `matching.js`, `timer.js`, `toast.js`, `sound.js` (Web Audio effects + mute toggle), `confetti.js`, `study-timer.js` (daily study-time pill on practice/exam), `cosmetics.js` (equipped shop items: theme, framed avatar, title/badges, wallet loader), `avatar-upload.js` (crop/resize an uploaded avatar photo to a 128px JPEG data URL), `dialog.js` (`holdFocus`: focus in/trap/Esc/restore for modals — star modal, shop modal) |
| `js/runner/` | `registry.js` (lookup + legacy label/key mapping), `preset-resolver.js`, `stars.js`, `stats.js`, `study-time.js` (daily goals, streak — pure), `shop.js` (shop catalog, cards, buy/pack/trade/equip rules — pure) |
| `js/scratchpad.js` | Scratchpad (classic script, loaded before the page module; used by practice + exam): wraps `.sheet` in a split with a drag resizer; sticky side panel on desktop, bottom sheet (drag the header) ≤ 820px. Panel = header with × · light grid paper (scrolls both ways, strokes in absolute px) · one-row bottom toolbar (pen, eraser, color dot → popover with colors + pen-size (1–12px) and eraser-size (8–40px) sliders, also opened by tapping the active pen/eraser again; undo/redo, more paper, clear; long-press shows labels on touch). Input: mouse/pen draw (pen pressure), fingers draw only until a pen is seen, then they scroll (persists; never expires — reset via "✋ Cho phép dùng ngón tay để viết lại" in the color-dot popover, shown only in pen mode). `window.clearScratchpad()` = undoable fresh page. Fires `scratchpad:toggle` on the container; open/width/sheet height/pen mode/pen + eraser size in `localStorage.moyumath_scratchpad` |
| `css/app-shell.css` + `js/ui/app-nav.js` | Shared app shell for index/practice/shop: sidebar, icon rail (≤ 1024px, or ≤ 1439px with `.app--compact`), mobile drawer (☰ `#navToggle`) |
| `css/style.css`, `css/components.css`, `css/pages/*.css` | Tokens/base (night skin, `.primary`/`.secondary`/`.choice`, `.math-deco` stars, `.mascot`), shared components, per-page styles (`index.css` = dashboard) |
| `img/moyu-owl.svg` | Owl mascot (login, dashboard hero, practice placeholder, star modal) |
| `css/themes.css`, `css/cosmetics.css` | Shop themes (`<html data-theme>` token overrides; not loaded by `exam.html`), avatar frames/titles/badges |
| `tests/*.test.mjs` | `npm test` (Node built-in runner, no dependencies) |
| `.nojekyll` | Required: without it GitHub Pages (Jekyll) hides `curriculum/**/_*.js` and every page breaks |
| `scripts/bump.js` | `npm run bump`: bumps `?v=` on CSS/JS referenced from HTML (not on `import`s inside modules) |

## Problem modules

- Interface: `id`, `chapter`, `topic`, `title`, `shortTitle?`, `points`, `difficulties`, `practice?`, `legacy?`, and pure functions `generate({rng})`, `render(params, ui)`, `grade(params, answers)`, `solve(params)`, `describe?(params)`, `explain(params)` (returns an array of HTML steps, revealed one per click after grading; a string = one step). No DOM/Firebase/`window` inside modules.
- Never change an existing `id` or `legacy` entry: they key Firestore stats and star progress.
- Adding a weekly type = new file + one line in `chapter-N/index.js` + `npm test` (runs 1000 seeds per type; `grade(solve())` must equal `points`).

## Firestore & practice

- Test results: `Đã làm/{displayName}/bài làm`; practice: `Đã làm/{displayName}/luyện tập`.
- New docs keep the legacy fields (`score`, `byQuestion` keyed by old labels, `examType`, `chapter`) and add `byProblem` (+ `presetId`, `seed` for exams). Dashboards read both through `js/runner/stats.js`.
- Progress/reward flags: `giới hạn luyện tập/{key}` where key = `legacy.practiceKey` or the problem id; fields `attempts`, `scores`, `answerStars`, `reward10`, `reward10Amount`, `reward20`, `reward20Amount`.
- Don't change the data structure unless the task requires it.
- Stars (rules in `js/runner/stars.js`; total derived from Firestore and cached in `moyumath_stars`), per question type:
  - Each correctly graded part (`part.correct`) of a practice attempt: +1⭐, no limit (accumulated in `answerStars`, never reset).
  - 10-attempt milestone: +5⭐; 20-attempt milestone: +10⭐ — always, regardless of score; each milestone is awarded once.
  - Milestone stars are computed from the `reward10`/`reward20` flags, not the stored amounts (old docs with 2⭐/0⭐ under the previous rules now count 5/10).
  - The "Luyện lại từ đầu" (start over) button resets attempts/scores but keeps earned stars (a milestone is never awarded twice).
- Shop (Tiệm Phép Thuật): `Đã làm/{displayName}/tiệm phép thuật/kho` = `{ spent, owned[], equipped{title,badges[],frame,theme,effect,avatar}, cards{id:count}, packsOpened, photo }`. `photo` = the student's own uploaded avatar (free; small JPEG data URL validated by `isPhotoDataUrl`), shown when `equipped.avatar === 'photo'`. Balance = earned (practice stars + study-time stars, never stored) − `spent`; writes use `increment`/`arrayUnion`, and every spend reloads the doc + earned stars first. `localStorage.moyumath_cosmetics` is only a render cache (theme applied in each themed page's `<head>`). Never rename item/card ids.
- Study time: `Đã làm/{displayName}/thời gian học/{YYYY-MM-DD}` with `practiceSec`/`examSec` (added via `increment()`) and `goal15`/`goal30`/`goal60` = stars earned at that daily checkpoint (15′ +5⭐, 30′ +15⭐, 60′ +35⭐, rules in `js/runner/study-time.js`). Counted only while the tab is visible and the student interacted in the last 3 min (or an exam is running); unsaved seconds wait in `localStorage.moyumath_study`. These stars are added to the practice-page star total.

## UI

- Skins (free, per device): `light` (default) or `night`, toggled by any `[data-skin-toggle]` button (`js/ui/skin.js`, stored in `localStorage.moyumath_skin`, applied as `<html data-skin>` in each page's `<head>`). A shop theme (`data-theme`) overrides the skin. Light = neutral `#F7F8FC` bg, white cards; night = neutral charcoal (`#101116` bg, `#181A21` cards, `#2A2F3A` borders) — never a purple foundation; indigo is only the accent, green = done, amber = reward.
- The practice/exam `.sheet` in night skin (no shop theme) and `admin.html` (`<html class="paper-light">`) use the light token set, so problem text stays dark-on-white.
- Tokens (`css/style.css`): `--bg`, `--paper`/`--panel` (card), `--surface-2` (inner tile), `--ink`/`--ink-soft`/`--graphite` (text), `--gold` (accent for fills/borders/charts), `--gold-soft` (selected/hero tint), `--accent-ink` (accent as **text** — never use `--gold` for text), `--btn-bg` (primary button, white text ≥ 4.5:1), `--success`/`--warning`/`--danger` (+ `--pen-green`/`--warning-ink`/`--pen-red` for text), `--sun`/`--amber` (stars), `--radius` 16 / `--radius-sm` 12 / `--radius-btn` 8, `--shadow-card` (subtle). Page CSS must use tokens (tint with `color-mix`) so both skins and shop themes keep working; keep text ≥ 4.5:1.
- Fonts: `Be Vietnam Pro` (`--font-display`/`--font-button`: headings, buttons, numbers, nav), `Inter` (body/UI text), `Lora` (problem text), `Caveat` (scores). Pages load all from one Google Fonts link.
- Buttons: `.primary` (solid indigo, 8px radius, white text), `.secondary` (ghost: transparent + 1px border); selectable cards follow `.choice` (1px border, indigo border + `--gold-soft` when active). Avoid gradients, glows and nested cards.
- Homepage (`index.html` + `css/pages/index.css`): sidebar app shell (rail ≤ 1024px, drawer ≤ 768px), hierarchy Tiếp tục học → Hành trình học tập + Mục tiêu hôm nay → Kiểm tra / Thống kê / Lịch sử → Gợi ý / Tiệm / Hồ sơ năng lực; below 1180px the two columns become one ordered flow. Chapter progress = `chapterProgress()` (each practice type counts up to `BASE_GOAL` attempts), "continue" target = `lastPracticed()` — both pure, in `js/runner/stats.js`.
- Never use a dropdown (`<select>`) for an answer: single choice = `ui.radios` (radio buttons), multiple = `ui.checkboxes` (see `curriculum/README.md`).
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