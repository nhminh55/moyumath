# Graph Report - moyumath  (2026-10-01)

## Corpus Check
- 87 files · ~130,968 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .css 5, (none) 1)

## Summary
- 744 nodes · 1935 edges · 46 communities (37 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 65 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `faffc20f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- Interface
- curriculum.test.mjs
- init
- power-rules-mixed.js
- mul-div-tenths.js
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
- poly-simplify.js
- number-sets.js
- formula-transform.js
- exam-page.js
- re
- ref_path
- PROBLEM.md — moyumath code review (2026-09-30)
- equation-word.js
- index-page.js
- inequality.js
- prime-check.js
- int-mul-div.js
- stars.js
- part
- eval-expression.js
- formula-word.js
- chapter-2/index.js
- playSound
- review-page.js
- evaluator.js
- power-equation.js
- mountQuestion
- confetti.js
- common-factor.js
- grading.js
- expand.js
- parseExpr

## God Nodes (most connected - your core abstractions)
1. `part()` - 57 edges
2. `num()` - 46 edges
3. `sameNumber()` - 41 edges
4. `minus()` - 30 edges
5. `startStudyTimer()` - 25 edges
6. `init()` - 24 edges
7. `getProblem()` - 19 edges
8. `formatFactorization()` - 17 edges
9. `parseNumberSet()` - 16 edges
10. `partial()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Status (updated after the refactor, 2026-09-30)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/core/evaluator.js
- `E. Architecture / maintenance` --references--> `showToast()`  [INFERRED]
  PROBLEM.md → js/ui/toast.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `parseFactorization()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `factorizationMatches()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `sameNumberSet()`  [INFERRED]
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
Cohesion: 0.06
Nodes (53): createRng(), axisPoint(), el(), renderRadar(), renderSuggestions(), chapterLabelOf(), DIFFICULTY_ORDER, distributeDifficulty() (+45 more)

### Community 3 - "init"
Cohesion: 0.15
Nodes (21): init(), addSpace(), averageTouchY(), beginDraw(), cancelCurrentStroke(), clear(), close(), drawSegment() (+13 more)

### Community 4 - "power-rules-mixed.js"
Cohesion: 0.19
Nodes (15): render(), answers(), describe(), explain(), grade(), BASES, describe(), explain() (+7 more)

### Community 5 - "mul-div-tenths.js"
Cohesion: 0.14
Nodes (23): describe(), explain(), generate(), grade(), LABELS, makeNumber(), OPS, render() (+15 more)

### Community 6 - "estimate.js"
Cohesion: 0.15
Nodes (25): describe(), DIV_PAIRS, estimateOf(), exactOf(), explain(), generate(), makeDiv(), makeMul() (+17 more)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Problem modules, Reading documents (PDF/DOCX/PPTX/XLSX), Structure, UI, Workflow

### Community 11 - "minus"
Cohesion: 0.22
Nodes (13): explain(), grade(), result(), solve(), describe(), explain(), grade(), render() (+5 more)

### Community 16 - "order-of-ops.js"
Cohesion: 0.15
Nodes (3): grade(), LABELS, PATTERNS

### Community 17 - "mathfmt.js"
Cohesion: 0.10
Nodes (32): derive(), explain(), grade(), explain(), grade(), PAIRS, solve(), PAIRS (+24 more)

### Community 18 - "practice-page.js"
Cohesion: 0.13
Nodes (32): announce(), buildSummary(), cardName(), colorForPct(), examBadges(), init(), limits, loadFirebase() (+24 more)

### Community 19 - "poly-simplify.js"
Cohesion: 0.21
Nodes (9): explain(), grade(), solve(), terms(), explain(), grade(), solve(), terms() (+1 more)

### Community 20 - "number-sets.js"
Cohesion: 0.17
Nodes (20): explain(), explain(), generate(), grade(), render(), solve(), grade(), REGIONS (+12 more)

### Community 21 - "formula-transform.js"
Cohesion: 0.15
Nodes (19): explain(), generate(), grade(), LEFT_MARKERS, render(), RIGHT_MARKERS, WHY, explain() (+11 more)

### Community 22 - "exam-page.js"
Cohesion: 0.18
Nodes (24): currentStudent(), scaleResult(), randomSeed(), buildExam(), captureSheet(), cheer(), finish(), init() (+16 more)

### Community 25 - "PROBLEM.md — moyumath code review (2026-09-30)"
Cohesion: 0.25
Nodes (7): A. Security & data integrity (most serious), C. Exam / practice flow, D. Stats / dashboard, E. Architecture / maintenance, PROBLEM.md — moyumath code review (2026-09-30), Proposed roadmap (for discussion), Status (updated after the refactor, 2026-09-30)

### Community 26 - "equation-word.js"
Cohesion: 0.16
Nodes (13): explain(), generate(), makeRect(), mentions(), NAMES, rectSvg(), render(), sameLinearEquation() (+5 more)

### Community 27 - "index-page.js"
Cohesion: 0.10
Nodes (42): app, db, firebaseConfig, formatTime(), init(), loadData(), loadStudy(), practiceByProblem (+34 more)

### Community 28 - "inequality.js"
Cohesion: 0.27
Nodes (12): describe(), explain(), generate(), grade(), integersOf(), KINDS, LINES, makeRange() (+4 more)

### Community 29 - "prime-check.js"
Cohesion: 0.08
Nodes (18): EASY, explain(), grade(), PRIMES, smallestFactor(), solve(), TRICKY, grade() (+10 more)

### Community 30 - "int-mul-div.js"
Cohesion: 0.29
Nodes (9): describe(), explain(), grade(), LABELS, POOL, render(), resultOf(), show() (+1 more)

### Community 31 - "stars.js"
Cohesion: 0.18
Nodes (16): showAttempts(), loadLimits(), problemFromPracticeKey(), avgOfScores(), BASE_GOAL, emptyStat(), isLegacyDoc(), migrateLegacy() (+8 more)

### Community 32 - "part"
Cohesion: 0.18
Nodes (15): grade(), grade(), LABELS, PATTERNS, grade(), grade(), grade(), grade() (+7 more)

### Community 33 - "eval-expression.js"
Cohesion: 0.39
Nodes (5): ansA(), ansB(), explain(), grade(), solve()

### Community 34 - "formula-word.js"
Cohesion: 0.28
Nodes (11): CONTEXTS, derive(), describe(), explain(), EXTRAS, grade(), money(), parseMoney() (+3 more)

### Community 35 - "chapter-2/index.js"
Cohesion: 0.13
Nodes (5): display(), explain(), grade(), TYPES_A, TYPES_B

### Community 36 - "playSound"
Cohesion: 0.21
Nodes (11): KEYS, logout(), local, session, audio(), bindClickSounds(), createSoundToggle(), playSound() (+3 more)

### Community 37 - "review-page.js"
Cohesion: 0.36
Nodes (9): escapeAttr, escapeHtml(), MAP, problemLink(), render(), sheetTitle(), getChapter(), practiceNumber() (+1 more)

### Community 38 - "evaluator.js"
Cohesion: 0.38
Nodes (9): isFactoredBy(), normalizeExpr(), normalizeMinus(), parseFactorization(), parsePolynomial(), polynomialMatches(), SAMPLE_POINTS, SUP_TO_CHAR (+1 more)

### Community 39 - "power-equation.js"
Cohesion: 0.22
Nodes (6): explain(), grade(), KINDS, LABELS, showRoots(), sameNumberSet()

### Community 40 - "mountQuestion"
Cohesion: 0.16
Nodes (19): initMatching(), addLine(), center(), changed(), connect(), detach(), draw(), endDrag() (+11 more)

### Community 41 - "confetti.js"
Cohesion: 0.36
Nodes (9): feedback(), burst(), burstFrom(), celebrate(), colors(), ensureCanvas(), parts, resize() (+1 more)

### Community 42 - "common-factor.js"
Cohesion: 0.39
Nodes (8): describe(), explain(), grade(), items(), render(), solve(), equivalent(), varsOf()

### Community 43 - "grading.js"
Cohesion: 0.39
Nodes (6): round2(), totalEarned(), totalMax(), checkAnswer(), createUi(), fmtPoints()

### Community 44 - "expand.js"
Cohesion: 0.43
Nodes (6): describe(), explain(), grade(), items(), render(), solve()

### Community 45 - "parseExpr"
Cohesion: 0.57
Nodes (7): parseExpr(), atom(), expr(), power(), term(), unary(), tokenize()

## Knowledge Gaps
- **122 isolated node(s):** `SET_QUESTIONS`, `PAIRS`, `PAIRS`, `CONTEXTS`, `GCDS` (+117 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 224 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `part()` connect `part` to `power-rules-mixed.js`, `mul-div-tenths.js`, `estimate.js`, `minus`, `order-of-ops.js`, `mathfmt.js`, `poly-simplify.js`, `number-sets.js`, `formula-transform.js`, `equation-word.js`, `inequality.js`, `prime-check.js`, `int-mul-div.js`, `eval-expression.js`, `formula-word.js`, `chapter-2/index.js`, `power-equation.js`, `common-factor.js`, `grading.js`, `expand.js`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `num()` connect `part` to `eval-expression.js`, `formula-word.js`, `chapter-2/index.js`, `power-rules-mixed.js`, `mul-div-tenths.js`, `estimate.js`, `evaluator.js`, `minus`, `order-of-ops.js`, `mathfmt.js`, `poly-simplify.js`, `PROBLEM.md — moyumath code review (2026-09-30)`, `equation-word.js`, `int-mul-div.js`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `mountQuestion()` connect `mountQuestion` to `practice-page.js`, `grading.js`, `exam-page.js`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `num()` (e.g. with `Comparing answers (from `js/core/evaluator.js`)` and `B. Grading / problem-generation bugs (directly affect students)`) actually correct?**
  _`num()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `minus()` (e.g. with `showRoots()` and `grade()`) actually correct?**
  _`minus()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SET_QUESTIONS`, `PAIRS`, `PAIRS` to the rest of the system?**
  _122 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._