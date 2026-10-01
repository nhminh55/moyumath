# Graph Report - moyumath  (2026-10-01)

## Corpus Check
- 82 files · ~127,024 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .css 5, (none) 1)

## Summary
- 690 nodes · 1738 edges · 35 communities (24 shown, 11 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `76a45fdc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- Interface
- index-page.js
- init
- power-rules-mixed.js
- midterm.test.mjs
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
- order-of-ops.js
- mathfmt.js
- practice-page.js
- evaluator.js
- number-sets.js
- formula-transform.js
- exam-page.js
- re
- ref_path
- PROBLEM.md — moyumath code review (2026-09-30)
- equation-word.js
- inequality.js
- int-mul-div.js
- part
- eval-expression.js
- formula-word.js
- power-equation.js
- initMatching
- mixed-calc.js

## God Nodes (most connected - your core abstractions)
1. `part()` - 57 edges
2. `num()` - 46 edges
3. `sameNumber()` - 41 edges
4. `minus()` - 30 edges
5. `init()` - 24 edges
6. `getProblem()` - 19 edges
7. `formatFactorization()` - 17 edges
8. `parseNumberSet()` - 16 edges
9. `partial()` - 16 edges
10. `sup` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Status (updated after the refactor, 2026-09-30)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/core/evaluator.js
- `E. Architecture / maintenance` --references--> `showToast()`  [INFERRED]
  PROBLEM.md → js/ui/toast.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `num()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `B. Grading / problem-generation bugs (directly affect students)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `sameNumber()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js

## Import Cycles
- None detected.

## Communities (35 total, 11 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (17): author, bugs, url, description, homepage, keywords, license, name (+9 more)

### Community 1 - "Interface"
Cohesion: 0.29
Nodes (6): Adding a new problem type, curriculum/ — problem types, Grading results (from `js/core/grading.js`), Interface, `rng` (from `js/core/rng.js`), `ui` (provided by the runner)

### Community 2 - "index-page.js"
Cohesion: 0.06
Nodes (63): escapeHtml(), createRng(), axisPoint(), el(), formatTime(), init(), loadData(), practiceByProblem (+55 more)

### Community 3 - "init"
Cohesion: 0.15
Nodes (21): init(), addSpace(), averageTouchY(), beginDraw(), cancelCurrentStroke(), clear(), close(), drawSegment() (+13 more)

### Community 4 - "power-rules-mixed.js"
Cohesion: 0.19
Nodes (15): explain(), answers(), describe(), explain(), grade(), BASES, describe(), explain() (+7 more)

### Community 5 - "midterm.test.mjs"
Cohesion: 0.14
Nodes (23): describe(), explain(), generate(), grade(), LABELS, makeNumber(), OPS, render() (+15 more)

### Community 6 - "estimate.js"
Cohesion: 0.14
Nodes (27): describe(), DIV_PAIRS, estimateOf(), exactOf(), explain(), generate(), makeDiv(), makeMul() (+19 more)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Problem modules, Reading documents (PDF/DOCX/PPTX/XLSX), Structure, UI, Workflow

### Community 11 - "minus"
Cohesion: 0.20
Nodes (13): explain(), grade(), render(), result(), solve(), describe(), explain(), render() (+5 more)

### Community 17 - "mathfmt.js"
Cohesion: 0.05
Nodes (50): derive(), explain(), grade(), explain(), grade(), PAIRS, solve(), PAIRS (+42 more)

### Community 18 - "practice-page.js"
Cohesion: 0.06
Nodes (63): escapeAttr, MAP, app, db, firebaseConfig, totalEarned(), totalMax(), problemLink() (+55 more)

### Community 19 - "evaluator.js"
Cohesion: 0.10
Nodes (31): describe(), explain(), grade(), items(), render(), solve(), explain(), grade() (+23 more)

### Community 20 - "number-sets.js"
Cohesion: 0.17
Nodes (20): explain(), explain(), generate(), grade(), render(), solve(), grade(), REGIONS (+12 more)

### Community 21 - "formula-transform.js"
Cohesion: 0.12
Nodes (19): explain(), generate(), grade(), LEFT_MARKERS, render(), RIGHT_MARKERS, WHY, explain() (+11 more)

### Community 22 - "exam-page.js"
Cohesion: 0.09
Nodes (38): currentStudent(), KEYS, logout(), round2(), scaleResult(), randomSeed(), local, session (+30 more)

### Community 25 - "PROBLEM.md — moyumath code review (2026-09-30)"
Cohesion: 0.25
Nodes (7): A. Security & data integrity (most serious), C. Exam / practice flow, D. Stats / dashboard, E. Architecture / maintenance, PROBLEM.md — moyumath code review (2026-09-30), Proposed roadmap (for discussion), Status (updated after the refactor, 2026-09-30)

### Community 26 - "equation-word.js"
Cohesion: 0.16
Nodes (13): explain(), generate(), makeRect(), mentions(), NAMES, rectSvg(), render(), sameLinearEquation() (+5 more)

### Community 28 - "inequality.js"
Cohesion: 0.27
Nodes (12): describe(), explain(), generate(), grade(), integersOf(), KINDS, LINES, makeRange() (+4 more)

### Community 30 - "int-mul-div.js"
Cohesion: 0.31
Nodes (8): describe(), explain(), LABELS, POOL, render(), resultOf(), show(), solve()

### Community 32 - "part"
Cohesion: 0.24
Nodes (11): grade(), grade(), grade(), grade(), grade(), grade(), grade(), grade() (+3 more)

### Community 33 - "eval-expression.js"
Cohesion: 0.39
Nodes (5): ansA(), ansB(), explain(), grade(), solve()

### Community 34 - "formula-word.js"
Cohesion: 0.10
Nodes (24): describe(), explain(), grade(), items(), render(), solve(), CONTEXTS, derive() (+16 more)

### Community 39 - "power-equation.js"
Cohesion: 0.21
Nodes (8): grade(), KINDS, LABELS, showRoots(), Comparing answers (from `js/core/evaluator.js`), parseNumberSet(), sameNumberSet(), B. Grading / problem-generation bugs (directly affect students)

### Community 40 - "initMatching"
Cohesion: 0.42
Nodes (10): initMatching(), addLine(), center(), changed(), connect(), detach(), draw(), endDrag() (+2 more)

## Knowledge Gaps
- **118 isolated node(s):** `SET_QUESTIONS`, `PAIRS`, `PAIRS`, `CONTEXTS`, `GCDS` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 218 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `part()` connect `part` to `eval-expression.js`, `formula-word.js`, `power-rules-mixed.js`, `midterm.test.mjs`, `estimate.js`, `power-equation.js`, `mixed-calc.js`, `minus`, `order-of-ops.js`, `mathfmt.js`, `evaluator.js`, `number-sets.js`, `formula-transform.js`, `equation-word.js`, `inequality.js`, `int-mul-div.js`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `num()` connect `part` to `eval-expression.js`, `formula-word.js`, `power-rules-mixed.js`, `midterm.test.mjs`, `estimate.js`, `power-equation.js`, `mixed-calc.js`, `minus`, `order-of-ops.js`, `mathfmt.js`, `evaluator.js`, `PROBLEM.md — moyumath code review (2026-09-30)`, `equation-word.js`, `int-mul-div.js`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `mountQuestion()` connect `exam-page.js` to `initMatching`, `practice-page.js`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `num()` (e.g. with `Comparing answers (from `js/core/evaluator.js`)` and `B. Grading / problem-generation bugs (directly affect students)`) actually correct?**
  _`num()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `minus()` (e.g. with `showRoots()` and `grade()`) actually correct?**
  _`minus()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `init()` (e.g. with `scratchpad.js` and `addSpace()`) actually correct?**
  _`init()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SET_QUESTIONS`, `PAIRS`, `PAIRS` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._