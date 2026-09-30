from sympy import Matrix, N, symbols
from sacred_computations.symbolic import emit

A = Matrix([[2, 1], [1, 0]])
print('Pell state matrix:')
print(A)
print('characteristic polynomial:', A.charpoly().as_expr())
print('eigenvalues:', [N(v, 18) for v in A.eigenvals()])
print('\npositive algebraic root / code projections:')
for k, v in emit('silver-ratio').items():
    print(f'{k:10} {v}')
