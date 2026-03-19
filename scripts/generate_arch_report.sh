#!/usr/bin/env bash
set -euo pipefail

mkdir -p architecture-report
python3 scripts/check_architecture.py   --config architecture-rules.json   --root .   --violations-out architecture-report/violations.json   --dependencies-out architecture-report/dependencies.json   --graph-out architecture-report/dependency-graph.mmd   --allow-violations

echo "architecture reports generated in architecture-report/"
