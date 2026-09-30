package render

import animation.AnimationMode
import fractal.ExplorerState
import kotlin.math.exp

/** Immutable per-frame values. Render code consumes this; input code mutates ExplorerState. */
data class RenderSnapshot(
    val centerX: Double,
    val centerY: Double,
    val scale: Double,
    val rotation: Double,
    val iterations: Int,
    val escapeRadius: Double,
    val power: Double,
    val juliaReal: Double,
    val juliaImag: Double,
    val morph: Double,
    val palettePhase: Double,
)

object SnapshotCompiler {
    fun compile(state: ExplorerState, time: Double): RenderSnapshot {
        var phase = state.palette.phase
        var jr = state.parameters.juliaC.x
        var ji = state.parameters.juliaC.y
        var power = state.parameters.power
        var scale = state.viewport.scale
        if (state.animationEnabled) {
            val amount = state.animationAmount
            val mode = state.animationMode
            if (mode == AnimationMode.PALETTE || mode == AnimationMode.ALL) phase += state.paletteAnimator.offset(time) * amount
            if (mode == AnimationMode.JULIA || mode == AnimationMode.ALL) {
                jr += state.juliaRealAnimator.offset(time) * amount
                ji += state.juliaImagAnimator.offset(time) * amount
            }
            if (mode == AnimationMode.POWER || mode == AnimationMode.ALL) power = (power + state.powerAnimator.offset(time) * amount).coerceIn(1.15, 8.0)
            if (mode == AnimationMode.ZOOM || mode == AnimationMode.ALL) scale *= exp(state.zoomAnimator.offset(time) * amount)
        }
        return RenderSnapshot(
            centerX = state.viewport.center.x,
            centerY = state.viewport.center.y,
            scale = scale,
            rotation = state.viewport.rotation,
            iterations = state.parameters.iterations.coerceIn(4, 2000),
            escapeRadius = state.parameters.escapeRadius.coerceAtLeast(1.01),
            power = power,
            juliaReal = jr,
            juliaImag = ji,
            morph = state.parameters.morph.coerceIn(0.0, 1.0),
            palettePhase = phase,
        )
    }
}
