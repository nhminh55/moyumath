# Graph Report - moyumath  (2026-09-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 54 nodes · 75 edges · 9 communities (6 shown, 3 thin omitted)
- Extraction: 72% EXTRACTED · 28% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.85)
- Token cost: 27,946 input · 153 output

## Graph Freshness
- Built from commit: `6c196f80`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Scratchpad Drawing Strokes
- Math Answer Evaluation
- Question Generation Utilities
- Split-Pane Resizer Setup
- Scratchpad Init & Styles
- Canvas Resize & Expand
- Scratchpad Toolbar Controls

## God Nodes (most connected - your core abstractions)
1. `init()` - 24 edges
2. `onPointerMove()` - 5 edges
3. `beginDraw()` - 4 edges
4. `onPointerDown()` - 4 edges
5. `redrawAll()` - 4 edges
6. `toAbs()` - 4 edges
7. `normalizeMinus()` - 4 edges
8. `resizeCanvas()` - 4 edges
9. `averageTouchY()` - 3 edges
10. `cancelCurrentStroke()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `init()` --indirect_call--> `onPointerDown()`  [INFERRED]
  js/scratchpad.js → js/scratchpad.js  _Bridges community 0 → community 3_
- `init()` --indirect_call--> `addSpace()`  [INFERRED]
  js/scratchpad.js → js/scratchpad.js  _Bridges community 3 → community 7_
- `init()` --indirect_call--> `clear()`  [INFERRED]
  js/scratchpad.js → js/scratchpad.js  _Bridges community 3 → community 6_
- `init()` --indirect_call--> `close()`  [INFERRED]
  js/scratchpad.js → js/scratchpad.js  _Bridges community 3 → community 8_
- `resizeCanvas()` --calls--> `redrawAll()`  [EXTRACTED]
  js/scratchpad.js → js/scratchpad.js  _Bridges community 0 → community 7_

## Import Cycles
- None detected.

## Communities (9 total, 3 thin omitted)

### Community 0 - "Scratchpad Drawing Strokes"
Cohesion: 0.27
Nodes (10): averageTouchY(), beginDraw(), cancelCurrentStroke(), drawSegment(), onPointerDown(), onPointerMove(), redrawAll(), relPoint() (+2 more)

### Community 1 - "Math Answer Evaluation"
Cohesion: 0.31
Nodes (4): normalizeMinus(), num(), parseFactorization(), parseNumberSet()

### Community 2 - "Question Generation Utilities"
Cohesion: 0.36
Nodes (5): gcdOf(), lcmOf(), pick(), randInt(), shuffle()

### Community 3 - "Split-Pane Resizer Setup"
Cohesion: 0.40
Nodes (3): init(), isStacked(), onResizerMove()

### Community 7 - "Canvas Resize & Expand"
Cohesion: 0.67
Nodes (3): addSpace(), open(), resizeCanvas()

### Community 8 - "Scratchpad Toolbar Controls"
Cohesion: 0.67
Nodes (3): close(), refreshToolSelection(), toggle()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `init()` connect `Split-Pane Resizer Setup` to `Scratchpad Drawing Strokes`, `Scratchpad Toolbar Controls`, `Scratchpad Init & Styles`, `Canvas Resize & Expand`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Why does `onPointerMove()` connect `Scratchpad Drawing Strokes` to `Split-Pane Resizer Setup`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `onPointerDown()` connect `Scratchpad Drawing Strokes` to `Split-Pane Resizer Setup`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Are the 12 inferred relationships involving `init()` (e.g. with `scratchpad.js` and `addSpace()`) actually correct?**
  _`init()` has 12 INFERRED edges - model-reasoned connections that need verification._