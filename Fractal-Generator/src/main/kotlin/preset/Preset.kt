package preset

import animation.AnimationMode
import camera.ComplexPoint
import camera.ComplexViewport
import color.ColoringMode
import color.Palette
import color.PaletteState
import color.Rgb
import fractal.ExplorerState
import fractal.FractalParameters
import fractal.FractalRegistry
import java.io.File

data class FractalPreset(
    val name: String,
    val fractal: String,
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
    val palette: String,
    val coloring: String,
    val palettePhase: Double,
    val paletteFrequency: Double,
    val insideColor: String,
    val animationEnabled: Boolean,
    val animationMode: String,
    val animationAmount: Double,
    val timeScale: Double,
) {
    fun applyTo(state: ExplorerState) {
        state.fractal = FractalRegistry.byId(fractal)
        state.viewport = ComplexViewport(ComplexPoint(centerX, centerY), scale, rotation)
        state.parameters = FractalParameters(iterations, escapeRadius, power, ComplexPoint(juliaReal, juliaImag), morph)
        state.palette = PaletteState(Palette.valueOf(palette), ColoringMode.valueOf(coloring), palettePhase, paletteFrequency, Rgb.fromHex(insideColor))
        state.animationEnabled = animationEnabled
        state.animationMode = AnimationMode.valueOf(animationMode)
        state.animationAmount = animationAmount
    }
}

object PresetCodec {
    fun capture(name: String, state: ExplorerState, timeScale: Double): FractalPreset = FractalPreset(
        name, state.fractal.id, state.viewport.center.x, state.viewport.center.y, state.viewport.scale, state.viewport.rotation,
        state.parameters.iterations, state.parameters.escapeRadius, state.parameters.power, state.parameters.juliaC.x, state.parameters.juliaC.y,
        state.parameters.morph, state.palette.palette.name, state.palette.coloring.name, state.palette.phase, state.palette.frequency,
        rgbHex(state.palette.insideColor), state.animationEnabled, state.animationMode.name, state.animationAmount, timeScale,
    )

    fun encode(p: FractalPreset): String = """
        {
          "name": ${quote(p.name)},
          "fractal": ${quote(p.fractal)},
          "centerX": ${p.centerX},
          "centerY": ${p.centerY},
          "scale": ${p.scale},
          "rotation": ${p.rotation},
          "iterations": ${p.iterations},
          "escapeRadius": ${p.escapeRadius},
          "power": ${p.power},
          "juliaReal": ${p.juliaReal},
          "juliaImag": ${p.juliaImag},
          "morph": ${p.morph},
          "palette": ${quote(p.palette)},
          "coloring": ${quote(p.coloring)},
          "palettePhase": ${p.palettePhase},
          "paletteFrequency": ${p.paletteFrequency},
          "insideColor": ${quote(p.insideColor)},
          "animationEnabled": ${p.animationEnabled},
          "animationMode": ${quote(p.animationMode)},
          "animationAmount": ${p.animationAmount},
          "timeScale": ${p.timeScale}
        }
    """.trimIndent()

    fun decode(json: String): FractalPreset {
        val m = MiniJson(json).parseObject()
        fun s(k: String) = m[k] as? String ?: error("Preset field '$k' must be a string")
        fun d(k: String) = (m[k] as? Number)?.toDouble() ?: error("Preset field '$k' must be numeric")
        fun b(k: String) = m[k] as? Boolean ?: error("Preset field '$k' must be boolean")
        return FractalPreset(
            s("name"), s("fractal"), d("centerX"), d("centerY"), d("scale"), d("rotation"), d("iterations").toInt(),
            d("escapeRadius"), d("power"), d("juliaReal"), d("juliaImag"), d("morph"), s("palette"), s("coloring"),
            d("palettePhase"), d("paletteFrequency"), s("insideColor"), b("animationEnabled"), s("animationMode"),
            d("animationAmount"), d("timeScale")
        )
    }

    fun save(file: File, preset: FractalPreset) {
        file.parentFile?.mkdirs()
        file.writeText(encode(preset))
    }

    fun load(file: File): FractalPreset = decode(file.readText())

    private fun quote(s: String) = "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"") + "\""
    private fun rgbHex(rgb: Rgb): String = "#%02X%02X%02X".format(
        (rgb.r.coerceIn(0.0,1.0)*255.0).toInt(),
        (rgb.g.coerceIn(0.0,1.0)*255.0).toInt(),
        (rgb.b.coerceIn(0.0,1.0)*255.0).toInt(),
    )
}

object PresetLibrary {
    val builtIns = listOf(
        "classic-mandelbrot.json",
        "seahorse-valley.json",
        "julia-dream.json",
        "tricorn-ice.json",
        "burning-ship.json",
        "newton-roots.json",
    )

    fun loadBuiltIn(index: Int): FractalPreset {
        val name = builtIns[Math.floorMod(index, builtIns.size)]
        val text = PresetLibrary::class.java.getResource("/presets/$name")?.readText()
            ?: error("Missing preset resource $name")
        return PresetCodec.decode(text)
    }
}
