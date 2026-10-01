# curriculum/ — problem types

Each problem type is one ES module file in `curriculum/chapter-N/`. A module contains only the math: problem generation, the HTML template, grading and the worked solution. Modules must not touch the DOM, Firebase or `window`. The runners (`js/runner/`) handle display, collecting answers, marking ✓/✗ and saving results.

## Adding a new problem type

1. Create `curriculum/chapter-N/<problem-name>.js`; you can copy the template below.
2. Add one `import` line and one entry to the `problems` array in `curriculum/chapter-N/index.js`. The order of that array is the "Dạng 1, 2, ..." (type 1, 2, ...) order on the practice page.
3. Run `npm test`. It generates 1000 problems per type and checks that:
   - the model answer from `solve()` earns full `points`, and a blank answer earns 0;
   - the parts' maximum scores add up to `points`;
   - every `part.field` has a matching `ui.feedback`;
   - the explanation contains no `undefined` or `NaN`;
   - the file is registered in `index.js`.
4. If the type is used in an exam, add it to `config/presets.json`.

New chapter: create `curriculum/chapter-N/index.js` (with `chapter`, `title`, `topics`, `problems`), then add the chapter to `curriculum/index.js`.

Files whose names start with `_` (e.g. `_matching-shared.js`) are shared helpers. They are not problem types, so they are not registered in `index.js`. GitHub Pages only serves these files because of the `.nojekyll` file in the repo root, so never delete `.nojekyll`.

## Interface

```js
import { num, sameNumber } from '../../js/core/evaluator.js';
import { part } from '../../js/core/grading.js';

export default {
  id: 'ch3.example',          // NEVER change: used as the stats and Firestore key
  chapter: 3,
  topic: '3.1',               // an id from `topics` in chapter-3/index.js (a radar axis)
  title: 'Problem type name',
  shortTitle: 'Short name',   // (optional) shown on the practice card: "Dạng N · Short name"
  points: 1,                  // = sum of the parts' `max` when grading
  difficulties: ['medium'],
  practice: true,             // false = exam-only, hidden from the practice page
  legacy: undefined,          // only for types ported from the old code (old Firestore labels and keys)

  /* Generate the problem parameters. Must be PURE: use only `rng` (never Math.random) and return JSON-serializable data. */
  generate({ rng, difficulty }) {
    const a = rng.int(2, 9), b = rng.int(2, 9);
    return { a, b };
  },

  /* HTML template. Create inputs only through `ui`; the runner assigns their ids. */
  render(p, ui) {
    return '<div class="sub">' + p.a + ' + ' + p.b + ' = ' + ui.blank('s', { width: 80 }) + ui.feedback('s') + '</div>';
  },

  /* Grading. PURE: answers = { [field]: value } collected by the runner. */
  grade(p, answers) {
    return { parts: [part('s', sameNumber(num(answers.s), p.a + p.b), 1, String(p.a + p.b))] };
  },

  /* Model answer, used by the tests: grade(p, solve(p)) must earn full marks. */
  solve(p) {
    return { s: String(p.a + p.b) };
  },

  /* (Optional) One-line description of the problem, saved in wrongDetails so the teacher can see what a student got wrong. */
  describe(p) {
    return p.a + ' + ' + p.b;
  },

  /* Worked solution: an array of steps (HTML each). After grading, the student reveals one step per click
     on the explain button ("Xem lời giải" → "Bước tiếp theo (k/n)"), or all at once ("Xem tất cả").
     Use one step per sub-question (a, b, c…) or per "Bước"; a plain string is also accepted (a single step). */
  explain(p) {
    return [
      '<p><b>Bước 1 — Cộng hàng đơn vị, rồi hàng chục…</b></p>',
      '<p>' + p.a + ' + ' + p.b + ' = <b>' + (p.a + p.b) + '</b></p>',
    ];
  },
};
```

### `rng` (from `js/core/rng.js`)
`int(min, max)`, `pick(arr)`, `shuffle(arr)`, `intExcept(min, max, [excluded])`, `next()`. The same seed always gives the same problem.

### `ui` (provided by the runner)

| Function | Value in `answers[field]` |
|---|---|
| `ui.blank(field, { width, placeholder })` | the string the student typed |
| `ui.radios(field, [{ value, label }])` | the chosen `value` (or `''`) |
| `ui.checkboxes(field, labels)` | array of the ticked indices |
| `ui.matching(field, { left: [{ id, marker, html }], right: [...] })` | `{ [leftId]: rightId }`; feedback slots are created automatically as `field + '.' + leftId` |
| `ui.feedback(field, { inline })` | where ✓/✗ is shown for `part.field` |
| `ui.hint(text)` | (display only) |

**No dropdowns.** Never use a `<select>` / dropdown list for an answer: students can't see all the choices at once. For "pick one of these" use `ui.radios` (every option is visible as a radio button); for "pick all that apply" use `ui.checkboxes`. There is no `ui.select`, so a module that calls it fails `npm test`.

`marks: { [field]: true|false }` on a `ui.radios` field colours the option the student picked.

### Grading results (from `js/core/grading.js`)
- `part(field, correct?, points, answer shown when wrong, extra)`
- `partial(field, points earned, max points, answer, extra)`

`extra` can contain:
- `marks: { [inputField]: true|false }` to colour individual inputs;
- `expectedChecked: [...]` for `ui.checkboxes`;
- `hits`, the number of correct sub-answers in a part that bundles several answers without `marks` (each correct `marks` entry / hit / fully correct part = +1⭐ in practice, see `correctCount`);
- `note`, a note that is always shown.

### Comparing answers (from `js/core/evaluator.js`)

| Function | Use for |
|---|---|
| `num`, `sameNumber` | a single number. Accepts `3,5`, `−4`; rejects `12abc` |
| `parseNumberSet`, `sameNumberSet` | several answers separated by `;` or `, ` |
| `parseFactorization`, `factorizationMatches` | prime factorization |
| `equivalent(input, expected)` | two expressions with equal value (`5 + x/3` ≡ `x/3 + 5`) |
| `isFactoredBy(input, factor)` | the "factor × (…)" form |
| `polynomialMatches(input, [[coefficient, degree], ...])` | a simplified polynomial, terms in any order |

Display: use `js/core/mathfmt.js` (`sup`, `minus`, `signStr`, `formatPoly`, `formatFactorization`...). The displayed minus sign is `−`; `formatPoly` drops 0 and ±1 coefficients automatically.
