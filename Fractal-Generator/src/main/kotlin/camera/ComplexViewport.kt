package camera

import kotlin.math.max
import kotlin.math.min

data class ComplexPoint(val x: Double, val y: Double) {
    operator fun plus(other: ComplexPoint) = ComplexPoint(x + other.x, y + other.y)
    operator fun minus(other: ComplexPoint) = ComplexPoint(x - other.x, y - other.y)
    operator fun times(scale: Double) = ComplexPoint(x * scale, y * scale)
}

data class ComplexViewport(
    var center: ComplexPoint = ComplexPoint(-0.5, 0.0),
    /** Visible vertical span in complex-plane units. */
    var scale: Double = 3.0,
    var rotation: Double = 0.0,
) {
    fun screenToComplex(px: Double, py: Double, width: Int, height: Int): ComplexPoint {
        require(width > 0 && height > 0)
        val aspect = width.toDouble() / height.toDouble()
        val localX = (px / width.toDouble() - 0.5) * scale * aspect
        val localY = (0.5 - py / height.toDouble()) * scale
        if (rotation == 0.0) return ComplexPoint(center.x + localX, center.y + localY)
        val c = kotlin.math.cos(rotation)
        val s = kotlin.math.sin(rotation)
        return ComplexPoint(center.x + localX * c - localY * s, center.y + localX * s + localY * c)
    }

    fun panPixels(dx: Double, dy: Double, width: Int, height: Int) {
        val before = screenToComplex(width * 0.5, height * 0.5, width, height)
        val after = screenToComplex(width * 0.5 - dx, height * 0.5 - dy, width, height)
        center = center + (after - before)
    }

    fun zoomAt(px: Double, py: Double, width: Int, height: Int, zoomFactor: Double) {
        val anchor = screenToComplex(px, py, width, height)
        scale = (scale * zoomFactor).coerceIn(1.0e-15, 100.0)
        val moved = screenToComplex(px, py, width, height)
        center = center + (anchor - moved)
    }

    fun normalized(): ComplexViewport {
        scale = min(100.0, max(1.0e-15, scale))
        return this
    }
}
