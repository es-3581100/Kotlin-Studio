# Architecture

The first milestone deliberately uses **dependency-free browser ES modules + Canvas**, not React. The Creative Coding Map repository was inspected for interaction/data patterns (force-graph canvas rendering, node focus, path creation, index view, separate graph construction/routing logic), but this build avoids coupling the canonical graph to React and guarantees a runnable offline `dist/` with no package download.

Layers:
1. `data/*.json`: canonical serializable graph and cross-index exports.
2. `src/core/`: UI-independent indexing, fuzzy search, weighted Dijkstra routing, and Q-learning.
3. `src/ui/canvas-map.js`: pan/zoom, hit testing, recentering, semantic label zoom, edge styling, route projection, controlled Chaos Mode dynamics.
4. `src/app.js`: view state, inspectors, index/matrix/sources/Q-table/OPENRNDR panels.
5. `public/original/` + `public/sources/`: immutable source material and offline capsules.

The UI layer can later be replaced by React/`react-force-graph-2d` or projected into Kotlin/OPENRNDR without changing the canonical graph model.
