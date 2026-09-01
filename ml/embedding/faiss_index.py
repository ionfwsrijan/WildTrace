"""FAISS vector index for individual re-ID similarity search.

Builds and persists an IndexFlatL2 (exact L2 for MVP-scale data; upgrade to
IVF/HNSW later). The index maps each embedding vector to a database sighting,
and stores each vector's "individual label" as FAISS metadata via our own
parallel label array so the backend can resolve matches to individuals.
"""
import os
import pickle
from pathlib import Path
from typing import List, Optional

import faiss
import numpy as np


class FaissIndex:
    """Thin wrapper over a FAISS index with persistent metadata.

    Attack of the label file: FAISS itself doesn't store per-vector metadata,
    so we keep a sidecar pickle of sighting ids / individual labels aligned by
    index position. The index and sidecar are written together to disk.

    Args:
        dimension: Embedding dimensionality (e.g. 512).
        index_path: Where to persist the .index + .meta files.
    """

    def __init__(self, dimension: int = 512, index_path=None):
        self.dimension = dimension
        self.index_path = Path(index_path) if index_path else None
        self.index = faiss.IndexFlatL2(dimension)
        self.sighting_ids: List[Optional[int]] = []
        self.individual_ids: List[Optional[str]] = []

    # ---- persistence ---------------------------------------------------
    def save(self, path=None):
        if path:
            self.index_path = Path(path)
        if self.index_path is None:
            raise ValueError("No path to save FAISS index to.")
        self.index_path.parent.mkdir(parents=True, exist_ok=True)
        faiss.write_index(self.index, str(self.index_path))
        meta_path = self.index_path.with_suffix(".meta")
        with open(meta_path, "wb") as f:
            pickle.dump({"sighting_ids": self.sighting_ids,
                         "individual_ids": self.individual_ids,
                         "dimension": self.dimension}, f)

    @classmethod
    def load(cls, path):
        path = Path(path)
        idx = cls(dimension=0, index_path=path)
        idx.index = faiss.read_index(str(path))
        idx.dimension = idx.index.d
        meta_path = path.with_suffix(".meta")
        if meta_path.exists():
            with open(meta_path, "rb") as f:
                meta = pickle.load(f)
            idx.sighting_ids = meta["sighting_ids"]
            idx.individual_ids = meta["individual_ids"]
        return idx

    # ---- add / query ---------------------------------------------------
    def add(self, embedding: np.ndarray, sighting_id: int = None,
            individual_id: str = None) -> int:
        vec = np.asarray(embedding, dtype=np.float32).reshape(1, -1)
        if vec.shape[1] != self.dimension:
            raise ValueError(f"Embedding dim {vec.shape[1]} != index dim {self.dimension}")
        faiss_id = self.index.ntotal
        self.index.add(vec)
        self.sighting_ids.append(sighting_id)
        self.individual_ids.append(individual_id)
        return faiss_id

    def add_batch(self, embeddings: List[np.ndarray], sighting_ids=None,
                  individual_ids=None):
        vecs = np.vstack([np.asarray(e, dtype=np.float32).reshape(1, -1) for e in embeddings])
        start = self.index.ntotal
        self.index.add(vecs)
        for i in range(len(embeddings)):
            self.sighting_ids.append(sighting_ids[i] if sighting_ids else None)
            self.individual_ids.append(individual_ids[i] if individual_ids else None)
        return start

    def search(self, embedding: np.ndarray, k: int = 1):
        vec = np.asarray(embedding, dtype=np.float32).reshape(1, -1)
        distances, indices = self.index.search(vec, k)
        return distances[0], indices[0]

    @property
    def size(self) -> int:
        return self.index.ntotal

    @property
    def is_empty(self) -> bool:
        return self.index.ntotal == 0
