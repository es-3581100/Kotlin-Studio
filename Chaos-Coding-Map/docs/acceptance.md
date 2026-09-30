# Acceptance verification

The v0.1 graph was checked against the requested north-star journeys.

## Journey A

`Mandelbrot set → Mandelbulb`

Both `Shortest` and `Mathematical` route modes resolve. The Routes view renders them side by side for comparison and either route can be projected onto the map.

## Journey B

The exact requested implementation chain exists:

`OPENRNDR → Shaders & GPU → Fractal rendering → Orbit iteration → Julia set → Complex dynamics`

Edge provenance along that chain remains mixed and visible: source-backed OPENRNDR structure, curated implementation bridge, source-backed fractal annotations, and generated cluster membership metadata.

## Journey C

The exact requested chaos/visualization chain exists:

`Lyapunov exponent → Chaos → Iterative map → Visualization → Animation & Time`

The implementation-oriented hops are explicitly marked as curated bridges rather than mathematical proof.

## Automated checks

Run:

```bash
npm test
npm run build
./serve.sh
```

The base application requires no network connection or package installation at runtime.
