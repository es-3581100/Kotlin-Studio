// OPENRNDR ShadeStyle fragment preamble: helper functions and constants.
// Kotlin owns interaction/state; this shader owns per-pixel iteration and color mapping.

const int MAX_ITER = 2000;
const float PI = 3.14159265358979323846;

vec2 cmul(vec2 a, vec2 b) {
    return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

vec2 cdiv(vec2 a, vec2 b) {
    float d = dot(b,b);
    return vec2(a.x*b.x + a.y*b.y, a.y*b.x - a.x*b.y) / max(d, 1e-20);
}

vec2 cpowReal(vec2 z, float p) {
    float r = length(z);
    if (r < 1e-20) return vec2(0.0);
    float a = atan(z.y, z.x);
    float rp = pow(r, p);
    return rp * vec2(cos(a*p), sin(a*p));
}

vec3 paletteCos(float t, int paletteId) {
    vec3 a = vec3(0.5);
    vec3 b = vec3(0.5);
    vec3 c;
    vec3 d;
    if (paletteId == 0) { c=vec3(1.0,1.0,1.0); d=vec3(0.00,0.18,0.38); }
    else if (paletteId == 1) { c=vec3(1.0,0.72,0.42); d=vec3(0.00,0.08,0.20); }
    else if (paletteId == 2) { c=vec3(0.78,1.0,1.18); d=vec3(0.52,0.15,0.02); }
    else if (paletteId == 3) { c=vec3(1.0,1.0,1.0); d=vec3(0.00,0.33,0.67); }
    else { c=vec3(1.0); d=vec3(0.0); }
    vec3 col = a + b*cos(2.0*PI*(c*t+d));
    if (paletteId == 4) {
        float g = dot(col, vec3(0.299,0.587,0.114));
        col = vec3(g);
    }
    return clamp(col, 0.0, 1.0);
}

float colorCoordinate(float smoothIter, float trap, vec2 z, int colorMode) {
    if (colorMode == 1) return floor(smoothIter * 0.22) / 12.0;
    if (colorMode == 2) return -log(max(trap, 1e-7)) * 0.16;
    if (colorMode == 3) return atan(z.y, z.x)/(2.0*PI) + 0.5 + smoothIter*0.0125;
    return smoothIter * 0.025;
}
