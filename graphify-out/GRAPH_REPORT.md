# Graph Report - moyumath  (2026-10-01)

## Corpus Check
- 93 files · ~141,016 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 8, (none) 1)

## Summary
- 865 nodes · 2393 edges · 46 communities (37 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 71 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `39aa8b1f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- chapter-2/index.js
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
- num
- mathfmt.js
- practice-page.js
- equation-word.js
- number-sets.js
- formula-transform.js
- poly-simplify.js
- re
- ref_path
- PROBLEM.md — moyumath code review (2026-09-30)
- common-factor.js
- study-timer.js
- inequality.js
- firebase.js
- int-mul-div.js
- expand.js
- parseExpr
- eval-expression.js
- stats.test.mjs
- evaluator.js
- index-page.js
- grading.js
- presets.test.mjs
- power-equation.js
- exam-page.js
- shop-page.js
- part
- review-page.js
- Interface
- registry.js

## God Nodes (most connected - your core abstractions)
1. `part()` - 57 edges
2. `num()` - 46 edges
3. `sameNumber()` - 41 edges
4. `escapeHtml()` - 30 edges
5. `minus()` - 30 edges
6. `startStudyTimer()` - 26 edges
7. `init()` - 24 edges
8. `playSound()` - 20 edges
9. `createRng()` - 19 edges
10. `getProblem()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `Status (updated after the refactor, 2026-09-30)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/core/evaluator.js
- `Grading results (from `js/core/grading.js`)` --references--> `correctCount()`  [INFERRED]
  curriculum/README.md → js/core/grading.js
- `Firestore & practice` --references--> `isPhotoDataUrl()`  [INFERRED]
  CLAUDE.md → js/runner/shop.js
- `E. Architecture / maintenance` --references--> `showToast()`  [INFERRED]
  PROBLEM.md → js/ui/toast.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `num()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js

## Import Cycles
- None detected.

## Communities (46 total, 9 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (17): author, bugs, url, description, homepage, keywords, license, name (+9 more)

### Community 1 - "chapter-2/index.js"
Cohesion: 0.16
Nodes (5): display(), explain(), grade(), TYPES_A, TYPES_B

### Community 2 - "curriculum.test.mjs"
Cohesion: 0.11
Nodes (16): createRng(), ref_node_fs, ref_node_path, ref_node_test, ref_node_url, htmlFiles, newVersion, parts (+8 more)

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
Cohesion: 0.10
Nodes (37): CONTEXTS, derive(), describe(), explain(), EXTRAS, grade(), money(), parseMoney() (+29 more)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Problem modules, Reading documents (PDF/DOCX/PPTX/XLSX), Structure, UI, Workflow

### Community 11 - "minus"
Cohesion: 0.22
Nodes (13): explain(), grade(), result(), solve(), describe(), explain(), grade(), render() (+5 more)

### Community 16 - "num"
Cohesion: 0.14
Nodes (8): grade(), LABELS, PATTERNS, grade(), grade(), matchesB(), num(), sameNumber()

### Community 17 - "mathfmt.js"
Cohesion: 0.06
Nodes (50): derive(), explain(), grade(), explain(), grade(), PAIRS, solve(), PAIRS (+42 more)

### Community 18 - "practice-page.js"
Cohesion: 0.09
Nodes (55): correctCount(), announce(), buildSummary(), cardName(), checkAnswer(), colorForPct(), examBadges(), feedback() (+47 more)

### Community 19 - "equation-word.js"
Cohesion: 0.16
Nodes (14): explain(), generate(), grade(), makeRect(), mentions(), NAMES, rectSvg(), render() (+6 more)

### Community 20 - "number-sets.js"
Cohesion: 0.17
Nodes (20): explain(), explain(), generate(), grade(), render(), solve(), grade(), REGIONS (+12 more)

### Community 21 - "formula-transform.js"
Cohesion: 0.15
Nodes (19): explain(), generate(), grade(), LEFT_MARKERS, render(), RIGHT_MARKERS, WHY, explain() (+11 more)

### Community 22 - "poly-simplify.js"
Cohesion: 0.21
Nodes (9): explain(), grade(), solve(), terms(), explain(), grade(), solve(), terms() (+1 more)

### Community 25 - "PROBLEM.md — moyumath code review (2026-09-30)"
Cohesion: 0.22
Nodes (8): A. Security & data integrity (most serious), B. Grading / problem-generation bugs (directly affect students), C. Exam / practice flow, D. Stats / dashboard, E. Architecture / maintenance, PROBLEM.md — moyumath code review (2026-09-30), Proposed roadmap (for discussion), Status (updated after the refactor, 2026-09-30)

### Community 26 - "common-factor.js"
Cohesion: 0.39
Nodes (8): describe(), explain(), grade(), items(), render(), solve(), equivalent(), varsOf()

### Community 27 - "study-timer.js"
Cohesion: 0.10
Nodes (48): local, session, renderStudy(), DAILY_GOALS, dayKey(), daySeconds(), formatMinutes(), formatStudyClock() (+40 more)

### Community 28 - "inequality.js"
Cohesion: 0.25
Nodes (13): describe(), explain(), generate(), grade(), integersOf(), KINDS, LINES, makeRange() (+5 more)

### Community 29 - "firebase.js"
Cohesion: 0.14
Nodes (12): app, buyShopItem(), buyShopPack(), db, firebaseConfig, loadShop(), saveShopEquipped(), saveShopPhoto() (+4 more)

### Community 30 - "int-mul-div.js"
Cohesion: 0.29
Nodes (9): describe(), explain(), grade(), LABELS, POOL, render(), resultOf(), show() (+1 more)

### Community 31 - "expand.js"
Cohesion: 0.43
Nodes (6): describe(), explain(), grade(), items(), render(), solve()

### Community 32 - "parseExpr"
Cohesion: 0.57
Nodes (7): parseExpr(), atom(), expr(), power(), term(), unary(), tokenize()

### Community 33 - "eval-expression.js"
Cohesion: 0.39
Nodes (5): ansA(), ansB(), explain(), grade(), solve()

### Community 34 - "stats.test.mjs"
Cohesion: 0.17
Nodes (20): renderSuggestions(), chapterFromLegacy(), listProblems(), problemFromLegacyLabel(), add(), aggregate(), chapterScores(), classify() (+12 more)

### Community 35 - "evaluator.js"
Cohesion: 0.33
Nodes (10): isFactoredBy(), normalizeExpr(), normalizeMinus(), parseFactorization(), parsePolynomial(), polynomialMatches(), SAMPLE_POINTS, SUP_TO_CHAR (+2 more)

### Community 36 - "index-page.js"
Cohesion: 0.24
Nodes (16): axisPoint(), el(), formatTime(), init(), loadData(), loadShopCard(), loadStudy(), practiceByProblem (+8 more)

### Community 37 - "grading.js"
Cohesion: 0.20
Nodes (6): grade(), grade(), partial(), round2(), totalEarned(), totalMax()

### Community 38 - "presets.test.mjs"
Cohesion: 0.40
Nodes (9): DIFFICULTY_ORDER, distributeDifficulty(), nearestDifficulty(), poolOf(), presetIdFromParams(), resolvePreset(), validatePreset(), getProblem() (+1 more)

### Community 39 - "power-equation.js"
Cohesion: 0.22
Nodes (5): explain(), grade(), KINDS, LABELS, showRoots()

### Community 40 - "exam-page.js"
Cohesion: 0.08
Nodes (45): escapeAttr, MAP, scaleResult(), randomSeed(), buildExam(), captureSheet(), cheer(), finish() (+37 more)

### Community 41 - "shop-page.js"
Cohesion: 0.06
Nodes (97): escapeHtml(), albumTile(), buy(), buyPack(), cardFace(), cardsPanel(), confirmSpend(), equip() (+89 more)

### Community 42 - "part"
Cohesion: 0.22
Nodes (4): grade(), LABELS, PATTERNS, part()

### Community 43 - "review-page.js"
Cohesion: 0.31
Nodes (8): currentStudent(), KEYS, logout(), problemLink(), render(), showAttempts(), renderHeader(), getChapter()

### Community 44 - "Interface"
Cohesion: 0.29
Nodes (6): Adding a new problem type, curriculum/ — problem types, Grading results (from `js/core/grading.js`), Interface, `rng` (from `js/core/rng.js`), `ui` (provided by the runner)

### Community 45 - "registry.js"
Cohesion: 0.40
Nodes (4): byId, byLabelAnyChapter, byLegacyLabel, byPracticeKey

## Knowledge Gaps
- **130 isolated node(s):** `SET_QUESTIONS`, `PAIRS`, `PAIRS`, `CONTEXTS`, `GCDS` (+125 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 234 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `part()` connect `part` to `eval-expression.js`, `chapter-2/index.js`, `power-rules-mixed.js`, `mul-div-tenths.js`, `estimate.js`, `power-equation.js`, `grading.js`, `minus`, `num`, `mathfmt.js`, `equation-word.js`, `number-sets.js`, `formula-transform.js`, `poly-simplify.js`, `common-factor.js`, `inequality.js`, `int-mul-div.js`, `expand.js`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `createRng()` connect `curriculum.test.mjs` to `exam-page.js`, `shop-page.js`, `practice-page.js`, `presets.test.mjs`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `num()` connect `num` to `eval-expression.js`, `evaluator.js`, `power-rules-mixed.js`, `mul-div-tenths.js`, `estimate.js`, `part`, `minus`, `mathfmt.js`, `equation-word.js`, `poly-simplify.js`, `PROBLEM.md — moyumath code review (2026-09-30)`, `inequality.js`, `int-mul-div.js`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `num()` (e.g. with `Comparing answers (from `js/core/evaluator.js`)` and `B. Grading / problem-generation bugs (directly affect students)`) actually correct?**
  _`num()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `minus()` (e.g. with `showRoots()` and `grade()`) actually correct?**
  _`minus()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SET_QUESTIONS`, `PAIRS`, `PAIRS` to the rest of the system?**
  _130 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._