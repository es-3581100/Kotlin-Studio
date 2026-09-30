package org.openrndr.draw
import org.openrndr.color.ColorRGBa
class ShadeStyle {
    var fragmentPreamble: String = ""
    var fragmentTransform: String = ""
    fun parameter(name: String, value: Any) { name.length; value.hashCode() }
}
fun shadeStyle(block: ShadeStyle.() -> Unit): ShadeStyle = ShadeStyle().apply(block)
class Drawer {
    var shadeStyle: ShadeStyle? = null
    var fill: ColorRGBa? = null
    var stroke: ColorRGBa? = null
    fun clear(color: ColorRGBa) { color.hashCode() }
    fun rectangle(x: Double, y: Double, w: Double, h: Double) { x+y+w+h }
}
