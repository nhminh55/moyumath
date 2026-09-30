# Graph Report - moyumath  (2026-09-30)

## Corpus Check
- 81 files · ~124,842 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .css 5, (none) 1)

## Summary
- 679 nodes · 1701 edges · 37 communities (27 shown, 10 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `25f12aff`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- Interface
- curriculum.test.mjs
- init
- power-rules-mixed.js
- grading.js
- estimate.js
- ref_node_vm
- CLAUDE.md — moyumath
- ref_fs
- os
- minus
- communication.md
- rules/graphify.md
- workflows/graphify.md
- README.md
- part
- mathfmt.js
- practice-page.js
- evaluator.js
- number-sets.js
- formula-transform.js
- exam-page.js
- re
- ref_path
- index-page.js
- equation-word.js
- registry.js
- inequality.js
- presets.test.mjs
- int-mul-div.js
- firebase.js
- eval-sqrt-expr.js
- eval-expression.js
- review-page.js
- createRng

## God Nodes (most connected - your core abstractions)
1. `part()` - 55 edges
2. `num()` - 41 edges
3. `sameNumber()` - 36 edges
4. `minus()` - 28 edges
5. `init()` - 24 edges
6. `getProblem()` - 19 edges
7. `formatFactorization()` - 17 edges
8. `parseNumberSet()` - 16 edges
9. `partial()` - 16 edges
10. `gcd()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `num()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `Status (updated after the refactor, 2026-09-30)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `sameNumber()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `parseFactorization()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `factorizationMatches()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js

## Import Cycles
- None detected.

## Communities (37 total, 10 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (17): author, bugs, url, description, homepage, keywords, license, name (+9 more)

### Community 1 - "Interface"
Cohesion: 0.29
Nodes (6): Adding a new problem type, curriculum/ — problem types, Grading results (from `js/core/grading.js`), Interface, `rng` (from `js/core/rng.js`), `ui` (provided by the runner)

### Community 2 - "curriculum.test.mjs"
Cohesion: 0.17
Nodes (12): ref_node_fs, ref_node_path, ref_node_url, htmlFiles, newVersion, parts, pkg, pkgPath (+4 more)

### Community 3 - "init"
Cohesion: 0.15
Nodes (21): init(), addSpace(), averageTouchY(), beginDraw(), cancelCurrentStroke(), clear(), close(), drawSegment() (+13 more)

### Community 4 - "power-rules-mixed.js"
Cohesion: 0.21
Nodes (14): answers(), describe(), explain(), grade(), BASES, describe(), explain(), grade() (+6 more)

### Community 5 - "grading.js"
Cohesion: 0.05
Nodes (44): EASY, explain(), grade(), PRIMES, smallestFactor(), solve(), TRICKY, grade() (+36 more)

### Community 6 - "estimate.js"
Cohesion: 0.10
Nodes (38): CONTEXTS, derive(), describe(), explain(), EXTRAS, grade(), money(), parseMoney() (+30 more)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Problem modules, Reading documents (PDF/DOCX/PPTX/XLSX), Structure, UI, Workflow

### Community 11 - "minus"
Cohesion: 0.15
Nodes (17): explain(), grade(), KINDS, LABELS, showRoots(), describe(), explain(), grade() (+9 more)

### Community 16 - "part"
Cohesion: 0.14
Nodes (6): grade(), LABELS, PATTERNS, grade(), sameNumber(), part()

### Community 17 - "mathfmt.js"
Cohesion: 0.08
Nodes (41): derive(), explain(), grade(), explain(), grade(), PAIRS, solve(), PAIRS (+33 more)

### Community 18 - "practice-page.js"
Cohesion: 0.10
Nodes (50): announce(), buildSummary(), cardName(), checkAnswer(), colorForPct(), examBadges(), init(), limits (+42 more)

### Community 19 - "evaluator.js"
Cohesion: 0.07
Nodes (44): describe(), explain(), grade(), items(), render(), solve(), describe(), explain() (+36 more)

### Community 20 - "number-sets.js"
Cohesion: 0.17
Nodes (20): explain(), explain(), generate(), grade(), render(), solve(), grade(), REGIONS (+12 more)

### Community 21 - "formula-transform.js"
Cohesion: 0.14
Nodes (19): explain(), generate(), grade(), LEFT_MARKERS, render(), RIGHT_MARKERS, WHY, explain() (+11 more)

### Community 22 - "exam-page.js"
Cohesion: 0.07
Nodes (46): KEYS, scaleResult(), randomSeed(), local, session, buildExam(), captureSheet(), finish() (+38 more)

### Community 25 - "index-page.js"
Cohesion: 0.23
Nodes (18): logout(), escapeHtml(), axisPoint(), el(), formatTime(), init(), loadData(), practiceByProblem (+10 more)

### Community 26 - "equation-word.js"
Cohesion: 0.16
Nodes (14): explain(), generate(), grade(), makeRect(), mentions(), NAMES, rectSvg(), render() (+6 more)

### Community 27 - "registry.js"
Cohesion: 0.15
Nodes (21): byId, byLabelAnyChapter, byLegacyLabel, byPracticeKey, chapterFromLegacy(), getProblem(), problemFromLegacyLabel(), add() (+13 more)

### Community 28 - "inequality.js"
Cohesion: 0.27
Nodes (11): describe(), explain(), generate(), integersOf(), KINDS, LINES, makeRange(), numberLine() (+3 more)

### Community 29 - "presets.test.mjs"
Cohesion: 0.33
Nodes (10): chapterLabelOf(), DIFFICULTY_ORDER, distributeDifficulty(), nearestDifficulty(), poolOf(), presetIdFromParams(), resolvePreset(), validatePreset() (+2 more)

### Community 30 - "int-mul-div.js"
Cohesion: 0.29
Nodes (9): describe(), explain(), grade(), LABELS, POOL, render(), resultOf(), show() (+1 more)

### Community 31 - "firebase.js"
Cohesion: 0.20
Nodes (4): app, db, firebaseConfig, ref_https

### Community 32 - "eval-sqrt-expr.js"
Cohesion: 0.36
Nodes (6): explain(), grade(), render(), result(), solve(), signStr()

### Community 33 - "eval-expression.js"
Cohesion: 0.39
Nodes (5): ansA(), ansB(), explain(), grade(), solve()

### Community 34 - "review-page.js"
Cohesion: 0.39
Nodes (7): currentStudent(), escapeAttr, MAP, problemLink(), render(), showAttempts(), getChapter()

### Community 35 - "createRng"
Cohesion: 0.25
Nodes (3): createRng(), eachParams(), eachParams()

## Knowledge Gaps
- **116 isolated node(s):** `SET_QUESTIONS`, `PAIRS`, `PAIRS`, `CONTEXTS`, `GCDS` (+111 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 211 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `part()` connect `part` to `eval-sqrt-expr.js`, `eval-expression.js`, `power-rules-mixed.js`, `grading.js`, `estimate.js`, `minus`, `mathfmt.js`, `evaluator.js`, `number-sets.js`, `formula-transform.js`, `equation-word.js`, `inequality.js`, `int-mul-div.js`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `num()` connect `mathfmt.js` to `eval-sqrt-expr.js`, `eval-expression.js`, `power-rules-mixed.js`, `grading.js`, `estimate.js`, `minus`, `part`, `evaluator.js`, `equation-word.js`, `int-mul-div.js`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `mountQuestion()` connect `exam-page.js` to `practice-page.js`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `num()` (e.g. with `Comparing answers (from `js/core/evaluator.js`)` and `B. Grading / problem-generation bugs (directly affect students)`) actually correct?**
  _`num()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `minus()` (e.g. with `showRoots()` and `grade()`) actually correct?**
  _`minus()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `init()` (e.g. with `scratchpad.js` and `addSpace()`) actually correct?**
  _`init()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SET_QUESTIONS`, `PAIRS`, `PAIRS` to the rest of the system?**
  _116 weakly-connected nodes found - possible documentation gaps or missing edges._