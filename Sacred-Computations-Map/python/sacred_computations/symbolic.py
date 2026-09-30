from __future__ import annotations
import sympy as sp
x=sp.symbols('x')
POLYNOMIALS={
 'golden-ratio': x**2-x-1,
 'silver-ratio': x**2-2*x-1,
 'plastic-ratio': x**3-x-1,
 'tribonacci-ratio': x**3-x**2-x-1,
 'supergolden-ratio': x**3-x**2-1,
 'supersilver-ratio': x**3-2*x**2-1,
}
def largest_real_root(cid):
    p=POLYNOMIALS[cid]
    rr=[]
    for r in sp.solve(sp.Eq(p,0),x):
        z=complex(sp.N(r,30))
        if abs(z.imag)<1e-12: rr.append((z.real,r))
    return max(rr,key=lambda t:t[0])[1]
def emit(cid):
    r=largest_real_root(cid)
    return {'exact':sp.sstr(r),'decimal':str(sp.N(r,18)),'python':sp.pycode(r),'c':sp.ccode(r),'javascript':sp.jscode(r),'rust':sp.rust_code(r),'residual':sp.sstr(sp.simplify(POLYNOMIALS[cid].subs(x,r)))}
def pythagorean_identity():
    m,n=sp.symbols('m n')
    return sp.simplify((m**2-n**2)**2+(2*m*n)**2-(m**2+n**2)**2)
