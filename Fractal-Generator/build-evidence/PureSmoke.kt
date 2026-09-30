import animation.PlaybackClock
import camera.ComplexPoint
import camera.ComplexViewport
import color.ColoringMode
import color.Palette
import experiment.Direction8
import experiment.DirectionalController
import fractal.ExplorerState
import fractal.FractalRegistry
import preset.PresetCodec
import preset.PresetLibrary
import render.SnapshotCompiler
import java.io.File
import kotlin.math.abs

fun main() {
    val v = ComplexViewport(ComplexPoint(-0.5, 0.0), 3.0)
    val before = v.screenToComplex(713.0, 244.0, 1280, 800)
    v.zoomAt(713.0, 244.0, 1280, 800, 0.4)
    val after = v.screenToComplex(713.0, 244.0, 1280, 800)
    check(abs(before.x-after.x) < 1e-12 && abs(before.y-after.y) < 1e-12) { "cursor anchor moved" }

    val state = ExplorerState()
    DirectionalController.moveJuliaC(state, Direction8.NE, 0.02)
    val snap = SnapshotCompiler.compile(state, 1.25)
    check(snap.iterations > 0 && snap.scale > 0.0)

    val preset = PresetCodec.capture("smoke", state, 2.0)
    val decoded = PresetCodec.decode(PresetCodec.encode(preset))
    check(decoded == preset) { "preset roundtrip failed" }

    check(PlaybackClock.deterministicTime(120, 60.0) == 2.0)
    check(FractalRegistry.all.map { it.id }.toSet() == setOf("mandelbrot", "julia", "multibrot", "tricorn", "burning-ship", "newton"))
    check(Palette.entries.size == 5)
    check(ColoringMode.entries.size == 4)

    val presetDir = File("src/main/resources/presets")
    val loaded = PresetLibrary.builtIns.map { name ->
        val p = PresetCodec.load(File(presetDir, name))
        p.applyTo(state)
        check(state.fractal.id == p.fractal)
        check(state.viewport.scale > 0.0)
        check(state.parameters.iterations in 4..2000)
        p.name
    }
    check(loaded.size == 6)

    println("PURE_SMOKE_PASS")
    println("anchor=$before")
    println("snapshot=$snap")
    println("presetBytes=${PresetCodec.encode(preset).length}")
    println("fractals=${FractalRegistry.all.joinToString { it.id }}")
    println("presets=${loaded.joinToString(" | ")}")
}
