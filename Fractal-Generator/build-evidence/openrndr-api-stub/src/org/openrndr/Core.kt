package org.openrndr
import org.openrndr.draw.Drawer
import org.openrndr.math.Vector2
class Event<T> { fun listen(block: (T) -> Unit) { block.hashCode() } }
data class MouseEvent(val position: Vector2, val rotation: Vector2, val dragDisplacement: Vector2)
data class KeyEvent(val name: String)
class MouseEvents { val position=Vector2(0.0,0.0); val dragged=Event<MouseEvent>(); val scrolled=Event<MouseEvent>() }
class KeyEvents { val keyDown=Event<KeyEvent>() }
class Window { var title: String = "" }
open class Extension
open class Program {
    var width=1280; var height=800; var frameCount=0; var seconds=0.0
    val mouse=MouseEvents(); val keyboard=KeyEvents(); val window=Window(); val drawer=Drawer()
    fun <T: Extension> extend(extension: T): T = extension
    fun extend(block: Program.() -> Unit) { block.hashCode() }
}
class Configuration { var width=640; var height=480; var title=""; var resizable=false }
class ApplicationBuilder {
    fun configure(block: Configuration.() -> Unit) { Configuration().block() }
    fun program(block: Program.() -> Unit) { Program().block() }
}
fun application(block: ApplicationBuilder.() -> Unit) { ApplicationBuilder().block() }
