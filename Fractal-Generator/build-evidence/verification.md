# Verification report

Build date: 2026-09-30

## Status summary

| Check | Status | Evidence |
|---|---|---|
| Pure Kotlin camera/animation/fractal state compiles | PASS | `kotlinc-pure.log` + generated `pure-smoke.jar` (not tracked) |
| Cursor-centered zoom invariant | PASS | `pure-smoke.out` |
| Deterministic `frame / fps` time | PASS | `pure-smoke.out` |
| Fractal registry contains 6 modes | PASS | `pure-smoke.out` |
| All 6 bundled JSON presets decode and apply | PASS | `pure-smoke.out` |
| Preset encode/decode round-trip | PASS | `pure-smoke.out` |
| Optional 8-direction controller | PASS | exercised by `PureSmoke.kt` |
| Shader preamble/transform delimiter balance | PASS | `shader-static.out` |
| Shader `p_*` inputs have matching Kotlin uniforms | PASS | `shader-static.out` |
| Main Kotlin source internal syntax/integration | PASS (stub compile) | `integration-stub.out` |
| Full Gradle dependency build | NOT RUN — environment blocked | `full-build-attempt.txt` |
| Real OPENRNDR window launch | NOT RUN — dependency build blocked | `full-build-attempt.txt` |
| Driver-side GLSL compilation | NOT RUN — no built graphics runtime | `full-build-attempt.txt` |
| Interactive pan/zoom screenshot on real window | NOT RUN — no built graphics runtime | `full-build-attempt.txt` |

## What the integration stub means

`openrndr-api-stub/` is a deliberately tiny compile harness matching only the OPENRNDR contracts this project uses (Program/window/input events, Drawer/ShadeStyle, ColorRGBa, Vector2, Screenshots). It lets `kotlinc` compile every `src/main/kotlin` file and catches Kotlin/source integration mistakes.

It is **not** a replacement for compiling against the actual OPENRNDR artifacts. The actual API shapes were checked against the supplied OPENRNDR references and targeted current OPENRNDR source/template surfaces, but binary compatibility and GPU/runtime behavior still require a normal Gradle/OpenGL host.

## Environment boundary

The execution container has Java and `kotlinc`, but:

- no `gradle` executable;
- no project `gradlew` distribution;
- no cached `org.openrndr` artifacts;
- Maven Central DNS resolution is unavailable.

Because of that combination, the full `gradle build` cannot be honestly claimed here. On a normal development machine with Gradle/network access, run:

```bash
gradle test
gradle build
gradle run
```

Then verify the live boundary: visible Mandelbrot, drag pan, cursor zoom, parameter changes, animation/pause, palette changes, `S` screenshot, and shader compiler output.

## Reproduce non-window verification

```bash
./verify-pure.sh
```

Expected terminal markers:

```text
PURE_SMOKE_PASS
SHADER_STATIC_PASS
```

Source/resource checksums are in `SHA256SUMS.txt`. Generated verification JARs are intentionally excluded from the source repository and ignored by `.gitignore`.

## 2026-10-01 real Gradle compile feedback — fix1

A real `gradle run` on OPENRNDR resolved dependencies and reached Kotlin compilation. It exposed two source/API mismatches that the earlier isolated stub did not catch:

- `Configuration.resizable` was incorrect for this OPENRNDR API; production now uses `windowResizable = true`.
- `Controls.install()` executes inside `with(program)`, where OPENRNDR's `Program.clock` shadowed the `PlaybackClock` constructor property. The constructor property is now named `playbackClock` and all control handlers use it explicitly.

The API stub was corrected to use `windowResizable`, then every production Kotlin source was recompiled against the corrected stub successfully (`KOTLIN_INTEGRATION_STUB_PASS_FIX1`). This still does not replace the real OPENRNDR/driver runtime test; rerun `gradle run` on the graphics host to surface the next real boundary, if any.
