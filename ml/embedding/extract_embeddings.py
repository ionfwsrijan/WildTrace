"""Embedding extraction: turn an image (PIL/ndarray) into a feature vector.

This wraps the trained DenseNetEmbedding model plus the preprocessing steps
(resize / normalize) so the backend pipeline can call a single function.
"""
from typing import Union

import numpy as np
import torch
from PIL import Image

try:
    from ml.reid.model import DenseNetEmbedding
    _MODEL_AVAILABLE = True
except Exception:  # pragma: no cover - fallback for isolated imports
    _MODEL_AVAILABLE = False


# ImageNet normalization constants used to train DenseNet121
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]


def preprocess_image(image: "Image.Image", size: int = 224) -> torch.Tensor:
    """Resize, center-crop and normalize a PIL image into a model-ready tensor."""
    if image.mode != "RGB":
        image = image.convert("RGB")

    # Resize keeping aspect ratio then center-crop to square
    w, h = image.size
    crop = min(w, h)
    left = (w - crop) // 2
    top = (h - crop) // 2
    image = image.crop((left, top, left + crop, top + crop))
    image = image.resize((size, size), Image.BILINEAR)

    arr = np.asarray(image, dtype=np.float32) / 255.0
    mean = np.array(IMAGENET_MEAN, dtype=np.float32)
    std = np.array(IMAGENET_STD, dtype=np.float32)
    arr = (arr - mean) / std

    # CHW + batch dim
    arr = np.transpose(arr, (2, 0, 1))
    return torch.from_numpy(arr).unsqueeze(0)


class EmbeddingExtractor:
    """Lazy-loaded wrapper around the trained embedding model."""

    def __init__(self, checkpoint_path=None, embedding_dim: int = 512, device=None):
        self.checkpoint_path = checkpoint_path
        self.embedding_dim = embedding_dim
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self._model = None

    def _load(self):
        if self._model is not None:
            return
        if not _MODEL_AVAILABLE:
            raise RuntimeError("ml.reid.model not importable. Run from project root.")
        self._model = DenseNetEmbedding(embedding_dim=self.embedding_dim).to(self.device)
        self._model.eval()
        if self.checkpoint_path and __import__("os").path.exists(self.checkpoint_path):
            state = torch.load(self.checkpoint_path, map_location=self.device)
            if isinstance(state, dict) and "state_dict" in state:
                self._model.load_state_dict(state["state_dict"])
            else:
                self._model.load_state_dict(state)
        else:
            print("[embedding] No checkpoint found; using randomly-initialized (untrained) head.")

    @torch.no_grad()
    def embed(self, image: "Image.Image") -> np.ndarray:
        """Return an L2-normalized embedding vector of shape (embedding_dim,)."""
        self._load()
        tensor = preprocess_image(image).to(self.device)
        emb = self._model(tensor).cpu().numpy()[0]
        return emb.astype(np.float32)


def extract_embeddings(images, checkpoint_path=None, embedding_dim: int = 512):
    """Convenience: extract embeddings for an iterable of PIL images."""
    extractor = EmbeddingExtractor(checkpoint_path, embedding_dim)
    return [extractor.embed(im) for im in images]
