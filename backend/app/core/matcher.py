"""FAISS matcher wrapper: query the index and apply match/new threshold logic.

The FAISS IndexFlatL2 returns Euclidean distances. For a normalized embedding
space, distance in [0, 2]; we convert to a 0..1 cosine similarity score via
sim = 1 - (d^2)/2, and treat sim >= threshold as a known-individual match.
"""
from typing import Optional, Tuple

import numpy as np

from ml.embedding.faiss_index import FaissIndex
from app.config import get_settings


def distance_to_similarity(distance: float) -> float:
    """Convert an L2 distance (on L2-normalized vectors) to cosine similarity."""
    # ||a - b||^2 = 2 - 2*cos(a,b)  =>  cos = 1 - d^2/2
    d2 = float(distance) ** 2
    return max(0.0, min(1.0, 1.0 - d2 / 2.0))


class Matcher:
    """High-level matcher that combines the FAISS index with identity metadata."""

    def __init__(self, faiss: FaissIndex, threshold: Optional[float] = None):
        self.faiss = faiss
        self.threshold = threshold if threshold is not None \
            else get_settings().SIMILARITY_THRESHOLD

    def match(self, embedding: np.ndarray):
        """Return a dict describing the match result.

        Returns:
            {
              "matched": bool,
              "similarity": float,
              "nearest_individual_id": str | None,
              "nearest_sighting_id": int | None,
              "distance": float,
            }
        """
        if self.faiss.is_empty:
            return {
                "matched": False,
                "similarity": 0.0,
                "nearest_individual_id": None,
                "nearest_sighting_id": None,
                "distance": None,
            }

        distances, indices = self.faiss.search(embedding, k=1)
        idx = int(indices[0])
        if idx < 0 or idx >= self.faiss.size:
            return {
                "matched": False,
                "similarity": 0.0,
                "nearest_individual_id": None,
                "nearest_sighting_id": None,
                "distance": None,
            }

        sim = distance_to_similarity(distances[0])
        nearest_sighting = self.faiss.sighting_ids[idx] if idx < len(self.faiss.sighting_ids) else None
        nearest_individual = self.faiss.individual_ids[idx] if idx < len(self.faiss.individual_ids) else None

        return {
            "matched": sim >= self.threshold,
            "similarity": round(float(sim), 4),
            "nearest_individual_id": nearest_individual,
            "nearest_sighting_id": nearest_sighting,
            "distance": round(float(distances[0]), 4),
        }
