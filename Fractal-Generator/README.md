# Fractal Studio · Kotlin + OPENRNDR

A GPU-first interactive fractal explorer and animator. Kotlin owns state, input, camera math, animation, presets, and orchestration; one OPENRNDR `ShadeStyle` runs the per-pixel complex iteration on the GPU.

## Requirements

- JDK 17+ (the current template targets JVM 17)
- Gradle 9.x recommended (or add the Gradle wrapper from your normal OPENRNDR template)
- OpenGL-capable desktop
- OPENRNDR 0.5.0 dependencies from Maven Central

## Run

```bash
gradle run
```

The project intentionally keeps ORX optional in the core. It uses OPENRNDR core plus the standard `Screenshots` extension.

## Controls

- **drag** — pan in the complex plane
- **mouse wheel** — zoom around the cursor (the complex point under the cursor is preserved)
- **N / B** — next / previous fractal
- **arrow keys** — fine pan
- **R** — reset current fractal view
- **Space** — pause/resume animation time
- **T** — time warp: 0.25× → 0.5× → 1× → 2× → 4×
- **A** — toggle animation
- **M** — cycle animation target (palette / Julia / power / zoom / all)
- **C** — cycle palettes
- **V** — cycle coloring modes
- **+ / -** — iteration limit
- **Q / E** — decrease/increase Multibrot exponent
- **J/L + I/K** — move Julia constant
- **F / G** — Mandelbrot↔Julia-compatible morph parameter
- **O** — cycle built-in presets
- **P** — save `presets/last.json`
- **U** — load `presets/last.json`
- **S** — PNG screenshot via OPENRNDR `Screenshots`

The window title is the lightweight status UI and shows fractal, center, scale, iterations, exponent, Julia C, palette/color mode, animation time/speed, pause state, and smoothed FPS.

## Architecture

```text
mouse/keyboard ──> input.Controls ──> ExplorerState
                                      │
                                      ├── ComplexViewport
wall clock ──> PlaybackClock ─────────┤
                                      ├── SnapshotCompiler ──> RenderSnapshot
presets <────> PresetCodec ───────────┤                         │
                                      │                         v
                                      └──────────────> GpuFractalRenderer
                                                               │
                                                               v
                                                     ShadeStyle GLSL / GPU
                                                               │
                                                iteration/orbit diagnostics
                                                               │
                                                               v
                                                    palette/color mapping
```

### Fractal layer

Registered modes are:

1. **Mandelbrot** — `z₀=0`, `zₙ₊₁=zₙ²+c`
2. **Julia** — fixed `c`, varying `z₀`
3. **Multibrot** — `zₙ₊₁=zₙ^p+c`, real-valued interactive `p` using the shader’s principal polar branch
4. **Tricorn** — conjugate quadratic iteration
5. **Burning Ship** — component-wise absolute-value fold before quadratic iteration
6. **Newton z³−1** — Newton iteration colored by attracting root and convergence speed

`FractalRegistry` keeps formula identity/defaults separate from `Main.kt`. Adding a compatible shader mode does not require reworking camera or animation code.

### Shader layout

`src/main/resources/shaders/fractal-preamble.glsl` contains GLSL helpers and `fractal-transform.glsl` contains the OPENRNDR ShadeStyle fragment transform. The style is created once and its uniforms are updated each frame; it is not rebuilt/recompiled on every draw.

Supported uniforms include center, scale, rotation, iteration limit, escape radius, Julia C, exponent, morph, time, resolution, palette, palette phase/frequency, color mapping and inside color.

### Color engine

Iteration/orbit diagnostics are separated from palette selection. Color mappings:

- smooth escape
- iteration bands
- orbit trap
- orbit angle

Procedural palettes: Aurora, Ember, Ice, Neon and Mono. Palette phase is animatable.

### Animation model

`Modulator` = `waveform + amplitude + speed + phase`. Implemented waveforms: Constant, Sine, Triangle, Saw and PingPong. `PlaybackClock` is pauseable/time-scalable and also exposes deterministic `frame → time` conversion for later offline frame-sequence export.

The current live rig animates palette phase, Julia C, exponent and zoom without embedding `sin(seconds)` inside fractal formulas.

### Morphing

The shader exposes one **mathematically compatible** interpolation for the `z^p+c` family: seed/parameter behavior can move between Mandelbrot-like (`z=0,c=pixel`) and Julia-like (`z=pixel,c=fixed`). Incompatible formulas such as Newton are not falsely labeled as mathematical morphs.

### Presets

JSON presets capture fractal ID, camera, formula parameters, iteration/escape settings, palette/color mode, animation state and time scale. Six built-ins live under `src/main/resources/presets/`.

### Export

PNG capture uses OPENRNDR's standard `Screenshots` extension. The deterministic clock API is already present for a later high-resolution frame-sequence exporter where `frameNumber / fps` is the authoritative animation time.

## Supplied-session influence

The local OPENRNDR reference established `application → program → extend`, input listeners as state updates, `seconds/frameCount`, `ShadeStyle`, render targets and screenshot/recording extensions. The supplied fractal library directly supported Mandelbrot, Julia, Multibrot, Tricorn and Newton as the first mathematical family set and explicitly separated rendering from iteration/orbit diagnostics.

The supplied fractal graph/Q-table is treated as a navigation/knowledge layer, not as mathematical authority. The renderer has no Q-learning dependency. `experiment/DirectionalController.kt` provides an optional deterministic 8-direction parameter-space surface that can later be connected to the directional matrix/Q-table runtime without changing rendering state.

## Verification

Use:

```bash
gradle test
gradle build
gradle run
```

Pure Kotlin camera/animation/preset logic is also testable without a graphics context. If the build host has no Maven/Gradle network or no OpenGL display, those are environment boundaries rather than silent fallbacks; see `build-evidence/` in the preserved artifact.

## Known limitations / next extensions

- No deep-zoom arbitrary precision yet; standard GPU floating-point eventually loses precision.
- Newton is currently the canonical `z³−1` root set; generalized polynomials can be a separate definition.
- Frame-sequence/video export should be added as a deterministic offline renderer instead of coupling reproducibility to wall-clock recording.
- Orbit traps can be expanded beyond the current axis-distance diagnostic.
- The optional 8-direction controller is not yet wired to the supplied Q-table because Q-learning is deliberately outside the render core.
- Higher-resolution offscreen render targets and post-processing/ORX FX are natural next layers after the live GPU path is verified on a graphics host.
