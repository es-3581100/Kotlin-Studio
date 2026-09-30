# AGENTS.md

## Build boundary
This project is an offline-first computational cartography UI. Treat `data/graph.json` as the canonical runtime export and `public/original/graph-data.seed.json` as immutable imported evidence.

## Provenance rules
- Never relabel a seed `captured cross-link` as a named mathematical fact without evidence.
- `curated implementation bridge` means useful implementation/navigation context, not proof.
- `generated` edges are structural metadata only.
- Q-values are navigation utility only.
- Preserve stable IDs for seed nodes (`n00`–`n39`).

## Workflow
Inspect → change smallest layer → `npm test` → `npm run build` → serve locally → interactively verify search/selection/route/source opening.
