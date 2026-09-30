package color

import util.wrap

data class Rgb(val r: Double, val g: Double, val b: Double) {
    companion object {
        fun fromHex(value: String): Rgb {
            val s = value.removePrefix("#")
            require(s.length == 6) { "Expected #RRGGBB" }
            return Rgb(
                s.substring(0, 2).toInt(16) / 255.0,
                s.substring(2, 4).toInt(16) / 255.0,
                s.substring(4, 6).toInt(16) / 255.0,
            )
        }
    }
}

enum class Palette(val shaderId: Int) {
    AURORA(0), EMBER(1), ICE(2), NEON(3), MONO(4);

    fun next(step: Int = 1): Palette = entries[(ordinal + step).wrap(entries.size)]
}

enum class ColoringMode(val shaderId: Int) {
    SMOOTH_ESCAPE(0), ITERATION_BANDS(1), ORBIT_TRAP(2), ORBIT_ANGLE(3);

    fun next(step: Int = 1): ColoringMode = entries[(ordinal + step).wrap(entries.size)]
}

data class PaletteState(
    var palette: Palette = Palette.AURORA,
    var coloring: ColoringMode = ColoringMode.SMOOTH_ESCAPE,
    var phase: Double = 0.0,
    var frequency: Double = 1.0,
    var insideColor: Rgb = Rgb(0.015, 0.02, 0.04),
)
