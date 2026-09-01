"""Unit tests for the FAISS matcher and threshold logic."""
import numpy as np
import pytest

from app.core.matcher import Matcher, distance_to_similarity
from ml.embedding.faiss_index import FaissIndex


def test_threshold_relation_inverse_angle():
    # L2-normalized unit vectors: identical -> distance ~0 -> sim ~1
    assert distance_to_similarity(0.0) == pytest.approx(1.0)
    # Perpendicular -> distance sqrt(2) -> sim ~0
    assert distance_to_similarity(np.sqrt(2)) == pytest.approx(0.0, abs=1e-6)


def test_matcher_known_individual():
    idx = FaissIndex(dimension=4)
    idx.add(np.array([1.0, 0.0, 0.0, 0.0]), sighting_id=1, individual_id="WT-001")
    matcher = Matcher(faiss=idx, threshold=0.9)

    # Near-identical embedding -> matches WT-001
    result = matcher.match(np.array([0.999, 0.01, -0.01, 0.02]))
    assert result["matched"] is True
    assert result["nearest_individual_id"] == "WT-001"


def test_matcher_new_individual():
    idx = FaissIndex(dimension=4)
    idx.add(np.array([1.0, 0.0, 0.0, 0.0]), sighting_id=1, individual_id="WT-001")
    matcher = Matcher(faiss=idx, threshold=0.9)

    result = matcher.match(np.array([0.0, 1.0, 0.0, 0.0]))
    assert result["matched"] is False
    assert result["nearest_individual_id"] == "WT-001"  # still nearest, but below threshold


def test_matcher_empty_index():
    idx = FaissIndex(dimension=8)
    matcher = Matcher(faiss=idx, threshold=0.9)
    result = matcher.match(np.zeros(8, dtype=np.float32))
    assert result["matched"] is False
    assert result["nearest_individual_id"] is None