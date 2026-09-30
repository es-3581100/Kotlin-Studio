#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python -m unittest discover -s tests -v
node --check web/app.js
python scripts/build.py
PYTHONPATH=python python examples/pell_to_code.py >/dev/null
PYTHONPATH=python python examples/tribonacci_rauzy.py >/dev/null
PYTHONPATH=python python examples/pythagorean_identity.py >/dev/null
echo SACRED_COMPUTATIONS_CHECKS_PASS
