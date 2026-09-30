# Fractal Chaos Coding Map

An offline-first computational cartography system connecting fractal mathematics, chaos, algorithms, machine models, rendering, creative coding, OPENRNDR and preserved source material.

## Run

```bash
npm test
npm run build
./serve.sh
# open http://127.0.0.1:8000
```

No npm dependencies are required for v0.1; Node is used only for build/tests and Python's standard library serves the static build.

## First milestone implemented
- seed `graph-data.json` import (40 nodes / 102 edges preserved)
- canvas pan/zoom, select→recenter, semantic label zoom
- node + edge inspectors
- cluster/lens filtering
- fuzzy search across aliases, tags, relations, source paths and OPENRNDR resources
- captured vs curated vs source-backed vs generated styling
- weighted routes + Shift-click route gesture
- local capsule + remote source links
- Index, Sources, Relationship Matrix, Routes, Q-table, OPENRNDR views
- Q-learning lab with explicit non-truth warning
- controlled Chaos Mode layout dynamics
- responsive inspector layout
- machine-readable split JSON exports

## Provenance discipline
See `docs/provenance-model.md`. The canonical graph never silently turns embeddings, curated links, generated cluster edges or Q-values into facts.

## Imported material
- `public/original/graph-data.seed.json`
- `public/original/fractal-computing-master-matrix.html`
- `public/original/fractal.lib.html`
- `public/original/openrndr-semantic-knowledge-tree.html`
- `public/sources/` local source capsules

## Build log
1. Inspected CC-Map live/public repo interaction architecture and kept only interaction ideas.
2. Preserved the 40/102 seed graph as canonical imported evidence.
3. Extracted 19 OPENRNDR semantic domains and their repo/source-path resources.
4. Added source-backed annotations from `fractal.lib.html`, generated cluster membership, and separately labeled curated implementation bridges.
5. Implemented UI-independent search/routing/Q modules and dependency-free Canvas map.
6. Added matrix/index/source/Q/OPENRNDR views, tests, and offline `dist` build.

## Verification

See [`docs/build-log.md`](docs/build-log.md) for the bounded build log and [`docs/acceptance.md`](docs/acceptance.md) for the north-star journey checks.
