"""Pipeline orchestration tests with a stub detector/extractor/index.

Verifies the full detect→embed→match→register→store loop end-to-end using
in-memory substitution rather than requiring a GPU or trained weights.
"""
from datetime import datetime, timedelta

import numpy as np
from PIL import Image

from app.core.pipeline import SightingPipeline
from app.core.matcher import Matcher
from app.db.database import Base, SessionLocal, engine
from ml.embedding.faiss_index import FaissIndex


def _clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


class FakeDetector:
    def crop_tiger(self, image):
        return image, {"bbox": [0, 0, 64, 64], "score": 0.9,
                       "class_id": 21, "fallback": False}


class FakeExtractor:
    def __init__(self):
        self.calls = 0

    def embed(self, crop):
        self.calls += 1
        # Deterministic embedding: first call forms cluster A, later calls B
        if self.calls == 1:
            return np.array([1.0, 0.0, 0.0, 0.0], dtype=np.float32)
        return np.array([1.0, 0.001, 0.0, 0.0], dtype=np.float32)


def _pipe(db, threshold=0.9):
    idx = FaissIndex(dimension=4)
    matcher = Matcher(faiss=idx, threshold=threshold)
    return SightingPipeline(db, detector=FakeDetector(),
                            extractor=FakeExtractor(), matcher=matcher)


def test_first_sighting_registers_new_individual():
    _clean_db()
    db = SessionLocal()
    pipe = _pipe(db)
    img = Image.new("RGB", (64, 64), (200, 60, 40))
    result = pipe.process_sighting(img)
    assert result["is_new_individual"] is True
    assert result["individual_id"] == "WT-001"
    assert result["match_status"] == "new_individual"
    assert pipe.matcher.faiss.size == 1

    from app.models.individual import Individual
    ind = db.get(Individual, "WT-001")
    assert ind is not None and ind.total_sightings == 1
    db.close()


def test_second_call_matches_existing():
    _clean_db()
    db = SessionLocal()
    pipe = _pipe(db)
    img = Image.new("RGB", (64, 64), (200, 60, 40))
    pipe.process_sighting(img)
    result2 = pipe.process_sighting(img)
    assert result2["is_new_individual"] is False
    assert result2["individual_id"] == "WT-001"
    assert pipe.matcher.faiss.size == 2
    db.close()