package preset

import fractal.ExplorerState
import kotlin.test.Test
import kotlin.test.assertEquals

class PresetCodecTest {
    @Test fun roundTrip() {
        val p = PresetCodec.capture("test", ExplorerState(), 2.0)
        assertEquals(p, PresetCodec.decode(PresetCodec.encode(p)))
    }
}
