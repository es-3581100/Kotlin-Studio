package experiment

import camera.ComplexPoint
import fractal.ExplorerState

enum class Direction8(val dx: Int, val dy: Int) {
    N(0,1), NE(1,1), E(1,0), SE(1,-1), S(0,-1), SW(-1,-1), W(-1,0), NW(-1,1)
}

/** Optional deterministic 8-direction experiment. No Q-learning is required by the renderer. */
object DirectionalController {
    fun moveJuliaC(state: ExplorerState, direction: Direction8, amount: Double = 0.02) {
        val c = state.parameters.juliaC
        state.parameters.juliaC = ComplexPoint(c.x + direction.dx * amount, c.y + direction.dy * amount)
    }

    fun moveView(state: ExplorerState, direction: Direction8, fraction: Double = 0.08) {
        val v = state.viewport
        val step = v.scale * fraction
        v.center = ComplexPoint(v.center.x + direction.dx * step, v.center.y + direction.dy * step)
    }
}
