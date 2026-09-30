# Provenance model

- **source-backed** — relation is directly supported by one or more supplied capsules.
- **derived** — elementary mathematical derivation from source equations/recurrences, such as a recurrence companion matrix.
- **implementation** — a modern software representation or execution path (SymPy solve, lambdify, codegen).
- **curated** — a useful neighborhood/analogy that must not be read as theorem or identity.
- **structural** — atlas navigation only.

Every capsule is copied locally with its SHA-256 in `data/sources.json`. The source corpus intentionally preserves duplicate captures because capture identity/provenance can matter even when page titles overlap.
