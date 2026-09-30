# Symbolic bridge model

Sacred-Computations uses a repeated path:

`source relation → exact equation/recurrence → SymPy object → matrix/algebraic verification → numerical callable → emitted code`

Examples:

- Pell numbers → `x²−2x−1` → `1+sqrt(2)` → `[[2,1],[1,0]]` → eigenvalue check → C/JS/Rust expression.
- Tribonacci → `x³−x²−x−1` → dominant root → 3×3 recurrence matrix → Rauzy eigenstructure → NumPy-ready matrix.
- Pythagorean triples → polynomial parametrization → symbolic identity simplifies to zero → integer kernels.

The code-emission layer is downstream of the mathematics. Generated code is not evidence for a mathematical claim; it is an execution projection of an already-defined symbolic object.
