from sympy import symbols, simplify
m, n = symbols('m n', integer=True)
a, b, c = m*m-n*n, 2*m*n, m*m+n*n
print('identity residual:', simplify(a*a + b*b - c*c))
print('example m=2,n=1:', [x.subs({m:2,n:1}) for x in (a,b,c)])
