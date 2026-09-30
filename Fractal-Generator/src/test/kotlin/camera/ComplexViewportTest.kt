package camera

import kotlin.math.abs
import kotlin.test.Test
import kotlin.test.assertTrue

class ComplexViewportTest {
    @Test fun zoomKeepsCursorAnchor() {
        val v = ComplexViewport(ComplexPoint(-0.5, 0.0), 3.0)
        val before = v.screenToComplex(713.0, 244.0, 1280, 800)
        v.zoomAt(713.0, 244.0, 1280, 800, 0.4)
        val after = v.screenToComplex(713.0, 244.0, 1280, 800)
        assertTrue(abs(before.x-after.x) < 1e-12)
        assertTrue(abs(before.y-after.y) < 1e-12)
    }
}
