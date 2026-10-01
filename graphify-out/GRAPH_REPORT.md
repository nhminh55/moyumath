# Graph Report - moyumath  (2026-10-01)

## Corpus Check
- 91 files · ~139,089 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 8, (none) 1)

## Summary
- 843 nodes · 2313 edges · 45 communities (36 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ce49a80a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- Interface
- curriculum.test.mjs
- init
- power-rules-mixed.js
- mul-div-tenths.js
- formula-word.js
- ref_node_vm
- CLAUDE.md — moyumath
- ref_fs
- os
- sameNumber
- communication.md
- rules/graphify.md
- workflows/graphify.md
- README.md
- part
- mathfmt.js
- practice-page.js
- equation-word.js
- number-sets.js
- formula-transform.js
- poly-simplify.js
- re
- ref_path
- PROBLEM.md — moyumath code review (2026-09-30)
- registry.js
- index-page.js
- inequality.js
- firebase.js
- int-mul-div.js
- stars.js
- estimate.js
- eval-expression.js
- presets.test.mjs
- evaluator.js
- initMatching
- review-page.js
- auth.js
- power-equation.js
- mountQuestion
- shop-page.js
- question-view.js
- exam-page.js
- startTimer

## God Nodes (most connected - your core abstractions)
1. `part()` - 57 edges
2. `num()` - 46 edges
3. `sameNumber()` - 41 edges
4. `escapeHtml()` - 30 edges
5. `minus()` - 30 edges
6. `startStudyTimer()` - 25 edges
7. `init()` - 24 edges
8. `createRng()` - 19 edges
9. `getProblem()` - 19 edges
10. `init()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Status (updated after the refactor, 2026-09-30)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/core/evaluator.js
- `E. Architecture / maintenance` --references--> `showToast()`  [INFERRED]
  PROBLEM.md → js/ui/toast.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `num()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `B. Grading / problem-generation bugs (directly affect students)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `parseFactorization()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js

## Import Cycles
- None detected.

## Communities (45 total, 9 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (17): author, bugs, url, description, homepage, keywords, license, name (+9 more)

### Community 1 - "Interface"
Cohesion: 0.29
Nodes (6): Adding a new problem type, curriculum/ — problem types, Grading results (from `js/core/grading.js`), Interface, `rng` (from `js/core/rng.js`), `ui` (provided by the runner)

### Community 2 - "curriculum.test.mjs"
Cohesion: 0.11
Nodes (18): createRng(), randomSeed(), ref_node_assert, ref_node_fs, ref_node_path, ref_node_test, ref_node_url, htmlFiles (+10 more)

### Community 3 - "init"
Cohesion: 0.15
Nodes (21): init(), addSpace(), averageTouchY(), beginDraw(), cancelCurrentStroke(), clear(), close(), drawSegment() (+13 more)

### Community 4 - "power-rules-mixed.js"
Cohesion: 0.18
Nodes (16): render(), explain(), answers(), describe(), explain(), grade(), BASES, describe() (+8 more)

### Community 5 - "mul-div-tenths.js"
Cohesion: 0.13
Nodes (23): describe(), explain(), generate(), grade(), LABELS, makeNumber(), OPS, render() (+15 more)

### Community 6 - "formula-word.js"
Cohesion: 0.14
Nodes (24): CONTEXTS, derive(), describe(), explain(), EXTRAS, grade(), money(), parseMoney() (+16 more)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Problem modules, Reading documents (PDF/DOCX/PPTX/XLSX), Structure, UI, Workflow

### Community 11 - "sameNumber"
Cohesion: 0.21
Nodes (16): explain(), grade(), result(), solve(), describe(), explain(), grade(), render() (+8 more)

### Community 16 - "part"
Cohesion: 0.10
Nodes (11): grade(), grade(), LABELS, PATTERNS, grade(), LABELS, PATTERNS, grade() (+3 more)

### Community 17 - "mathfmt.js"
Cohesion: 0.05
Nodes (50): derive(), explain(), grade(), explain(), grade(), PAIRS, solve(), PAIRS (+42 more)

### Community 18 - "practice-page.js"
Cohesion: 0.12
Nodes (37): totalEarned(), totalMax(), announce(), buildSummary(), cardName(), checkAnswer(), colorForPct(), examBadges() (+29 more)

### Community 19 - "equation-word.js"
Cohesion: 0.07
Nodes (33): describe(), explain(), grade(), items(), render(), solve(), explain(), generate() (+25 more)

### Community 20 - "number-sets.js"
Cohesion: 0.17
Nodes (20): explain(), explain(), generate(), grade(), render(), solve(), grade(), REGIONS (+12 more)

### Community 21 - "formula-transform.js"
Cohesion: 0.15
Nodes (19): explain(), generate(), grade(), LEFT_MARKERS, render(), RIGHT_MARKERS, WHY, explain() (+11 more)

### Community 22 - "poly-simplify.js"
Cohesion: 0.14
Nodes (15): describe(), explain(), grade(), items(), render(), solve(), explain(), grade() (+7 more)

### Community 25 - "PROBLEM.md — moyumath code review (2026-09-30)"
Cohesion: 0.25
Nodes (7): A. Security & data integrity (most serious), C. Exam / practice flow, D. Stats / dashboard, E. Architecture / maintenance, PROBLEM.md — moyumath code review (2026-09-30), Proposed roadmap (for discussion), Status (updated after the refactor, 2026-09-30)

### Community 26 - "registry.js"
Cohesion: 0.16
Nodes (18): byId, byLabelAnyChapter, byLegacyLabel, byPracticeKey, chapterFromLegacy(), problemFromLegacyLabel(), add(), aggregate() (+10 more)

### Community 27 - "index-page.js"
Cohesion: 0.10
Nodes (55): logout(), escapeHtml(), axisPoint(), el(), formatTime(), init(), loadData(), loadShopCard() (+47 more)

### Community 28 - "inequality.js"
Cohesion: 0.23
Nodes (14): describe(), explain(), generate(), grade(), integersOf(), KINDS, LINES, makeRange() (+6 more)

### Community 29 - "firebase.js"
Cohesion: 0.14
Nodes (11): app, buyShopItem(), buyShopPack(), db, firebaseConfig, loadShop(), saveShopEquipped(), shopDoc() (+3 more)

### Community 30 - "int-mul-div.js"
Cohesion: 0.29
Nodes (9): describe(), explain(), grade(), LABELS, POOL, render(), resultOf(), show() (+1 more)

### Community 31 - "stars.js"
Cohesion: 0.20
Nodes (16): renderCard(), statOf(), updateStatusBar(), avgOfScores(), emptyStat(), isLegacyDoc(), migrateLegacy(), MILESTONE_2 (+8 more)

### Community 32 - "estimate.js"
Cohesion: 0.26
Nodes (15): describe(), DIV_PAIRS, estimateOf(), exactOf(), explain(), generate(), grade(), makeDiv() (+7 more)

### Community 33 - "eval-expression.js"
Cohesion: 0.39
Nodes (5): ansA(), ansB(), explain(), grade(), solve()

### Community 34 - "presets.test.mjs"
Cohesion: 0.36
Nodes (10): DIFFICULTY_ORDER, distributeDifficulty(), nearestDifficulty(), poolOf(), presetIdFromParams(), resolvePreset(), validatePreset(), getProblem() (+2 more)

### Community 35 - "evaluator.js"
Cohesion: 0.38
Nodes (9): isFactoredBy(), normalizeExpr(), normalizeMinus(), parseFactorization(), parsePolynomial(), polynomialMatches(), SAMPLE_POINTS, SUP_TO_CHAR (+1 more)

### Community 36 - "initMatching"
Cohesion: 0.42
Nodes (10): initMatching(), addLine(), center(), changed(), connect(), detach(), draw(), endDrag() (+2 more)

### Community 37 - "review-page.js"
Cohesion: 0.39
Nodes (7): problemLink(), render(), showAttempts(), getChapter(), practiceNumber(), BASE_GOAL, statFromDoc()

### Community 38 - "auth.js"
Cohesion: 0.40
Nodes (3): KEYS, local, session

### Community 39 - "power-equation.js"
Cohesion: 0.25
Nodes (4): grade(), KINDS, LABELS, showRoots()

### Community 40 - "mountQuestion"
Cohesion: 0.25
Nodes (9): mountQuestion(), clearAnswers(), clearResult(), restore(), setDisabled(), showExplanation(), refresh(), reveal() (+1 more)

### Community 41 - "shop-page.js"
Cohesion: 0.06
Nodes (92): albumTile(), buy(), buyPack(), cardFace(), cardsPanel(), confirmSpend(), equip(), fb() (+84 more)

### Community 42 - "question-view.js"
Cohesion: 0.47
Nodes (3): escapeAttr, MAP, createUi()

### Community 43 - "exam-page.js"
Cohesion: 0.24
Nodes (20): currentStudent(), round2(), scaleResult(), buildExam(), captureSheet(), cheer(), finish(), init() (+12 more)

### Community 44 - "startTimer"
Cohesion: 0.47
Nodes (5): startTimer(), formatClock(), secondsLeft(), startCountdown(), tick()

## Knowledge Gaps
- **131 isolated node(s):** `SET_QUESTIONS`, `PAIRS`, `PAIRS`, `CONTEXTS`, `GCDS` (+126 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 235 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `part()` connect `part` to `estimate.js`, `eval-expression.js`, `power-rules-mixed.js`, `mul-div-tenths.js`, `formula-word.js`, `power-equation.js`, `sameNumber`, `mathfmt.js`, `equation-word.js`, `number-sets.js`, `formula-transform.js`, `poly-simplify.js`, `inequality.js`, `int-mul-div.js`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `createRng()` connect `curriculum.test.mjs` to `shop-page.js`, `practice-page.js`, `exam-page.js`, `presets.test.mjs`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `num()` connect `part` to `estimate.js`, `eval-expression.js`, `evaluator.js`, `power-rules-mixed.js`, `mul-div-tenths.js`, `formula-word.js`, `sameNumber`, `mathfmt.js`, `equation-word.js`, `poly-simplify.js`, `PROBLEM.md — moyumath code review (2026-09-30)`, `inequality.js`, `int-mul-div.js`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `num()` (e.g. with `Comparing answers (from `js/core/evaluator.js`)` and `B. Grading / problem-generation bugs (directly affect students)`) actually correct?**
  _`num()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `minus()` (e.g. with `showRoots()` and `grade()`) actually correct?**
  _`minus()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SET_QUESTIONS`, `PAIRS`, `PAIRS` to the rest of the system?**
  _131 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._