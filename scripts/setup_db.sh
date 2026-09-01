#!/usr/bin/env bash
# Initialise the WildTrace environment:
#   - create a virtualenv (optional)
#   - install Python dependencies
#   - create data directories + database
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [ "${1:-}" = "--venv" ]; then
  echo "[setup] creating virtualenv at $ROOT/.venv"
  python -m venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate
fi

echo "[setup] installing requirements"
pip install -r requirements.txt

echo "[setup] creating directories"
mkdir -p data/uploads data/faiss_index ml/datasets/atrw ml/datasets/processed

echo "[setup] initialising database"
PYTHONPATH="$ROOT:$ROOT/backend" python -m scripts.setup_db

echo "[setup] seeding demo data"
PYTHONPATH="$ROOT:$ROOT/backend" python -m scripts.seed_demo_data

echo "[setup] done. Start the API with:"
echo "  cd backend && uvicorn app.main:app --reload"