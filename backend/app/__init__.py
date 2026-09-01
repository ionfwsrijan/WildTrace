"""WildTrace backend package.

Ensures the project root (containing `ml/`) is on sys.path so sibling modules
like `ml.embedding.faiss_index` are importable no matter the working directory.
"""
import sys
from pathlib import Path

# backend/app/ -> backend -> project root
_ROOT = Path(__file__).resolve().parent.parent.parent
for _p in (_ROOT, _ROOT / "backend", Path(__file__).resolve().parent.parent):
    _sp = str(_p)
    if _sp not in sys.path:
        sys.path.insert(0, _sp)