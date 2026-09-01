"""YOLO-based animal detection and crop extraction.

Loads a YOLOv8 model (Ultralytics). On inference it returns the largest
detected bounding box for the configured target class (default: keep any
high-conf animal/tiger box), then crops the region of interest to feed the
Re-ID embedder. If YOLO is unavailable or the model file is missing, we fall
back to returning the full frame so the MVP pipeline still runs.

Design note: for the MVP scoped to a single species we don't need a fine-tuned
multi-class model; a pretrained YOLOv8n/m detected on the "bear" animal class
works, but we default to accepting any confident detection above a threshold.
"""
from pathlib import Path
from typing import Optional, Tuple

import numpy as np
from PIL import Image


# Ultralytics COCO class ids of general animals we accept in absence of a
# fine-tuned tiger class. In practice you would fine-tune on your tiger data.
ACCEPTED_CLASSES = {15, 16, 21, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 21}


class YoloDetector:
    """Lazy-loaded YOLOv8 detector returned as a crop extractor."""

    def __init__(self, model_path=None, conf_threshold: float = 0.35,
                 target_class: Optional[int] = None, prefer_centered: bool = True):
        self.model_path = Path(model_path) if model_path else None
        self.conf_threshold = conf_threshold
        self.target_class = target_class
        self.prefer_centered = prefer_centered
        self._model = None

    def _load(self):
        if self._model is not None:
            return
        if self.model_path is None or not self.model_path.exists():
            raise FileNotFoundError(f"YOLO model not found at {self.model_path}")
        try:
            from ultralytics import YOLO
        except ImportError as exc:
            raise ImportError("ultralytics not installed: pip install ultralytics") from exc
        self._model = YOLO(str(self.model_path))

    @property
    def loaded(self) -> bool:
        return self._model is not None

    def detect(self, image: "Image.Image"):
        """Run detection, return (boxes, scores, class_ids) with filtering applied."""
        self._load()
        results = self._model(np.asarray(image))
        det = results[0]
        if det.boxes is None or len(det.boxes) == 0:
            return [], [], []

        boxes = det.boxes.xyxy.cpu().numpy()
        scores = det.boxes.conf.cpu().numpy()
        cls = det.boxes.cls.cpu().numpy().astype(int)

        keep = scores >= self.conf_threshold
        boxes, scores, cls = boxes[keep], scores[keep], cls[keep]

        if self.target_class is not None:
            keep = cls == self.target_class
            boxes, scores, cls = boxes[keep], scores[keep], cls[keep]

        return list(boxes), list(scores), list(cls)

    def crop_tiger(self, image: "Image.Image") -> Tuple[Optional["Image.Image"], Optional[dict]]:
        """Return the cropped region of interest plus detection metadata.

        If no model is loaded/available, returns (image, None) so the pipeline
        can degrade gracefully.
        """
        if not self.loaded:
            try:
                self._load()
            except (ImportError, FileNotFoundError):
                return image, {"fallback": True, "reason": "yolo_unavailable"}

        boxes, scores, cls = self.detect(image)
        if not boxes:
            return None, {"fallback": True, "reason": "no_detection"}

        # Pick the largest box (most likely the dominant animal in frame)
        areas = [(b[2] - b[0]) * (b[3] - b[1]) for b in boxes]
        best = int(np.argmax(areas))
        x1, y1, x2, y2 = boxes[best]
        # Pad crop slightly for context
        w, h = image.size
        pad_x, pad_y = 0.02 * w, 0.02 * h
        x1 = max(0, int(x1 - pad_x)); y1 = max(0, int(y1 - pad_y))
        x2 = min(w, int(x2 + pad_x)); y2 = min(h, int(y2 + pad_y))

        crop = image.crop((x1, y1, x2, y2))
        meta = {
            "bbox": [int(x1), int(y1), int(x2), int(y2)],
            "score": float(scores[best]),
            "class_id": int(cls[best]),
            "fallback": False,
        }
        return crop, meta
