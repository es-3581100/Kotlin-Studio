package animation

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class AnimatorTest {
    @Test fun deterministicFrameClock() {
        assertEquals(2.0, PlaybackClock.deterministicTime(120, 60.0))
    }
    @Test fun sineIsBounded() {
        val m = Modulator(Waveform.SINE, amplitude = 3.0, speed = 0.7, phase = 0.2)
        repeat(1000) { assertTrue(m.offset(it / 37.0) in -3.0000001..3.0000001) }
    }
}
