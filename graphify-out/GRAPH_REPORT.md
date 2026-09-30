# Graph Report - moyumath  (2026-09-30)

## Corpus Check
- 65 files · ~111,940 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .css 4, (none) 1)

## Summary
- 530 nodes · 1295 edges · 24 communities (15 shown, 9 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0b9b2391`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- package.json
- Interface
- curriculum.test.mjs
- init
- power-rules-mixed.js
- ref_node_vm
- CLAUDE.md — moyumath
- ref_fs
- os
- communication.md
- rules/graphify.md
- workflows/graphify.md
- README.md
- num
- part
- practice-page.js
- evaluator.js
- number-sets.js
- formula-transform.js
- exam-page.js
- re
- ref_path
- initMatching
- index-page.js

## God Nodes (most connected - your core abstractions)
1. `part()` - 37 edges
2. `num()` - 29 edges
3. `sameNumber()` - 24 edges
4. `init()` - 24 edges
5. `minus()` - 20 edges
6. `formatFactorization()` - 15 edges
7. `formatPoly()` - 15 edges
8. `getProblem()` - 15 edges
9. `mountQuestion()` - 15 edges
10. `gcd()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Status (updated after the refactor, 2026-09-30)` --references--> `num()`  [INFERRED]
  PROBLEM.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `parseFactorization()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `factorizationMatches()`  [INFERRED]
  curriculum/README.md → js/core/evaluator.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `formatFactorization()`  [INFERRED]
  curriculum/README.md → js/core/mathfmt.js
- `Comparing answers (from `js/core/evaluator.js`)` --references--> `formatPoly()`  [INFERRED]
  curriculum/README.md → js/core/mathfmt.js

## Import Cycles
- None detected.

## Communities (24 total, 9 thin omitted)

### Community 0 - "package.json"
Cohesion: 0.11
Nodes (17): author, bugs, url, description, homepage, keywords, license, name (+9 more)

### Community 1 - "Interface"
Cohesion: 0.29
Nodes (6): Adding a new problem type, curriculum/ — problem types, Grading results (from `js/core/grading.js`), Interface, `rng` (from `js/core/rng.js`), `ui` (provided by the runner)

### Community 2 - "curriculum.test.mjs"
Cohesion: 0.11
Nodes (14): createRng(), ref_node_fs, ref_node_path, ref_node_url, htmlFiles, newVersion, parts, pkg (+6 more)

### Community 3 - "init"
Cohesion: 0.15
Nodes (21): init(), addSpace(), averageTouchY(), beginDraw(), cancelCurrentStroke(), clear(), close(), drawSegment() (+13 more)

### Community 4 - "power-rules-mixed.js"
Cohesion: 0.19
Nodes (15): render(), answers(), describe(), explain(), grade(), BASES, describe(), explain() (+7 more)

### Community 8 - "CLAUDE.md — moyumath"
Cohesion: 0.22
Nodes (8): CLAUDE.md — moyumath, Finding code (save tokens), Firestore & practice, Problem modules, Reading documents (PDF/DOCX/PPTX/XLSX), Structure, UI, Workflow

### Community 16 - "num"
Cohesion: 0.06
Nodes (44): explain(), grade(), result(), solve(), describe(), explain(), grade(), LABELS (+36 more)

### Community 17 - "part"
Cohesion: 0.12
Nodes (28): derive(), explain(), grade(), explain(), grade(), PAIRS, solve(), PAIRS (+20 more)

### Community 18 - "practice-page.js"
Cohesion: 0.07
Nodes (54): app, db, firebaseConfig, loadFirebase(), announce(), buildSummary(), cardName(), colorForPct() (+46 more)

### Community 19 - "evaluator.js"
Cohesion: 0.06
Nodes (44): describe(), explain(), grade(), items(), render(), solve(), describe(), explain() (+36 more)

### Community 20 - "number-sets.js"
Cohesion: 0.12
Nodes (22): explain(), explain(), generate(), grade(), render(), solve(), grade(), REGIONS (+14 more)

### Community 21 - "formula-transform.js"
Cohesion: 0.15
Nodes (19): explain(), generate(), grade(), LEFT_MARKERS, render(), RIGHT_MARKERS, WHY, explain() (+11 more)

### Community 22 - "exam-page.js"
Cohesion: 0.09
Nodes (38): escapeAttr, MAP, round2(), scaleResult(), totalEarned(), totalMax(), randomSeed(), buildExam() (+30 more)

### Community 25 - "initMatching"
Cohesion: 0.36
Nodes (10): initMatching(), addLine(), center(), changed(), connect(), detach(), draw(), endDrag() (+2 more)

### Community 27 - "index-page.js"
Cohesion: 0.07
Nodes (53): currentStudent(), KEYS, logout(), escapeHtml(), local, session, axisPoint(), el() (+45 more)

## Knowledge Gaps
- **92 isolated node(s):** `SET_QUESTIONS`, `PAIRS`, `PAIRS`, `POOL`, `LABELS` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 171 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `part()` connect `part` to `power-rules-mixed.js`, `num`, `evaluator.js`, `number-sets.js`, `formula-transform.js`, `exam-page.js`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `mountQuestion()` connect `exam-page.js` to `initMatching`, `practice-page.js`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `num()` connect `num` to `part`, `evaluator.js`, `power-rules-mixed.js`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `num()` (e.g. with `Comparing answers (from `js/core/evaluator.js`)` and `B. Grading / problem-generation bugs (directly affect students)`) actually correct?**
  _`num()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 12 inferred relationships involving `init()` (e.g. with `scratchpad.js` and `addSpace()`) actually correct?**
  _`init()` has 12 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `minus()` (e.g. with `grade()` and `Comparing answers (from `js/core/evaluator.js`)`) actually correct?**
  _`minus()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `SET_QUESTIONS`, `PAIRS`, `PAIRS` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._