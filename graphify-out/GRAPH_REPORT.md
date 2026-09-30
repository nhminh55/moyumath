# Graph Report - moyumath  (2026-09-30)

## Corpus Check
- 55 files · ~126,749 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 405 nodes · 865 edges · 25 communities (15 shown, 10 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `dc4f5316`
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
- mathfmt.js
- core/evaluator.js
- formatPoly
- number-sets.js
- formula-transform.js
- grading.js
- re
- ref_path

## God Nodes (most connected - your core abstractions)
1. `part()` - 37 edges
2. `num()` - 26 edges
3. `sameNumber()` - 24 edges
4. `init()` - 24 edges
5. `minus()` - 20 edges
6. `formatPoly()` - 15 edges
7. `gcd()` - 14 edges
8. `formatFactorization()` - 14 edges
9. `sup` - 12 edges
10. `parseExpr()` - 11 edges

## Surprising Connections (you probably didn't know these)
- `So sánh đáp án (từ `js/core/evaluator.js`)` --references--> `sameNumber()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `So sánh đáp án (từ `js/core/evaluator.js`)` --references--> `minus()`  [INFERRED]
  curriculum/README.md → js/core/mathfmt.js
- `So sánh đáp án (từ `js/core/evaluator.js`)` --references--> `formatPoly()`  [INFERRED]
  curriculum/README.md → js/core/mathfmt.js
- `So sánh đáp án (từ `js/core/evaluator.js`)` --references--> `sup()`  [INFERRED]
  curriculum/README.md → js/generators-ch1.js
- `B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp)` --references--> `checkMatchExpr()`  [INFERRED]
  PROBLEM.md → logic-ch2.js

## Import Cycles
- None detected.

## Communities (25 total, 10 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (17): author, bugs, url, description, homepage, keywords, license, name (+9 more)

### Community 1 - "js/evaluator.js"
Cohesion: 0.31
Nodes (4): normalizeMinus(), num(), parseFactorization(), parseNumberSet()

### Community 2 - "generators-ch1.js"
Cohesion: 0.12
Nodes (16): curriculum/ — các dạng bài, Interface, Kết quả chấm (từ `js/core/grading.js`), `rng` (từ `js/core/rng.js`), So sánh đáp án (từ `js/core/evaluator.js`), Thêm một dạng bài mới, `ui` (do runner cung cấp), formatFactorization() (+8 more)

### Community 3 - "init"
Cohesion: 0.15
Nodes (21): init(), addSpace(), averageTouchY(), beginDraw(), cancelCurrentStroke(), clear(), close(), drawSegment() (+13 more)

### Community 6 - "PROBLEM.md — Rà soát code moyumath (2026-09-30)"
Cohesion: 0.13
Nodes (13): checkMatchExpr(), initMatchingWidget(), drawConnections(), getCenter(), onStart(), normalizeExpr(), A. Bảo mật & tính toàn vẹn dữ liệu (nghiêm trọng nhất), B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp) (+5 more)

### Community 7 - "curriculum.test.mjs"
Cohesion: 0.06
Nodes (33): createRng(), allChapters(), byId, byLabelAnyChapter, byLegacyLabel, byPracticeKey, chapterFromLegacy(), getProblem() (+25 more)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Reading documents (PDF/DOCX/PPTX/XLSX), Script loading order (keep as is), Structure, UI, Workflow

### Community 11 - "generators-ch2.js"
Cohesion: 0.60
Nodes (3): pick(), randInt(), shuffle()

### Community 16 - "part"
Cohesion: 0.07
Nodes (48): explain(), grade(), render(), result(), solve(), grade(), explain(), grade() (+40 more)

### Community 17 - "mathfmt.js"
Cohesion: 0.14
Nodes (25): derive(), explain(), grade(), explain(), PAIRS, solve(), PAIRS, solve() (+17 more)

### Community 18 - "core/evaluator.js"
Cohesion: 0.16
Nodes (25): explain(), grade(), items(), render(), solve(), equivalent(), evalExpr(), isFactoredBy() (+17 more)

### Community 19 - "formatPoly"
Cohesion: 0.16
Nodes (14): explain(), grade(), items(), render(), solve(), explain(), grade(), solve() (+6 more)

### Community 20 - "number-sets.js"
Cohesion: 0.20
Nodes (19): explain(), explain(), generate(), grade(), render(), solve(), grade(), REGIONS (+11 more)

### Community 21 - "formula-transform.js"
Cohesion: 0.17
Nodes (19): explain(), generate(), grade(), LEFT_MARKERS, render(), RIGHT_MARKERS, WHY, explain() (+11 more)

### Community 22 - "grading.js"
Cohesion: 0.14
Nodes (10): grade(), display(), explain(), grade(), TYPES_A, TYPES_B, partial(), round2() (+2 more)

## Knowledge Gaps
- **68 isolated node(s):** `SET_QUESTIONS`, `PAIRS`, `PAIRS`, `POOL`, `LABELS` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 149 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `So sánh đáp án (từ `js/core/evaluator.js`)` connect `generators-ch1.js` to `part`, `formatPoly`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `part()` connect `part` to `mathfmt.js`, `core/evaluator.js`, `formatPoly`, `number-sets.js`, `formula-transform.js`, `grading.js`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `init()` (e.g. with `scratchpad.js` and `addSpace()`) actually correct?**
  _`init()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `minus()` (e.g. with `grade()` and `So sánh đáp án (từ `js/core/evaluator.js`)`) actually correct?**
  _`minus()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SET_QUESTIONS`, `PAIRS`, `PAIRS` to the rest of the system?**
  _68 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `generators-ch1.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12380952380952381 - nodes in this community are weakly interconnected._