"""Pytest fixtures: isolate tests against a throwaway SQLite database.

Important: DATABASE_URL is set via env BEFORE any app module is imported so the
engine in app.db.database is created against the isolated DB, not the dev one.
"""
import os
import tempfile
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parent
ROOT = BACKEND.parent

for p in (ROOT, BACKEND):
    if str(p) not in sys.path:
        sys.path.insert(0, str(p))

# -- isolated in-memory DB (StaticPool keeps one shared connection) ----------
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["FAISS_INDEX_PATH"] = os.path.join(tempfile.gettempdir(), "wildtrace_test.index")

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402


@pytest.fixture(scope="session")
def client():
    from app.main import app
    with TestClient(app) as c:
        yield c