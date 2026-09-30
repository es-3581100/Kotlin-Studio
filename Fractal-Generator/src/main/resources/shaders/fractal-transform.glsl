vec2 uv = c_boundsPosition.xy;
float aspect = p_resolution.x / max(p_resolution.y, 1.0);
vec2 q = vec2((uv.x - 0.5) * p_scale * aspect, (0.5 - uv.y) * p_scale);
float cr = cos(p_rotation);
float sr = sin(p_rotation);
q = vec2(q.x*cr - q.y*sr, q.x*sr + q.y*cr);
vec2 pixel = p_center + q;

// Newton is a root-attractor kernel rather than an escape-time kernel.
if (p_mode == 5) {
    vec2 z = pixel;
    int i = 0;
    int rootId = 0;
    float dist = 1e20;
    vec2 roots[3];
    roots[0] = vec2(1.0, 0.0);
    roots[1] = vec2(-0.5, 0.8660254037844386);
    roots[2] = vec2(-0.5,-0.8660254037844386);
    for (i=0; i<MAX_ITER; ++i) {
        if (i >= p_iterations) break;
        vec2 z2 = cmul(z,z);
        vec2 z3 = cmul(z2,z);
        vec2 f = z3 - vec2(1.0,0.0);
        vec2 fp = 3.0*z2;
        z = z - cdiv(f, fp);
        float d0 = length(z-roots[0]);
        float d1 = length(z-roots[1]);
        float d2 = length(z-roots[2]);
        dist = min(d0, min(d1,d2));
        rootId = d0 < d1 ? (d0 < d2 ? 0 : 2) : (d1 < d2 ? 1 : 2);
        if (dist < 1e-7) break;
    }
    float convergence = 1.0 - float(i)/max(float(p_iterations),1.0);
    float rootPhase = float(rootId)/3.0;
    vec3 col = paletteCos(rootPhase + convergence*0.18 + p_palettePhase, p_palette);
    x_fill = vec4(col * (0.35 + 0.9*convergence), 1.0);
} else {
    vec2 c = pixel;
    vec2 z = vec2(0.0);
    if (p_mode == 1) { z = pixel; c = p_juliaC; }
    // morph=0 => Mandelbrot-like seed z=0,c=pixel. morph=1 => Julia-like z=pixel,c=juliaC.
    // This is exposed only for compatible z^p+c families.
    if (p_mode == 0 || p_mode == 2) {
        z = mix(vec2(0.0), pixel, p_morph);
        c = mix(pixel, p_juliaC, p_morph);
    }

    float escape2 = p_escapeRadius*p_escapeRadius;
    float trap = 1e20;
    int i = 0;
    bool escaped = false;
    for (i=0; i<MAX_ITER; ++i) {
        if (i >= p_iterations) break;
        vec2 work = z;
        if (p_mode == 3) work.y = -work.y;          // Tricorn: conjugate before power.
        if (p_mode == 4) work = abs(work);          // Burning Ship folding.
        float powValue = (p_mode == 0 || p_mode == 1 || p_mode == 3 || p_mode == 4) ? 2.0 : p_power;
        z = cpowReal(work, powValue) + c;
        trap = min(trap, min(abs(z.x), abs(z.y)));
        if (dot(z,z) > escape2) { escaped = true; break; }
    }

    if (!escaped) {
        x_fill = vec4(p_insideColor.rgb, 1.0);
    } else {
        float powValue = (p_mode == 2) ? max(p_power, 1.01) : 2.0;
        float radius = max(length(z), 1.000001);
        float smoothIter = float(i) + 1.0 - log(max(log(radius),1e-7))/log(powValue);
        float t = colorCoordinate(smoothIter, trap, z, p_colorMode);
        t = t * p_paletteFrequency + p_palettePhase;
        x_fill = vec4(paletteCos(t, p_palette), 1.0);
    }
}
