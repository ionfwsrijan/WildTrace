"""Initialize the database and create empty embeddings index.

Usage:
    python -m scripts.setup_db
"""
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))

from app.config import get_settings
from app.db.database import init_db


def main():
    init_db()
    settings = get_settings()
    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    settings.FAISS_INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    print("[setup] database ready at", settings.DATABASE_URL)
    print("[setup] upload dir  :", settings.UPLOAD_DIR)
    print("[setup] faiss path  :", settings.FAISS_INDEX_PATH)
    if not settings.FAISS_INDEX_PATH.exists():
        print("[setup] hint        : create the index with scripts/build_faiss_index.py")


if __name__ == "__main__":
    main()