# Graph Report - moyumath  (2026-09-30)

## Corpus Check
- 65 files · ~110,724 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 4 file(s) not represented in the graph (top: .css 4)

## Summary
- 527 nodes · 1288 edges · 24 communities (15 shown, 9 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `af659b5f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- Interface
- init
- PROBLEM.md — Rà soát code moyumath (2026-09-30)
- ref_node_vm
- CLAUDE.md — moyumath
- ref_fs
- os
- communication.md
- rules/graphify.md
- workflows/graphify.md
- README.md
- part
- evaluator.js
- practice-page.js
- poly-simplify.js
- grading.js
- formula-transform.js
- exam-page.js
- re
- ref_path
- mountQuestion
- curriculum.test.mjs
- write-expression.js

## God Nodes (most connected - your core abstractions)
1. `part()` - 37 edges
2. `num()` - 29 edges
3. `sameNumber()` - 24 edges
4. `init()` - 24 edges
5. `minus()` - 21 edges
6. `formatFactorization()` - 15 edges
7. `formatPoly()` - 15 edges
8. `getProblem()` - 15 edges
9. `mountQuestion()` - 15 edges
10. `gcd()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Trạng thái (cập nhật sau đợt tái cấu trúc, 2026-09-30)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/core/evaluator.js
- `E. Kiến trúc / bảo trì` --references--> `showToast()`  [INFERRED]
  PROBLEM.md → js/ui/toast.js
- `So sánh đáp án (từ `js/core/evaluator.js`)` --references--> `num()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/core/evaluator.js
- `So sánh đáp án (từ `js/core/evaluator.js`)` --references--> `sameNumber()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js

## Import Cycles
- None detected.

## Communities (24 total, 9 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (17): author, bugs, url, description, homepage, keywords, license, name (+9 more)

### Community 1 - "Interface"
Cohesion: 0.29
Nodes (6): curriculum/ — các dạng bài, Interface, Kết quả chấm (từ `js/core/grading.js`), `rng` (từ `js/core/rng.js`), Thêm một dạng bài mới, `ui` (do runner cung cấp)

### Community 3 - "init"
Cohesion: 0.15
Nodes (21): init(), addSpace(), averageTouchY(), beginDraw(), cancelCurrentStroke(), clear(), close(), drawSegment() (+13 more)

### Community 6 - "PROBLEM.md — Rà soát code moyumath (2026-09-30)"
Cohesion: 0.22
Nodes (8): A. Bảo mật & tính toàn vẹn dữ liệu (nghiêm trọng nhất), B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp), C. Luồng thi / luyện tập, D. Thống kê / dashboard, E. Kiến trúc / bảo trì, Lộ trình đề xuất (để thảo luận), PROBLEM.md — Rà soát code moyumath (2026-09-30), Trạng thái (cập nhật sau đợt tái cấu trúc, 2026-09-30)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Problem modules, Reading documents (PDF/DOCX/PPTX/XLSX), Structure, UI, Workflow

### Community 16 - "part"
Cohesion: 0.06
Nodes (52): explain(), grade(), render(), result(), solve(), grade(), grade(), describe() (+44 more)

### Community 17 - "evaluator.js"
Cohesion: 0.08
Nodes (52): derive(), explain(), explain(), PAIRS, solve(), PAIRS, solve(), explain() (+44 more)

### Community 18 - "practice-page.js"
Cohesion: 0.10
Nodes (50): announce(), buildSummary(), cardName(), checkAnswer(), colorForPct(), examBadges(), init(), limits (+42 more)

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
Nodes (32): currentStudent(), KEYS, logout(), app, db, firebaseConfig, scaleResult(), randomSeed() (+24 more)

### Community 25 - "mountQuestion"
Cohesion: 0.14
Nodes (19): escapeAttr, MAP, initMatching(), addLine(), center(), changed(), connect(), detach() (+11 more)

### Community 27 - "curriculum.test.mjs"
Cohesion: 0.06
Nodes (62): escapeHtml(), createRng(), axisPoint(), el(), formatTime(), init(), loadData(), practiceByProblem (+54 more)

### Community 28 - "write-expression.js"
Cohesion: 0.24
Nodes (5): display(), explain(), grade(), TYPES_A, TYPES_B

## Knowledge Gaps
- **92 isolated node(s):** `SET_QUESTIONS`, `PAIRS`, `PAIRS`, `POOL`, `LABELS` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 171 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `part()` connect `part` to `evaluator.js`, `poly-simplify.js`, `grading.js`, `formula-transform.js`, `write-expression.js`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `mountQuestion()` connect `mountQuestion` to `practice-page.js`, `exam-page.js`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `num()` connect `part` to `evaluator.js`, `poly-simplify.js`, `PROBLEM.md — Rà soát code moyumath (2026-09-30)`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `num()` (e.g. with `So sánh đáp án (từ `js/core/evaluator.js`)` and `B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp)`) actually correct?**
  _`num()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `init()` (e.g. with `scratchpad.js` and `addSpace()`) actually correct?**
  _`init()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `minus()` (e.g. with `grade()` and `So sánh đáp án (từ `js/core/evaluator.js`)`) actually correct?**
  _`minus()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SET_QUESTIONS`, `PAIRS`, `PAIRS` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._