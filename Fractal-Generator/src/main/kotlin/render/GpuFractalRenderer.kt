package render

import color.PaletteState
import fractal.FractalDefinition
import org.openrndr.color.ColorRGBa
import org.openrndr.draw.Drawer
import org.openrndr.draw.ShadeStyle
import org.openrndr.draw.shadeStyle
import org.openrndr.math.Vector2

class GpuFractalRenderer(
    fragmentPreambleText: String = loadResource("/shaders/fractal-preamble.glsl"),
    fragmentTransformText: String = loadResource("/shaders/fractal-transform.glsl"),
) {
    private val style: ShadeStyle = shadeStyle {
        fragmentPreamble = fragmentPreambleText
        fragmentTransform = fragmentTransformText
    }

    fun render(
        drawer: Drawer,
        width: Int,
        height: Int,
        fractal: FractalDefinition,
        snapshot: RenderSnapshot,
        palette: PaletteState,
        time: Double,
    ) {
        style.parameter("resolution", Vector2(width.toDouble(), height.toDouble()))
        style.parameter("center", Vector2(snapshot.centerX, snapshot.centerY))
        style.parameter("scale", snapshot.scale)
        style.parameter("rotation", snapshot.rotation)
        style.parameter("iterations", snapshot.iterations)
        style.parameter("escapeRadius", snapshot.escapeRadius)
        style.parameter("power", snapshot.power)
        style.parameter("juliaC", Vector2(snapshot.juliaReal, snapshot.juliaImag))
        style.parameter("morph", snapshot.morph)
        style.parameter("time", time)
        style.parameter("mode", fractal.shaderMode)
        style.parameter("palette", palette.palette.shaderId)
        style.parameter("colorMode", palette.coloring.shaderId)
        style.parameter("palettePhase", snapshot.palettePhase)
        style.parameter("paletteFrequency", palette.frequency)
        style.parameter("insideColor", ColorRGBa(palette.insideColor.r, palette.insideColor.g, palette.insideColor.b, 1.0))

        drawer.shadeStyle = style
        drawer.fill = ColorRGBa.WHITE
        drawer.stroke = null
        drawer.rectangle(0.0, 0.0, width.toDouble(), height.toDouble())
        drawer.shadeStyle = null
    }

    companion object {
        private fun loadResource(path: String): String = GpuFractalRenderer::class.java
            .getResource(path)
            ?.readText()
            ?: error("Missing $path")
    }
}
