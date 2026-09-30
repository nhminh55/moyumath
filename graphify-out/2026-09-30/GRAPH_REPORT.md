# Graph Report - moyumath  (2026-09-30)

## Corpus Check
- 19 files · ~111,797 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 1 file(s) not represented in the graph (top: .css 1)

## Summary
- 101 nodes · 129 edges · 16 communities (9 shown, 7 thin omitted)
- Extraction: 78% EXTRACTED · 22% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ec949b79`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- onPointerMove
- Math Answer Evaluation
- generators-ch1.js
- init
- logic-ch2.js
- 2026-09-20
- CLAUDE.md — moyumath
- refreshToolSelection
- os
- generators-ch2.js
- communication.md
- rules/graphify.md
- workflows/graphify.md
- README.md

## God Nodes (most connected - your core abstractions)
1. `init()` - 25 edges
2. `CLAUDE.md — moyumath` - 8 edges
3. `2026-09-20` - 7 edges
4. `redrawAll()` - 5 edges
5. `resizeCanvas()` - 5 edges
6. `onPointerMove()` - 5 edges
7. `initMatchingWidget()` - 5 edges
8. `normalizeMinus()` - 4 edges
9. `sup()` - 4 edges
10. `toAbs()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `2026-09-20` --references--> `init()`  [INFERRED]
  DONE.md → js/scratchpad.js
- `2026-09-20` --references--> `refreshToolSelection()`  [INFERRED]
  DONE.md → js/scratchpad.js
- `2026-09-20` --references--> `relPoint()`  [INFERRED]
  DONE.md → js/scratchpad.js
- `2026-09-20` --references--> `redrawAll()`  [INFERRED]
  DONE.md → js/scratchpad.js
- `2026-09-20` --references--> `resizeCanvas()`  [INFERRED]
  DONE.md → js/scratchpad.js

## Import Cycles
- None detected.

## Communities (16 total, 7 thin omitted)

### Community 0 - "onPointerMove"
Cohesion: 0.32
Nodes (8): averageTouchY(), beginDraw(), drawSegment(), onPointerDown(), onPointerMove(), relPoint(), strokePath(), toAbs()

### Community 1 - "Math Answer Evaluation"
Cohesion: 0.31
Nodes (4): normalizeMinus(), num(), parseFactorization(), parseNumberSet()

### Community 2 - "generators-ch1.js"
Cohesion: 0.23
Nodes (9): formatFactorization(), gcdExplanation(), gcdOf(), lcmExplanation(), lcmOf(), pick(), randInt(), shuffle() (+1 more)

### Community 3 - "init"
Cohesion: 0.31
Nodes (5): init(), clear(), isStacked(), onResizerMove(), injectStyles()

### Community 6 - "logic-ch2.js"
Cohesion: 0.27
Nodes (6): checkMatchExpr(), initMatchingWidget(), drawConnections(), getCenter(), onStart(), normalizeExpr()

### Community 7 - "2026-09-20"
Cohesion: 0.47
Nodes (6): 2026-09-20, addSpace(), cancelCurrentStroke(), open(), redrawAll(), resizeCanvas()

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.15
Nodes (11): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Reading documents (PDF/DOCX/PPTX/XLSX), Script loading order (keep as is), Structure, UI, Workflow (+3 more)

### Community 9 - "refreshToolSelection"
Cohesion: 0.67
Nodes (3): close(), refreshToolSelection(), toggle()

### Community 11 - "generators-ch2.js"
Cohesion: 0.83
Nodes (3): pick(), randInt(), shuffle()

## Knowledge Gaps
- **13 isolated node(s):** `Communication Rules`, `graphify`, `Workflow: graphify`, `Finding code (save tokens)`, `Structure` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 42 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `init()` connect `init` to `onPointerMove`, `refreshToolSelection`, `2026-09-20`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Why does `Nhật ký tính năng` connect `CLAUDE.md — moyumath` to `2026-09-20`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `2026-09-20` connect `2026-09-20` to `onPointerMove`, `refreshToolSelection`, `init`, `CLAUDE.md — moyumath`?**
  _High betweenness centrality (0.066) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `init()` (e.g. with `2026-09-20` and `scratchpad.js`) actually correct?**
  _`init()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `2026-09-20` (e.g. with `init()` and `cancelCurrentStroke()`) actually correct?**
  _`2026-09-20` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `redrawAll()` (e.g. with `2026-09-20` and `strokePath()`) actually correct?**
  _`redrawAll()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `resizeCanvas()` (e.g. with `2026-09-20` and `open()`) actually correct?**
  _`resizeCanvas()` has 2 INFERRED edges - model-reasoned connections that need verification._