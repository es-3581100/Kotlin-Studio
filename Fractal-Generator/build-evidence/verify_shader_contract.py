from pathlib import Path
import re
root = Path(__file__).resolve().parents[1]
renderer = (root/'src/main/kotlin/render/GpuFractalRenderer.kt').read_text()
preamble = (root/'src/main/resources/shaders/fractal-preamble.glsl').read_text()
transform = (root/'src/main/resources/shaders/fractal-transform.glsl').read_text()

def balanced(s):
    pairs={'{':'}','(':')','[':']'}
    inv={v:k for k,v in pairs.items()}
    st=[]
    for c in s:
        if c in pairs: st.append(c)
        elif c in inv:
            assert st and st[-1]==inv[c], f'unbalanced {c}'
            st.pop()
    assert not st, f'unclosed {st[-5:]}'

balanced(preamble)
balanced(transform)
assert 'vec2 cmul(' in preamble and 'vec2 cpowReal(' in preamble
assert 'vec2 cmul(' not in transform and 'vec2 cpowReal(' not in transform
assert 'x_fill' in transform

sent = set(re.findall(r'style\.parameter\("([A-Za-z0-9_]+)"', renderer))
used = set(re.findall(r'\bp_([A-Za-z0-9_]+)\b', preamble + '\n' + transform))
missing = sorted(used - sent)
assert not missing, f'shader parameters missing Kotlin uniforms: {missing}'
expected = {'resolution','center','scale','rotation','iterations','escapeRadius','power','juliaC','morph','time','mode','palette','colorMode','palettePhase','paletteFrequency','insideColor'}
assert expected <= sent, f'renderer expected uniforms missing: {sorted(expected-sent)}'
for mode in range(6):
    assert (f'p_mode == {mode}' in transform) or (mode == 2 and 'p_mode == 0 || p_mode == 2' in transform), f'mode {mode} not represented'
print('SHADER_STATIC_PASS')
print('uniforms_sent=' + ','.join(sorted(sent)))
print('uniforms_used=' + ','.join(sorted(used)))
print('preamble_braces=balanced')
print('transform_braces=balanced')
