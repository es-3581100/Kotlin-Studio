from sympy import Matrix, N

A = Matrix([[1, 1, 1], [1, 0, 0], [0, 1, 0]])
print('Tribonacci / Rauzy recurrence matrix:')
print(A)
print('characteristic polynomial:', A.charpoly().as_expr())
print('eigenvalues:')
for value, multiplicity in A.eigenvals().items():
    print(' ', N(value, 18), 'multiplicity=', multiplicity)
