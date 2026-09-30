# Build log — v0.1.0

## 2026-09-30

1. Preserved the supplied seed material under `public/original/` and the captured offline source capsules under `public/sources/`.
2. Imported all 40 seed concepts and all 102 seed edges without rewriting their provenance classes: 90 `captured cross-link` and 12 `curated neighbor`.
3. Extracted the static OPENRNDR semantic concept index and added it as a source-derived implementation layer. Added only separately labeled source-backed annotations, curated implementation bridges, and generated membership metadata.
4. Inspected Creative Coding Map for interaction patterns (force-directed spatial map, focus/recenter behavior, route tooling, inspector/index separation) without copying its source presentation into this project.
5. Implemented the offline-first Canvas map, search, inspectors, lenses, source/index/matrix views, weighted routing, Q-table lab, semantic zoom labels, and graph-dynamics Chaos Mode.
6. Replaced an early Chaos Mode jitter prototype with a bounded graph force simulation using edge springs, anchor/cluster gravity, repulsion, temperature/noise, damping, and stabilization.
7. Fixed fuzzy-search scoring so a successful alias match such as `GPU shader` cannot be erased by a failed title-subsequence score.
8. Fixed static-build public asset placement so `sources/` and `original/` resolve at runtime without Vite or network access.
9. Added explicit Shortest vs Mathematical route comparison in the Routes view.
10. Verified the requested acceptance chains and ran the full automated suite successfully. `npm test` passes and `npm run build` produces `dist/`.

## Verification note

A real Chromium/Playwright visual-navigation pass was attempted, but this execution environment blocks browser navigation to both loopback and synthetic local hosts (`ERR_BLOCKED_BY_ADMINISTRATOR`). Static HTTP asset checks, JavaScript syntax checks, route/graph tests, and the production build all pass. This is an environment limitation, not a substituted claim that browser interaction was visually verified here.
