"""Image helpers for the backend."""
import hashlib
from io import BytesIO

from PIL import Image


def image_from_bytes(data: bytes) -> Image.Image:
    img = Image.open(BytesIO(data))
    img.load()
    return img


def content_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()[:16]