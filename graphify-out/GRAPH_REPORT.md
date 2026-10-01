# Graph Report - moyumath  (2026-10-01)

## Corpus Check
- 91 files · ~139,266 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 9 file(s) not represented in the graph (top: .css 8, (none) 1)

## Summary
- 842 nodes · 2313 edges · 40 communities (31 shown, 9 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3ee6b610`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- Interface
- exam-page.js
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
- part
- mathfmt.js
- practice-page.js
- evaluator.js
- number-sets.js
- formula-transform.js
- gcd-lcm.js
- re
- ref_path
- num
- equation-word.js
- index-page.js
- inequality.js
- prime-check.js
- int-mul-div.js
- prime-factorize.js
- mixed-calc.js
- eval-expression.js
- equivalent-expressions.js
- gcd-word.js
- power-equation.js
- mountQuestion
- shop-page.js
- grading.js

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
- `E. Architecture / maintenance` --references--> `showToast()`  [INFERRED]
  PROBLEM.md → js/ui/toast.js
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

## Communities (40 total, 9 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (17): author, bugs, url, description, homepage, keywords, license, name (+9 more)

### Community 1 - "Interface"
Cohesion: 0.29
Nodes (6): Adding a new problem type, curriculum/ — problem types, Grading results (from `js/core/grading.js`), Interface, `rng` (from `js/core/rng.js`), `ui` (provided by the runner)

### Community 2 - "exam-page.js"
Cohesion: 0.06
Nodes (51): currentStudent(), KEYS, logout(), scaleResult(), createRng(), randomSeed(), session, buildExam() (+43 more)

### Community 3 - "init"
Cohesion: 0.15
Nodes (21): init(), addSpace(), averageTouchY(), beginDraw(), cancelCurrentStroke(), clear(), close(), drawSegment() (+13 more)

### Community 4 - "power-rules-mixed.js"
Cohesion: 0.21
Nodes (14): answers(), describe(), explain(), grade(), BASES, describe(), explain(), grade() (+6 more)

### Community 5 - "midterm.test.mjs"
Cohesion: 0.14
Nodes (23): describe(), explain(), generate(), grade(), LABELS, makeNumber(), OPS, render() (+15 more)

### Community 6 - "estimate.js"
Cohesion: 0.09
Nodes (38): CONTEXTS, derive(), describe(), explain(), EXTRAS, grade(), money(), parseMoney() (+30 more)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Problem modules, Reading documents (PDF/DOCX/PPTX/XLSX), Structure, UI, Workflow

### Community 11 - "minus"
Cohesion: 0.20
Nodes (14): explain(), grade(), render(), result(), solve(), describe(), explain(), grade() (+6 more)

### Community 16 - "part"
Cohesion: 0.14
Nodes (8): grade(), grade(), LABELS, PATTERNS, grade(), grade(), sameNumber(), part()

### Community 17 - "mathfmt.js"
Cohesion: 0.26
Nodes (9): explain(), grade(), PAIRS, solve(), generate(), byNum(), gcd(), gcdAll() (+1 more)

### Community 18 - "practice-page.js"
Cohesion: 0.07
Nodes (66): escapeAttr, MAP, problemLink(), render(), showAttempts(), announce(), buildSummary(), cardName() (+58 more)

### Community 19 - "evaluator.js"
Cohesion: 0.06
Nodes (47): describe(), explain(), grade(), items(), render(), solve(), sameLinearEquation(), describe() (+39 more)

### Community 20 - "number-sets.js"
Cohesion: 0.17
Nodes (20): explain(), explain(), generate(), grade(), render(), solve(), grade(), REGIONS (+12 more)

### Community 21 - "formula-transform.js"
Cohesion: 0.15
Nodes (19): explain(), generate(), grade(), LEFT_MARKERS, render(), RIGHT_MARKERS, WHY, explain() (+11 more)

### Community 22 - "gcd-lcm.js"
Cohesion: 0.32
Nodes (8): derive(), explain(), grade(), PAIRS, solve(), formatFactorization(), gcdFactorization(), lcmFactorization()

### Community 25 - "num"
Cohesion: 0.21
Nodes (11): Comparing answers (from `js/core/evaluator.js`), num(), parseNumberSet(), A. Security & data integrity (most serious), B. Grading / problem-generation bugs (directly affect students), C. Exam / practice flow, D. Stats / dashboard, E. Architecture / maintenance (+3 more)

### Community 26 - "equation-word.js"
Cohesion: 0.17
Nodes (12): explain(), generate(), grade(), makeRect(), mentions(), NAMES, rectSvg(), render() (+4 more)

### Community 27 - "index-page.js"
Cohesion: 0.06
Nodes (75): app, buyShopItem(), buyShopPack(), db, firebaseConfig, loadShop(), saveShopEquipped(), shopDoc() (+67 more)

### Community 28 - "inequality.js"
Cohesion: 0.25
Nodes (13): describe(), explain(), generate(), grade(), integersOf(), KINDS, LINES, makeRange() (+5 more)

### Community 29 - "prime-check.js"
Cohesion: 0.23
Nodes (8): EASY, explain(), grade(), PRIMES, smallestFactor(), solve(), TRICKY, isPrime()

### Community 30 - "int-mul-div.js"
Cohesion: 0.29
Nodes (9): describe(), explain(), grade(), LABELS, POOL, render(), resultOf(), show() (+1 more)

### Community 31 - "prime-factorize.js"
Cohesion: 0.29
Nodes (8): explain(), grade(), POOL_FACTORIZE, POOL_PRIME_FACTORS, primesOf(), solve(), divisionSteps(), factorize()

### Community 32 - "mixed-calc.js"
Cohesion: 0.22
Nodes (3): grade(), LABELS, PATTERNS

### Community 33 - "eval-expression.js"
Cohesion: 0.39
Nodes (5): ansA(), ansB(), explain(), grade(), solve()

### Community 34 - "equivalent-expressions.js"
Cohesion: 0.20
Nodes (8): explain(), fill(), frac(), generate(), grade(), GROUP_KEYS, _groups, PICK

### Community 35 - "gcd-word.js"
Cohesion: 0.22
Nodes (6): commonFactorization(), CONTEXTS, explain(), FIELDS, GCDS, generate()

### Community 39 - "power-equation.js"
Cohesion: 0.22
Nodes (5): explain(), grade(), KINDS, LABELS, showRoots()

### Community 40 - "mountQuestion"
Cohesion: 0.14
Nodes (20): initMatching(), addLine(), center(), changed(), connect(), detach(), draw(), endDrag() (+12 more)

### Community 41 - "shop-page.js"
Cohesion: 0.06
Nodes (98): escapeHtml(), local, albumTile(), buy(), buyPack(), cardFace(), cardsPanel(), confirmSpend() (+90 more)

### Community 43 - "grading.js"
Cohesion: 0.24
Nodes (5): grade(), partial(), round2(), totalEarned(), totalMax()

## Knowledge Gaps
- **130 isolated node(s):** `SET_QUESTIONS`, `PAIRS`, `PAIRS`, `CONTEXTS`, `GCDS` (+125 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 234 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `part()` connect `part` to `power-rules-mixed.js`, `midterm.test.mjs`, `estimate.js`, `minus`, `mathfmt.js`, `evaluator.js`, `number-sets.js`, `formula-transform.js`, `gcd-lcm.js`, `equation-word.js`, `inequality.js`, `prime-check.js`, `int-mul-div.js`, `prime-factorize.js`, `mixed-calc.js`, `eval-expression.js`, `gcd-word.js`, `power-equation.js`, `grading.js`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `createRng()` connect `exam-page.js` to `shop-page.js`, `practice-page.js`, `midterm.test.mjs`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `num()` connect `num` to `mixed-calc.js`, `eval-expression.js`, `gcd-word.js`, `power-rules-mixed.js`, `midterm.test.mjs`, `estimate.js`, `minus`, `part`, `mathfmt.js`, `evaluator.js`, `gcd-lcm.js`, `equation-word.js`, `int-mul-div.js`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `num()` (e.g. with `Comparing answers (from `js/core/evaluator.js`)` and `B. Grading / problem-generation bugs (directly affect students)`) actually correct?**
  _`num()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 5 inferred relationships involving `minus()` (e.g. with `showRoots()` and `grade()`) actually correct?**
  _`minus()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SET_QUESTIONS`, `PAIRS`, `PAIRS` to the rest of the system?**
  _130 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._