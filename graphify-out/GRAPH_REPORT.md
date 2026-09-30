# Graph Report - moyumath  (2026-09-30)

## Corpus Check
- 73 files · ~123,520 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .css 4)

## Summary
- 585 nodes · 1356 edges · 29 communities (19 shown, 10 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `46687443`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- js/evaluator.js
- generators-ch1.js
- init
- PROBLEM.md — Rà soát code moyumath (2026-09-30)
- curriculum.test.mjs
- CLAUDE.md — moyumath
- ref_fs
- os
- generators-ch2.js
- communication.md
- rules/graphify.md
- workflows/graphify.md
- README.md
- part
- core/evaluator.js
- practice-page.js
- poly-simplify.js
- grading.js
- formula-transform.js
- exam-page.js
- re
- ref_path
- mountQuestion
- power-rules-mixed.js
- index-page.js
- write-expression.js

## God Nodes (most connected - your core abstractions)
1. `part()` - 37 edges
2. `num()` - 26 edges
3. `sameNumber()` - 24 edges
4. `init()` - 24 edges
5. `minus()` - 21 edges
6. `formatPoly()` - 15 edges
7. `getProblem()` - 15 edges
8. `mountQuestion()` - 15 edges
9. `gcd()` - 14 edges
10. `formatFactorization()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `So sánh đáp án (từ `js/core/evaluator.js`)` --references--> `formatPoly()`  [INFERRED]
  curriculum/README.md → js/core/mathfmt.js
- `So sánh đáp án (từ `js/core/evaluator.js`)` --references--> `sup()`  [INFERRED]
  curriculum/README.md → js/generators-ch1.js
- `E. Kiến trúc / bảo trì` --references--> `showToast()`  [INFERRED]
  PROBLEM.md → js/ui/toast.js
- `So sánh đáp án (từ `js/core/evaluator.js`)` --references--> `sameNumber()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `So sánh đáp án (từ `js/core/evaluator.js`)` --references--> `minus()`  [INFERRED]
  curriculum/README.md → js/core/mathfmt.js

## Import Cycles
- None detected.

## Communities (29 total, 10 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (17): author, bugs, url, description, homepage, keywords, license, name (+9 more)

### Community 1 - "js/evaluator.js"
Cohesion: 0.31
Nodes (4): normalizeMinus(), num(), parseFactorization(), parseNumberSet()

### Community 2 - "generators-ch1.js"
Cohesion: 0.23
Nodes (9): formatFactorization(), gcdExplanation(), gcdOf(), lcmExplanation(), lcmOf(), pick(), randInt(), shuffle() (+1 more)

### Community 3 - "init"
Cohesion: 0.15
Nodes (21): init(), addSpace(), averageTouchY(), beginDraw(), cancelCurrentStroke(), clear(), close(), drawSegment() (+13 more)

### Community 6 - "PROBLEM.md — Rà soát code moyumath (2026-09-30)"
Cohesion: 0.14
Nodes (12): checkMatchExpr(), initMatchingWidget(), drawConnections(), getCenter(), onStart(), normalizeExpr(), A. Bảo mật & tính toàn vẹn dữ liệu (nghiêm trọng nhất), B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp) (+4 more)

### Community 7 - "curriculum.test.mjs"
Cohesion: 0.07
Nodes (30): createRng(), DIFFICULTY_ORDER, distributeDifficulty(), nearestDifficulty(), poolOf(), presetIdFromParams(), resolvePreset(), validatePreset() (+22 more)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Reading documents (PDF/DOCX/PPTX/XLSX), Script loading order (keep as is), Structure, UI, Workflow

### Community 11 - "generators-ch2.js"
Cohesion: 0.60
Nodes (3): pick(), randInt(), shuffle()

### Community 16 - "part"
Cohesion: 0.06
Nodes (42): explain(), grade(), result(), solve(), describe(), explain(), grade(), LABELS (+34 more)

### Community 17 - "core/evaluator.js"
Cohesion: 0.08
Nodes (53): derive(), explain(), grade(), explain(), grade(), PAIRS, solve(), PAIRS (+45 more)

### Community 18 - "practice-page.js"
Cohesion: 0.10
Nodes (51): logout(), announce(), buildSummary(), cardName(), checkAnswer(), colorForPct(), examBadges(), init() (+43 more)

### Community 19 - "poly-simplify.js"
Cohesion: 0.14
Nodes (15): describe(), explain(), grade(), items(), render(), solve(), explain(), grade() (+7 more)

### Community 20 - "grading.js"
Cohesion: 0.11
Nodes (24): explain(), explain(), generate(), grade(), render(), solve(), grade(), REGIONS (+16 more)

### Community 21 - "formula-transform.js"
Cohesion: 0.15
Nodes (19): explain(), generate(), grade(), LEFT_MARKERS, render(), RIGHT_MARKERS, WHY, explain() (+11 more)

### Community 22 - "exam-page.js"
Cohesion: 0.09
Nodes (33): currentStudent(), KEYS, app, db, firebaseConfig, scaleResult(), randomSeed(), local (+25 more)

### Community 25 - "mountQuestion"
Cohesion: 0.14
Nodes (19): escapeAttr, MAP, initMatching(), addLine(), center(), changed(), connect(), detach() (+11 more)

### Community 26 - "power-rules-mixed.js"
Cohesion: 0.19
Nodes (15): render(), answers(), describe(), explain(), grade(), BASES, describe(), explain() (+7 more)

### Community 27 - "index-page.js"
Cohesion: 0.12
Nodes (36): escapeHtml(), axisPoint(), el(), formatTime(), init(), loadData(), practiceByProblem, RADAR (+28 more)

### Community 28 - "write-expression.js"
Cohesion: 0.24
Nodes (5): display(), explain(), grade(), TYPES_A, TYPES_B

## Knowledge Gaps
- **93 isolated node(s):** `SET_QUESTIONS`, `PAIRS`, `PAIRS`, `POOL`, `LABELS` (+88 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 197 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `So sánh đáp án (từ `js/core/evaluator.js`)` connect `part` to `generators-ch1.js`, `poly-simplify.js`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `showToast()` connect `exam-page.js` to `practice-page.js`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `E. Kiến trúc / bảo trì` connect `exam-page.js` to `PROBLEM.md — Rà soát code moyumath (2026-09-30)`?**
  _High betweenness centrality (0.048) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `init()` (e.g. with `scratchpad.js` and `addSpace()`) actually correct?**
  _`init()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `minus()` (e.g. with `grade()` and `So sánh đáp án (từ `js/core/evaluator.js`)`) actually correct?**
  _`minus()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SET_QUESTIONS`, `PAIRS`, `PAIRS` to the rest of the system?**
  _93 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._