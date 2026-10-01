import animation.PlaybackClock
import fractal.ExplorerState
import input.Controls
import org.openrndr.application
import org.openrndr.color.ColorRGBa
import org.openrndr.extensions.Screenshots
import render.GpuFractalRenderer
import render.SnapshotCompiler
import kotlin.math.roundToInt

private class FpsMeter {
    private var last = 0.0
    var fps = 0.0
        private set
    fun update(now: Double) {
        if (last > 0.0) {
            val instant = 1.0 / (now - last).coerceAtLeast(1e-6)
            fps = if (fps == 0.0) instant else fps * 0.92 + instant * 0.08
        }
        last = now
    }
}

fun main() = application {
    configure {
        width = 1280
        height = 800
        title = "Fractal Studio · OPENRNDR"
        windowResizable = true
    }
    program {
        val state = ExplorerState()
        val clock = PlaybackClock()
        val renderer = GpuFractalRenderer()
        val fps = FpsMeter()
        var message = "N/B fractal · drag pan · wheel zoom · A animation · C palette · V coloring · P/U preset · S screenshot"
        var lastTitleFrame = 0

        Controls(this, state, clock) { message = it }.install()

        // OPENRNDR Screenshots defaults to spacebar; configure S explicitly to avoid the pause key.
        extend(Screenshots().apply {
            key = "s"
            folder = "captures"
        })

        extend {
            val animationTime = clock.sample(seconds)
            fps.update(seconds)
            val snapshot = SnapshotCompiler.compile(state, animationTime)

            drawer.clear(ColorRGBa.BLACK)
            renderer.render(drawer, width, height, state.fractal, snapshot, state.palette, animationTime)

            if (frameCount - lastTitleFrame >= 12) {
                lastTitleFrame = frameCount
                window.title = buildString {
                    append("Fractal Studio · ${state.fractal.displayName}")
                    append(" · c=(%.9f, %.9f)".format(state.viewport.center.x, state.viewport.center.y))
                    append(" · scale=%.4g".format(snapshot.scale))
                    append(" · iter=${snapshot.iterations}")
                    append(" · p=%.2f".format(snapshot.power))
                    append(" · Julia=(%.3f,%.3f)".format(snapshot.juliaReal, snapshot.juliaImag))
                    append(" · ${state.palette.palette}/${state.palette.coloring}")
                    append(" · t=%.2f x%.2f%s".format(animationTime, clock.speed, if (clock.paused) " PAUSED" else ""))
                    append(" · ${fps.fps.roundToInt()} fps")
                    append(" · $message")
                }
            }
        }
    }
}