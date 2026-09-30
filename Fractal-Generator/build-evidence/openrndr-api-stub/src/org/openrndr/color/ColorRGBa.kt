package org.openrndr.color
data class ColorRGBa(val r: Double, val g: Double, val b: Double, val alpha: Double = 1.0) {
    companion object { val BLACK = ColorRGBa(0.0,0.0,0.0,1.0); val WHITE = ColorRGBa(1.0,1.0,1.0,1.0) }
}
