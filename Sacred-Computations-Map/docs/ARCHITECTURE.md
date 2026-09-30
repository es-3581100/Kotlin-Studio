# Architecture

Sacred-Computations has four deliberately separate layers:

1. **Source corpus** — immutable-ish captured HTML capsules under `public/sources/`, indexed by SHA-256.
2. **Concept graph** — human-readable concepts and typed relations in JSON. This is the semantic heart of the project.
3. **Symbolic bridge** — selected concepts represented in SymPy as exact roots, polynomials, recurrence matrices, identities, or iteration expressions.
4. **Execution projections** — numerical kernels and source-language expressions downstream of the symbolic object.

The browser does not need SymPy. It reads precomputed JSON and remains offline-capable. Python/SymPy is used when the user wants to recompute, verify, inspect, or export the symbolic layer.

This separation is intentional: modern code is a *projection of the mathematics*, not a replacement for the source mathematics.
