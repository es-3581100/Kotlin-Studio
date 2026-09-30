package input

import animation.AnimationMode
import animation.PlaybackClock
import fractal.ExplorerState
import fractal.FractalRegistry
import org.openrndr.Program
import preset.PresetCodec
import preset.PresetLibrary
import java.io.File
import kotlin.math.exp

class Controls(
    private val program: Program,
    private val state: ExplorerState,
    private val clock: PlaybackClock,
    private val onMessage: (String) -> Unit,
) {
    private var presetIndex = 0

    fun install() = with(program) {
        mouse.dragged.listen {
            state.viewport.panPixels(it.dragDisplacement.x, it.dragDisplacement.y, width, height)
        }
        mouse.scrolled.listen {
            val factor = exp(it.rotation.y * 0.12)
            state.viewport.zoomAt(mouse.position.x, mouse.position.y, width, height, factor)
        }
        keyboard.keyDown.listen { e ->
            when (e.name.lowercase()) {
                "space", "spacebar" -> { clock.togglePaused(); onMessage(if (clock.paused) "paused" else "playing") }
                "r" -> { state.resetView(); onMessage("view reset") }
                "n" -> { state.selectFractal(FractalRegistry.next(state.fractal)); onMessage(state.fractal.displayName) }
                "b" -> { state.selectFractal(FractalRegistry.next(state.fractal, -1)); onMessage(state.fractal.displayName) }
                "left", "arrow-left" -> { state.viewport.center = state.viewport.center.copy(x = state.viewport.center.x - state.viewport.scale * 0.03) }
                "right", "arrow-right" -> { state.viewport.center = state.viewport.center.copy(x = state.viewport.center.x + state.viewport.scale * 0.03) }
                "up", "arrow-up" -> { state.viewport.center = state.viewport.center.copy(y = state.viewport.center.y + state.viewport.scale * 0.03) }
                "down", "arrow-down" -> { state.viewport.center = state.viewport.center.copy(y = state.viewport.center.y - state.viewport.scale * 0.03) }
                "a" -> { state.animationEnabled = !state.animationEnabled; onMessage("animation=${state.animationEnabled}") }
                "m" -> { state.animationMode = AnimationMode.entries[(state.animationMode.ordinal + 1) % AnimationMode.entries.size]; onMessage("animation=${state.animationMode}") }
                "c" -> { state.palette.palette = state.palette.palette.next(); onMessage("palette=${state.palette.palette}") }
                "v" -> { state.palette.coloring = state.palette.coloring.next(); onMessage("coloring=${state.palette.coloring}") }
                "t" -> { clock.speed = when (clock.speed) { 0.25 -> 0.5; 0.5 -> 1.0; 1.0 -> 2.0; 2.0 -> 4.0; else -> 0.25 }; onMessage("time x${clock.speed}") }
                "=", "+", "kp_add" -> { state.parameters.iterations = (state.parameters.iterations + 32).coerceAtMost(2000) }
                "-", "kp_subtract" -> { state.parameters.iterations = (state.parameters.iterations - 32).coerceAtLeast(4) }
                "q" -> { state.parameters.power = (state.parameters.power - 0.1).coerceAtLeast(1.15) }
                "e" -> { state.parameters.power = (state.parameters.power + 0.1).coerceAtMost(8.0) }
                "j" -> { state.parameters.juliaC = state.parameters.juliaC.copy(x = state.parameters.juliaC.x - 0.01) }
                "l" -> { state.parameters.juliaC = state.parameters.juliaC.copy(x = state.parameters.juliaC.x + 0.01) }
                "i" -> { state.parameters.juliaC = state.parameters.juliaC.copy(y = state.parameters.juliaC.y + 0.01) }
                "k" -> { state.parameters.juliaC = state.parameters.juliaC.copy(y = state.parameters.juliaC.y - 0.01) }
                "g" -> { state.parameters.morph = (state.parameters.morph + 0.05).coerceAtMost(1.0); onMessage("morph=${"%.2f".format(state.parameters.morph)}") }
                "f" -> { state.parameters.morph = (state.parameters.morph - 0.05).coerceAtLeast(0.0); onMessage("morph=${"%.2f".format(state.parameters.morph)}") }
                "p" -> {
                    val file = File("presets/last.json")
                    PresetCodec.save(file, PresetCodec.capture("saved", state, clock.speed))
                    onMessage("saved ${file.path}")
                }
                "u" -> {
                    val file = File("presets/last.json")
                    if (file.exists()) {
                        val p = PresetCodec.load(file); p.applyTo(state); clock.speed = p.timeScale; onMessage("loaded ${file.path}")
                    } else onMessage("no ${file.path}")
                }
                "o" -> {
                    val p = PresetLibrary.loadBuiltIn(presetIndex++); p.applyTo(state); clock.speed = p.timeScale; onMessage("preset=${p.name}")
                }
            }
        }
    }
}
