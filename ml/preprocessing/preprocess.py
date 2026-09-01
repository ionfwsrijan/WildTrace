"""Preprocessing helpers used across the ML pipeline.

- align: basic geometric normalization (flip correction / rotation hints)
- augment: light transforms for training (random flip, rotate, brightness)
- normalize: tensor-level normalization (see extract_embeddings for the
  standard ImageNet normalization used at inference)
"""
from typing import List

import numpy as np
from PIL import Image, ImageEnhance, ImageOps


# ---- normalize ----------------------------------------------------------
IMAGENET_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGENET_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


def to_tensor(image: Image.Image, size: int = 224, normalize: bool = True) -> np.ndarray:
    """Convert a PIL image to a CHW float32 array, optionally normalized."""
    image = image.resize((size, size), Image.BILINEAR)
    arr = np.asarray(image, dtype=np.float32) / 255.0
    if normalize:
        arr = (arr - IMAGENET_MEAN) / IMAGENET_STD
    return np.transpose(arr, (2, 0, 1))


# ---- align --------------------------------------------------------------
def align(image: Image.Image) -> Image.Image:
    """Light geometric alignment: auto-orient (EXIF) and normalize orientation."""
    image = ImageOps.exif_transpose(image)
    # If image is portrait-but-wide or overly skewed, simple center-crop
    # already handled upstream. This is a placeholder for heavier alignment
    # (e.g. eye-alignment) in a future enhancement.
    return image


# ---- augment ------------------------------------------------------------
def augment(image: Image.Image) -> List[Image.Image]:
    """Return a small set of augmented views for training-time robustness."""
    views = [image]
    views.append(ImageOps.mirror(image))  # horizontal flip
    enhancer = ImageEnhance.Brightness(image)
    views.append(enhancer.enhance(0.9))
    views.append(enhancer.enhance(1.1))
    for _ in range(2):
        views.append(image.rotate(10 + np.random.rand() * 6, expand=False))
    return views
