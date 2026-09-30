# Graph Report - moyumath  (2026-09-30)

## Corpus Check
- 82 files · ~126,507 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .css 5, (none) 1)

## Summary
- 688 nodes · 1723 edges · 46 communities (37 shown, 9 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 62 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b5c48642`
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
- sameNumber
- communication.md
- rules/graphify.md
- workflows/graphify.md
- README.md
- order-of-ops.js
- mathfmt.js
- practice-page.js
- poly-simplify.js
- number-sets.js
- formula-transform.js
- exam-page.js
- re
- ref_path
- index-page.js
- equation-word.js
- getProblem
- inequality.js
- preset-resolver.js
- int-mul-div.js
- firebase.js
- num
- eval-expression.js
- formula-word.js
- createRng
- chapter-2/index.js
- evaluator.js
- part
- power-equation.js
- initMatching
- mixed-calc.js
- common-factor.js
- expand.js
- parseExpr
- registry.js

## God Nodes (most connected - your core abstractions)
1. `part()` - 57 edges
2. `num()` - 43 edges
3. `sameNumber()` - 38 edges
4. `minus()` - 30 edges
5. `init()` - 24 edges
6. `getProblem()` - 19 edges
7. `formatFactorization()` - 17 edges
8. `parseNumberSet()` - 16 edges
9. `partial()` - 16 edges
10. `sup` - 16 edges

## Surprising Connections (you probably didn't know these)
- `E. Architecture / maintenance` --references--> `showToast()`  [INFERRED]
  PROBLEM.md → js/ui/toast.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `num()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `Status (updated after the refactor, 2026-09-30)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `parseFactorization()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `factorizationMatches()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js

## Import Cycles
- None detected.

## Communities (46 total, 9 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (17): author, bugs, url, description, homepage, keywords, license, name (+9 more)

### Community 1 - "Interface"
Cohesion: 0.29
Nodes (6): Adding a new problem type, curriculum/ — problem types, Grading results (from `js/core/grading.js`), Interface, `rng` (from `js/core/rng.js`), `ui` (provided by the runner)

### Community 2 - "curriculum.test.mjs"
Cohesion: 0.16
Nodes (15): ref_node_assert, ref_node_fs, ref_node_path, ref_node_test, ref_node_url, htmlFiles, newVersion, parts (+7 more)

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
Cohesion: 0.15
Nodes (27): describe(), DIV_PAIRS, estimateOf(), exactOf(), explain(), generate(), grade(), makeDiv() (+19 more)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Problem modules, Reading documents (PDF/DOCX/PPTX/XLSX), Structure, UI, Workflow

### Community 11 - "sameNumber"
Cohesion: 0.19
Nodes (17): explain(), grade(), render(), result(), solve(), describe(), explain(), grade() (+9 more)

### Community 16 - "order-of-ops.js"
Cohesion: 0.22
Nodes (3): grade(), LABELS, PATTERNS

### Community 17 - "mathfmt.js"
Cohesion: 0.12
Nodes (28): derive(), explain(), grade(), explain(), grade(), PAIRS, solve(), PAIRS (+20 more)

### Community 18 - "practice-page.js"
Cohesion: 0.08
Nodes (57): escapeAttr, MAP, problemLink(), render(), showAttempts(), announce(), buildSummary(), cardName() (+49 more)

### Community 19 - "poly-simplify.js"
Cohesion: 0.21
Nodes (9): explain(), grade(), solve(), terms(), explain(), grade(), solve(), terms() (+1 more)

### Community 20 - "number-sets.js"
Cohesion: 0.18
Nodes (19): explain(), explain(), grade(), render(), solve(), grade(), REGIONS, render() (+11 more)

### Community 21 - "formula-transform.js"
Cohesion: 0.15
Nodes (19): explain(), generate(), grade(), LEFT_MARKERS, render(), RIGHT_MARKERS, WHY, explain() (+11 more)

### Community 22 - "exam-page.js"
Cohesion: 0.09
Nodes (37): currentStudent(), KEYS, logout(), scaleResult(), randomSeed(), local, session, buildExam() (+29 more)

### Community 25 - "index-page.js"
Cohesion: 0.26
Nodes (16): escapeHtml(), axisPoint(), el(), formatTime(), init(), loadData(), practiceByProblem, RADAR (+8 more)

### Community 26 - "equation-word.js"
Cohesion: 0.17
Nodes (13): explain(), generate(), grade(), makeRect(), mentions(), NAMES, rectSvg(), render() (+5 more)

### Community 27 - "getProblem"
Cohesion: 0.25
Nodes (14): getProblem(), problemFromLegacyLabel(), add(), aggregate(), classify(), examEntries(), pctOf(), practiceEntries() (+6 more)

### Community 28 - "inequality.js"
Cohesion: 0.25
Nodes (13): describe(), explain(), generate(), grade(), integersOf(), KINDS, LINES, makeRange() (+5 more)

### Community 29 - "preset-resolver.js"
Cohesion: 0.31
Nodes (9): chapterLabelOf(), DIFFICULTY_ORDER, distributeDifficulty(), nearestDifficulty(), poolOf(), presetIdFromParams(), resolvePreset(), validatePreset() (+1 more)

### Community 30 - "int-mul-div.js"
Cohesion: 0.29
Nodes (9): describe(), explain(), grade(), LABELS, POOL, render(), resultOf(), show() (+1 more)

### Community 31 - "firebase.js"
Cohesion: 0.20
Nodes (4): app, db, firebaseConfig, ref_https

### Community 32 - "num"
Cohesion: 0.13
Nodes (10): grade(), num(), A. Security & data integrity (most serious), B. Grading / problem-generation bugs (directly affect students), C. Exam / practice flow, D. Stats / dashboard, E. Architecture / maintenance, PROBLEM.md — moyumath code review (2026-09-30) (+2 more)

### Community 33 - "eval-expression.js"
Cohesion: 0.39
Nodes (5): ansA(), ansB(), explain(), grade(), solve()

### Community 34 - "formula-word.js"
Cohesion: 0.28
Nodes (11): CONTEXTS, derive(), describe(), explain(), EXTRAS, grade(), money(), parseMoney() (+3 more)

### Community 35 - "createRng"
Cohesion: 0.25
Nodes (3): createRng(), eachParams(), eachParams()

### Community 36 - "chapter-2/index.js"
Cohesion: 0.16
Nodes (5): display(), explain(), grade(), TYPES_A, TYPES_B

### Community 37 - "evaluator.js"
Cohesion: 0.31
Nodes (11): equivalent(), evalExpr(), normalizeExpr(), normalizeMinus(), parseFactorization(), parsePolynomial(), polynomialMatches(), SAMPLE_POINTS (+3 more)

### Community 38 - "part"
Cohesion: 0.22
Nodes (7): commonFactorization(), CONTEXTS, explain(), FIELDS, GCDS, grade(), part()

### Community 39 - "power-equation.js"
Cohesion: 0.22
Nodes (5): explain(), grade(), KINDS, LABELS, showRoots()

### Community 40 - "initMatching"
Cohesion: 0.42
Nodes (10): initMatching(), addLine(), center(), changed(), connect(), detach(), draw(), endDrag() (+2 more)

### Community 41 - "mixed-calc.js"
Cohesion: 0.22
Nodes (3): grade(), LABELS, PATTERNS

### Community 42 - "common-factor.js"
Cohesion: 0.46
Nodes (7): describe(), explain(), grade(), items(), render(), solve(), isFactoredBy()

### Community 43 - "expand.js"
Cohesion: 0.43
Nodes (6): describe(), explain(), grade(), items(), render(), solve()

### Community 44 - "parseExpr"
Cohesion: 0.57
Nodes (7): parseExpr(), atom(), expr(), power(), term(), unary(), tokenize()

### Community 45 - "registry.js"
Cohesion: 0.33
Nodes (5): byId, byLabelAnyChapter, byLegacyLabel, byPracticeKey, chapterFromLegacy()

## Knowledge Gaps
- **118 isolated node(s):** `SET_QUESTIONS`, `PAIRS`, `PAIRS`, `CONTEXTS`, `GCDS` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 218 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `part()` connect `part` to `power-rules-mixed.js`, `grading.js`, `estimate.js`, `sameNumber`, `order-of-ops.js`, `mathfmt.js`, `poly-simplify.js`, `number-sets.js`, `formula-transform.js`, `equation-word.js`, `inequality.js`, `int-mul-div.js`, `num`, `eval-expression.js`, `formula-word.js`, `chapter-2/index.js`, `power-equation.js`, `mixed-calc.js`, `common-factor.js`, `expand.js`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `num()` connect `num` to `eval-expression.js`, `formula-word.js`, `power-rules-mixed.js`, `grading.js`, `part`, `estimate.js`, `evaluator.js`, `mixed-calc.js`, `sameNumber`, `order-of-ops.js`, `mathfmt.js`, `poly-simplify.js`, `equation-word.js`, `inequality.js`, `int-mul-div.js`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
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