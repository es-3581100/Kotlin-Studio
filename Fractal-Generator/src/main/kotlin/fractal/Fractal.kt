package fractal

import camera.ComplexPoint
import camera.ComplexViewport
import util.wrap

data class FractalParameters(
    var iterations: Int = 260,
    var escapeRadius: Double = 8.0,
    var power: Double = 2.0,
    var juliaC: ComplexPoint = ComplexPoint(-0.8, 0.156),
    var morph: Double = 0.0,
)

interface FractalDefinition {
    val id: String
    val displayName: String
    val shaderMode: Int
    fun defaultViewport(): ComplexViewport
    fun defaultParameters(): FractalParameters
}

data class BasicFractal(
    override val id: String,
    override val displayName: String,
    override val shaderMode: Int,
    private val viewport: ComplexViewport,
    private val parameters: FractalParameters,
) : FractalDefinition {
    override fun defaultViewport(): ComplexViewport = viewport.copy(center = viewport.center.copy())
    override fun defaultParameters(): FractalParameters = parameters.copy(juliaC = parameters.juliaC.copy())
}

object FractalRegistry {
    val all: List<FractalDefinition> = listOf(
        BasicFractal("mandelbrot", "Mandelbrot", 0, ComplexViewport(ComplexPoint(-0.5, 0.0), 3.0), FractalParameters()),
        BasicFractal("julia", "Julia", 1, ComplexViewport(ComplexPoint(0.0, 0.0), 3.0), FractalParameters(juliaC = ComplexPoint(-0.8, 0.156))),
        BasicFractal("multibrot", "Multibrot", 2, ComplexViewport(ComplexPoint(-0.35, 0.0), 3.2), FractalParameters(power = 3.0)),
        BasicFractal("tricorn", "Tricorn", 3, ComplexViewport(ComplexPoint(0.0, 0.0), 3.4), FractalParameters()),
        BasicFractal("burning-ship", "Burning Ship", 4, ComplexViewport(ComplexPoint(-0.45, -0.5), 3.0), FractalParameters()),
        BasicFractal("newton", "Newton z³−1", 5, ComplexViewport(ComplexPoint(0.0, 0.0), 4.0), FractalParameters(iterations = 90, escapeRadius = 16.0)),
    )

    fun byId(id: String): FractalDefinition = all.firstOrNull { it.id == id }
        ?: error("Unknown fractal '$id'")

    fun next(current: FractalDefinition, step: Int = 1): FractalDefinition {
        val i = all.indexOfFirst { it.id == current.id }.coerceAtLeast(0)
        return all[(i + step).wrap(all.size)]
    }
}
