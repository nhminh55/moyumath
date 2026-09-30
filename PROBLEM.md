# PROBLEM.md — moyumath code review (2026-09-30)

Summary of the problems found and the proposed improvements, written for discussion before fixing. Line numbers refer to commit `f706c73`. Everything about Firestore rules is inferred from client behaviour (the repo has no rules file).

## Status (updated after the refactor, 2026-09-30)

**Fixed** (phases 0–6):
- **B**: all math and grading bugs, including:
  - the common factor is always the GCD;
  - no more 0/±1 coefficients;
  - explanations match the prompts;
  - `num()` is stricter and `"2,5"` is read as a decimal;
  - scores are rounded;
  - expressions are graded by equivalence;
  - Ch2 "Đa thức một biến" (one-variable polynomial) grades out of 1 point, matching `points`.
- **C**:
  - refreshing (F5) keeps the same paper, answers and remaining time; the timer counts down to a deadline;
  - submitting locks the paper; saving has a retry button and an automatic retry; screenshots are capped under 1 MB;
  - fixed the exam-ch2 and practice-ch2 redirects;
  - the reset button can no longer be used to farm stars;
  - grading waits until progress has loaded;
  - total stars come from Firestore and are cleared on logout;
  - problem names no longer include the badge text; Enter only submits from answer inputs.
- **D**: stats are aggregated by problem id and are chapter-aware; the radar and the admin chart work for every chapter.
- **E**: one exam page and one practice page; problem types are tested modules; dead code and old scripts removed.
- **A5–A6**:
  - Firestore data is escaped on index/admin; image `src` only accepts data URLs;
  - `window.__answerKey` and `window.__save*` are gone;
  - `login.html?redirect=` only accepts an internal `.html` page.

**Remaining** (needs its own plan, because existing data must be migrated):
- A1–A4, A7–A8: see section A below. Student login is still checked only in the browser, passwords are stored in plaintext, admin does not check permissions, data is still keyed by `displayName`, and there is no `firestore.rules`.
- `login.html` and `admin.html` still have their own copy of `firebaseConfig`; the inline CSS of index/admin/login has not been moved into files.
- The dashboard and admin still download every submission, including base64 images. Paging requires moving images out of the documents.
- `npm run bump` does not version `import`s inside ES modules, so browsers may use stale files for a while after a deploy.

## A. Security & data integrity (most serious)
1. Student login is checked only in the browser: `login.html:147-150` reads `students/{username}` and compares the plaintext password in JS → the Firestore rules must allow public reads → anyone can fetch every password. `admin.html:961` also displays passwords.
2. The "session" is a localStorage key; `localStorage.setItem('moyumath_displayName','X')` submits work as someone else.
3. Forged scores: `window.__saveSubmission(...)` and `__savePracticeLimit(...)` can be called from devtools; `window.__answerKey` exposes the answers (`exam.html:551`, `exam-ch2.html:555`, `kiemtra...:539`).
4. admin.html only requires "signed in to Firebase Auth" (no admin email/claim check).
5. Stored XSS: `studentName`, `examType`, `score`, `image`, `byQuestion`… are inserted straight into `innerHTML` in `admin.html` (≈605-961) and `index.html:642` → runs in the admin's session.
6. Open redirect via `login.html?redirect=...` (including `javascript:`).
7. Data is keyed by `displayName` (not username) → identical names are merged, renaming loses history, a name containing `/` breaks the path.
8. No `firestore.rules` in the repo.

## B. Grading / problem-generation bugs (directly affect students)
- Ch2 q4 (`js/generators-ch2.js:72-80`): the common factor is NOT the GCD (e.g. k=2, a=2, b=4 → 4x+8, expected answer `2(2x+4)`). Same for part c. The prompt (`logic-ch2.js:221,226`) has no `y`, while the explanation has `y` and a `−` sign → the explanation does not match the prompt.
- Ch2 q5c / q7: coefficients can be 0, 1 or −1 → the expected answer is `0x+5` or `1x^2`, so a student who correctly writes `x^2` is marked wrong. The explanation prints `+ -3`.
- Ch2 q8: the prompt says `+ bx²`, the explanation says `− bx²`.
- Ch2 q7 ("Đa thức một biến"): `maxPoints` = 1.5 but grading gives at most 1 → practice can never exceed 67%, so students can never reach the ≥ 80% star milestone.
- Ch2 expressions are graded by string comparison (`checkMatchExpr`) → `5 + x/3`, `-2+3x`, `2*x` are marked wrong even though they are correct.
- One-period test q5: the prompt asks for "the square roots" and grades ±, but the explanation talks about the principal square root (positive only).
- Ch1 q2: the placeholder is `8 ; -8` but the hint says "separate with commas"; `parseNumberSet` splits `2,5` into 2 and 5.
- `num()` uses `parseFloat` → `"12abc"` is accepted as 12.
- Floating-point score sums (0.1×5, 0.34+0.33+0.33) → displays like 1.9999999.

## C. Exam / practice flow
- exam-ch2.html:9 redirects to `exam.html` (copy-paste).
- F5 = new paper + fresh timer (unlimited time); "Đổi đề" (new paper) / "Làm lại" (redo) reset the timer.
- After grading, inputs are not locked and the button is not disabled → multiple submissions, and answers can be changed after seeing the solutions.
- The timer does `timeLeft--` in setInterval → drifts in background tabs.
- A failed save only logs/toasts, no retry; the html2canvas base64 image is stored in the document → risk of exceeding 1 MB.
- Stars: the Reset button clears the `reward10/20` flags (`practice.html:1368`) → unlimited stars; answering before loading finishes overwrites progress; `moyumath_stars` lives only in localStorage, is not cleared on logout (the next student inherits it), and is never displayed; the legacy migration sets `reward10=true` even when no stars were added.
- Ch2: problem names saved to Firestore include the badge text ("…Kiểm tra 15p").
- Enter inside a `<select>` or the scratchpad also submits.

## D. Stats / dashboard
- index.html aggregates by label and ignores the chapter → Ch2 "Câu 1" is added to Ch1 "Câu 1"; `1T-Câu n` labels match nothing; admin only knows Câu 1–5.
- index/admin download every submission (with base64 images) without paging.
- Ch2 shows "no data yet" even when practice data exists.

## E. Architecture / maintenance
- exam.html ≈ exam-ch2.html (~98%), the one-period test page is nearly the same; practice.html ≈ practice-ch2.html (~90%); ~370 lines of duplicated CSS; `firebaseConfig` duplicated in 8 files.
- render/grade depend on fixed DOM ids and cannot be tested; there are no tests (`npm test` = error).
- Dead code: `showToast`, `ORDER`, `savingProgress`, `CHART_QUESTIONS` (index), a duplicated if-branch in the one-period q3 explanation.

## Proposed roadmap (for discussion)
1. **Quick, low-risk fixes**: ch2 redirect, Ch2 q4/q5/q7/q8 math bugs, one-period q5 explanation, placeholder, score rounding, lock the paper after grading, reset keeps star flags, escape HTML in admin/index, validate the redirect, remove `__answerKey`.
2. **Better expression grading**: a small expression parser in `js/evaluator.js`, equivalence by substituting several x values + a form check (factored / simplified). With Node tests for the evaluator and generators.
3. **Real security**: move students to Firebase Auth (fake email `username@moyumath.local` or custom tokens), paths by `uid`, write `firestore.rules` (students only write their own data, admin by email/claim), hash/do not store plaintext passwords. Requires migrating existing data.
4. **Merge duplicated code**: `js/firebase.js` (config + helpers), `js/exam-shell.js` (timer/submit/save), `js/practice-shell.js` (stars/limits), shared CSS in `css/style.css`; pages keep only configuration (chapter, SOURCES, logic).
5. **Dashboard**: add `chapter` to the stats key, move images out of the documents (Storage, or drop them), use `limit()`/paging.
