package animation

import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.floor
import kotlin.math.sin

enum class Waveform {
    CONSTANT, SINE, TRIANGLE, SAW, PING_PONG;

    fun sample(cycles: Double): Double = when (this) {
        CONSTANT -> 0.0
        SINE -> sin(cycles * 2.0 * PI)
        SAW -> 2.0 * (cycles - floor(cycles + 0.5))
        TRIANGLE -> 2.0 * abs(2.0 * (cycles - floor(cycles + 0.5))) - 1.0
        PING_PONG -> 1.0 - 2.0 * abs((cycles - floor(cycles)) * 2.0 - 1.0)
    }
}

data class Modulator(
    val waveform: Waveform = Waveform.SINE,
    val amplitude: Double = 1.0,
    val speed: Double = 1.0,
    val phase: Double = 0.0,
) {
    fun offset(timeSeconds: Double): Double = amplitude * waveform.sample(timeSeconds * speed + phase)
    fun apply(base: Double, timeSeconds: Double): Double = base + offset(timeSeconds)
}

enum class AnimationMode { PALETTE, JULIA, POWER, ZOOM, ALL }

class PlaybackClock(
    var speed: Double = 1.0,
    var paused: Boolean = false,
    var position: Double = 0.0,
) {
    private var lastWallSeconds: Double? = null

    fun sample(wallSeconds: Double): Double {
        val previous = lastWallSeconds
        lastWallSeconds = wallSeconds
        if (previous != null && !paused) {
            val delta = (wallSeconds - previous).coerceIn(0.0, 0.25)
            position += delta * speed
        }
        return position
    }

    fun togglePaused() { paused = !paused }
    fun reset(value: Double = 0.0) { position = value; lastWallSeconds = null }

    companion object {
        fun deterministicTime(frame: Long, fps: Double, start: Double = 0.0): Double {
            require(frame >= 0)
            require(fps > 0.0)
            return start + frame.toDouble() / fps
        }
    }
}
