package fractal

import animation.AnimationMode
import animation.Modulator
import animation.Waveform
import camera.ComplexViewport
import color.PaletteState

class ExplorerState(definition: FractalDefinition = FractalRegistry.all.first()) {
    var fractal: FractalDefinition = definition
    var viewport: ComplexViewport = definition.defaultViewport()
    var parameters: FractalParameters = definition.defaultParameters()
    var palette: PaletteState = PaletteState()

    var animationEnabled: Boolean = true
    var animationMode: AnimationMode = AnimationMode.PALETTE
    var animationAmount: Double = 1.0

    val paletteAnimator = Modulator(Waveform.SAW, amplitude = 1.0, speed = 0.04)
    val juliaRealAnimator = Modulator(Waveform.SINE, amplitude = 0.28, speed = 0.07, phase = 0.0)
    val juliaImagAnimator = Modulator(Waveform.SINE, amplitude = 0.22, speed = 0.093, phase = 0.25)
    val powerAnimator = Modulator(Waveform.SINE, amplitude = 0.75, speed = 0.035)
    val zoomAnimator = Modulator(Waveform.SINE, amplitude = 0.32, speed = 0.025)

    fun selectFractal(next: FractalDefinition, keepView: Boolean = false) {
        fractal = next
        parameters = next.defaultParameters()
        if (!keepView) viewport = next.defaultViewport()
    }

    fun resetView() {
        viewport = fractal.defaultViewport()
    }
}
