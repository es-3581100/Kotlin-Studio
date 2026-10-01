# Build notes

Input corpus discovered:

- Golden Matrix bundle: 176 capsules copied.
- Symbolic/modern-code bundle: 32 total capsules; 4 platform-specific capsules were intentionally excluded, leaving 28.
- Fractal-computing bundle: 41 capsules copied.

The static site has no JavaScript package dependency. SymPy is required only for rebuilding/validating live symbolic bridges or using the Python CLI. Bridge JSON was generated with SymPy 1.14.0.

## 2026-09-30 — 3D matrix + HUD UI pass

The Matrix view now has a true 3D data projection rather than a cosmetic rotation. Its axes encode:

- **X:** computation capability (`Formula`, `Sources`, `SymPy bridge`, `Matrix lane`, `Code lane`)
- **Y:** concepts within each mathematical cluster
- **Z:** mathematical clusters

Interaction contract:

- pointer drag rotates X/Y;
- Shift-drag or right-drag rotates Z;
- X/Y/Z sliders provide exact direct control;
- mouse wheel and zoom slider control perspective scale;
- arrow keys rotate X/Y, `Q`/`E` rotate Z;
- cluster lens filters the 3D scene;
- clicking an active cell focuses its source concept;
- auto-rotate is optional and can be paused;
- reset restores the canonical view;
- the matrix stage uses the browser Fullscreen API with a CSS fallback;
- the exact cross-index table remains below the 3D renderer as the auditable fallback.

The visual language was reworked from the supplied HUD reference using original CSS: black/blue-green glass panels, thin cyan instrumentation lines, corner brackets, restrained glow, monospace telemetry, and compact status readouts. The reference image is inspiration only and is not redistributed in the project.