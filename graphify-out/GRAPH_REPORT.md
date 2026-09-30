# Graph Report - moyumath  (2026-09-30)

## Corpus Check
- 24 files · ~110,940 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 151 nodes · 178 edges · 17 communities (10 shown, 7 thin omitted)
- Extraction: 86% EXTRACTED · 14% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f706c738`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- evaluator.js
- generators-ch1.js
- init
- logic-ch2.js
- generators.test.mjs
- CLAUDE.md — moyumath
- bump.js
- os
- generators-ch2.js
- communication.md
- rules/graphify.md
- workflows/graphify.md
- README.md
- PROBLEM.md — Rà soát code moyumath (2026-09-30)

## God Nodes (most connected - your core abstractions)
1. `init()` - 24 edges
2. `CLAUDE.md — moyumath` - 8 edges
3. `PROBLEM.md — Rà soát code moyumath (2026-09-30)` - 7 edges
4. `onPointerMove()` - 5 edges
5. `initMatchingWidget()` - 5 edges
6. `normalizeMinus()` - 4 edges
7. `sup()` - 4 edges
8. `toAbs()` - 4 edges
9. `redrawAll()` - 4 edges
10. `resizeCanvas()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp)` --references--> `checkMatchExpr()`  [INFERRED]
  PROBLEM.md → logic-ch2.js
- `B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/evaluator.js
- `B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp)` --references--> `parseNumberSet()`  [INFERRED]
  PROBLEM.md → js/evaluator.js

## Import Cycles
- None detected.

## Communities (17 total, 7 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (17): author, bugs, url, description, homepage, keywords, license, main (+9 more)

### Community 1 - "evaluator.js"
Cohesion: 0.29
Nodes (5): normalizeMinus(), num(), parseFactorization(), parseNumberSet(), B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp)

### Community 2 - "generators-ch1.js"
Cohesion: 0.23
Nodes (9): formatFactorization(), gcdExplanation(), gcdOf(), lcmExplanation(), lcmOf(), pick(), randInt(), shuffle() (+1 more)

### Community 3 - "init"
Cohesion: 0.15
Nodes (21): init(), addSpace(), averageTouchY(), beginDraw(), cancelCurrentStroke(), clear(), close(), drawSegment() (+13 more)

### Community 6 - "logic-ch2.js"
Cohesion: 0.27
Nodes (6): checkMatchExpr(), initMatchingWidget(), drawConnections(), getCenter(), onStart(), normalizeExpr()

### Community 7 - "generators.test.mjs"
Cohesion: 0.15
Nodes (11): ref_node_assert, ref_node_fs, ref_node_path, ref_node_test, ref_node_url, ref_node_vm, W, loadLegacy() (+3 more)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Reading documents (PDF/DOCX/PPTX/XLSX), Script loading order (keep as is), Structure, UI, Workflow

### Community 9 - "bump.js"
Cohesion: 0.20
Nodes (9): fs, htmlFiles, newVersion, parts, path, pkg, pkgPath, ref_fs (+1 more)

### Community 11 - "generators-ch2.js"
Cohesion: 0.60
Nodes (3): pick(), randInt(), shuffle()

### Community 16 - "PROBLEM.md — Rà soát code moyumath (2026-09-30)"
Cohesion: 0.29
Nodes (6): A. Bảo mật & tính toàn vẹn dữ liệu (nghiêm trọng nhất), C. Luồng thi / luyện tập, D. Thống kê / dashboard, E. Kiến trúc / bảo trì, Lộ trình đề xuất (để thảo luận), PROBLEM.md — Rà soát code moyumath (2026-09-30)

## Knowledge Gaps
- **39 isolated node(s):** `fs`, `path`, `pkgPath`, `pkg`, `parts` (+34 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 81 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `B. Lỗi logic chấm điểm / sinh đề (ảnh hưởng học sinh trực tiếp)` connect `evaluator.js` to `PROBLEM.md — Rà soát code moyumath (2026-09-30)`, `logic-ch2.js`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `checkMatchExpr()` connect `logic-ch2.js` to `evaluator.js`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `init()` (e.g. with `scratchpad.js` and `addSpace()`) actually correct?**
  _`init()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **What connects `fs`, `path`, `pkgPath` to the rest of the system?**
  _39 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `init` be split into smaller, more focused modules?**
  _Cohesion score 0.14666666666666667 - nodes in this community are weakly interconnected._