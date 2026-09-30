#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
OUT=build-evidence/pure-smoke.jar
LOG=build-evidence/kotlinc-pure.log
SOURCES=(
  src/main/kotlin/util/MathUtil.kt
  src/main/kotlin/camera/ComplexViewport.kt
  src/main/kotlin/animation/Animator.kt
  src/main/kotlin/color/Palette.kt
  src/main/kotlin/fractal/Fractal.kt
  src/main/kotlin/fractal/ExplorerState.kt
  src/main/kotlin/render/RenderSnapshot.kt
  src/main/kotlin/preset/MiniJson.kt
  src/main/kotlin/preset/Preset.kt
  src/main/kotlin/experiment/DirectionalController.kt
  build-evidence/PureSmoke.kt
)
: > "$LOG"
kotlinc "${SOURCES[@]}" -include-runtime -d "$OUT" 2> >(tee -a "$LOG" >&2)
java -jar "$OUT" | tee build-evidence/pure-smoke.out
python3 build-evidence/verify_shader_contract.py | tee build-evidence/shader-static.out
