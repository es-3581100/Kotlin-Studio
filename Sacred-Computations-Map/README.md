# Sacred-Computations

A provenance-first symbolic relationship atlas built from the supplied Golden Matrix, SymPy, and fractal-computing source capsules.

The project treats **SymPy as a bridge**, not as the subject: source mathematics is preserved as the conceptual layer, then selected equations/recurrences are translated into exact symbolic objects, matrix forms, numerical kernels, and generated Python/C/JavaScript/Rust expressions.


## 3D computation matrix

The Matrix tab renders the concept cross-index as a rotatable 3D lattice. X is the computation capability axis, Y is concept position, and Z separates mathematical clusters. It supports direct X/Y/Z rotation, drag rotation, zoom, cluster lenses, focus/picking, optional auto-rotation, and a full-screen visualization mode. The exact 2D table remains underneath as the readable/auditable representation of the same matrix data.

## What is inside

- **53 concepts / 85 relations** with relation provenance labels.
- **245 local source capsules**: 176 Golden Matrix, 28 SymPy/adjacent modern-code, 41 fractal-computing.
- Static offline atlas with graph, matrix, route, source, and SymPy Bridge views.
- Executable SymPy package/CLI for exact algebraic-root and route work.
- Generated bridge examples for golden/silver/plastic/Tribonacci/supergolden/supersilver ratios, recurrence matrices, Pythagorean parametrization, Chebyshev expansion, and complex iteration.

## Run the atlas

```bash
./serve.sh
# open http://127.0.0.1:8000/
```

## Run tests

```bash
python -m unittest discover -s tests -v
```

## Use the symbolic CLI

```bash
PYTHONPATH=python python -m sacred_computations show pell
PYTHONPATH=python python -m sacred_computations bridge silver-ratio
PYTHONPATH=python python -m sacred_computations route pell rust-target
PYTHONPATH=python python -m sacred_computations sources Rauzy
```

## Provenance discipline

Relations are labeled `source-backed`, `derived`, `implementation`, `curated`, or `structural`. An implementation edge means “this is a useful way to represent/execute the mathematics,” **not** “the source says these technologies are mathematically identical.”

See `docs/PROVENANCE.md`, `docs/BRIDGE-MODEL.md`, and `docs/SCHEMA.md`.