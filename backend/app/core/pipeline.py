"""End-to-end pipeline: detect -> embed -> match/register -> store -> anomaly.

This is the heart of WildTrace. A single `process_sighting` call drives the
full 9-stage workflow from the project spec and returns a structured result
that the API layer serializes to the frontend.
"""
from datetime import datetime
from pathlib import Path
from typing import Optional

from PIL import Image
from sqlalchemy.orm import Session

from app.config import get_settings
from app.core.anomaly import check_absence_anomalies, update_individual_interval
from app.core.id_generator import next_individual_id
from app.core.matcher import Matcher
from app.db.database import utcnow
from app.models.alert import Alert
from app.models.individual import Individual
from app.models.sighting import Sighting


class PipelineError(Exception):
    """Raised when a critical pipeline stage fails (e.g. no model weights)."""


class SightingPipeline:
    """Service locating the detector/extractor/index so they can be overridden
    in tests and swapped for demo mode."""

    def __init__(self, db: Session,
                 detector=None, extractor=None, matcher=None,
                 upload_dir: Optional[Path] = None):
        settings = get_settings()
        self.db = db
        self.settings = settings
        self.upload_dir = Path(upload_dir) if upload_dir else settings.UPLOAD_DIR
        self.upload_dir.mkdir(parents=True, exist_ok=True)

        if detector is None:
            try:
                from ml.detection.yolo_detector import YoloDetector
                detector = YoloDetector(model_path=settings.YOLO_MODEL_PATH)
            except Exception:
                detector = None
        if extractor is None:
            from ml.embedding.extract_embeddings import EmbeddingExtractor
            extractor = EmbeddingExtractor(checkpoint_path=str(settings.REID_MODEL_PATH),
                                           embedding_dim=settings.EMBEDDING_DIM)
        if matcher is None:
            from ml.embedding.faiss_index import FaissIndex
            from app.config import get_settings as _gs
            index_path = _gs().FAISS_INDEX_PATH
            index = FaissIndex.load(index_path) if index_path.exists() \
                else FaissIndex(dimension=_gs().EMBEDDING_DIM, index_path=index_path)
            matcher = Matcher(faiss=index)

        self.detector = detector
        self.extractor = extractor
        self.matcher = matcher

    # ---- stage 1-2: input + detection ----------------------------------
    def detect_crop(self, image: Image.Image):
        if self.detector is None:
            return image, {"fallback": True, "reason": "no_detector"}
        return self.detector.crop_tiger(image)

    # ---- stage 3-5: preprocess + embed ---------------------------------
    def embed(self, crop: Image.Image):
        return self.extractor.embed(crop)

    # ---- stage 6-7: similarity search + match/register -----------------
    def match(self, embedding):
        return self.matcher.match(embedding)

    # ---- main entry -----------------------------------------------------
    def process_sighting(self, image: Image.Image, filename: Optional[str] = None,
                         latitude: Optional[float] = None,
                         longitude: Optional[float] = None,
                         zone_name: Optional[str] = None,
                         captured_at: Optional[datetime] = None):
        """Run the full pipeline and persist the resulting sighting record."""
        taken_at = captured_at or utcnow()

        # 2) Detection & crop
        crop, det_meta = self.detect_crop(image)
        if crop is None:
            raise PipelineError(det_meta.get("reason", "no_animal_detected"))
        crop = crop.convert("RGB")

        # Save the crop as the image record (identity-focused for the MVP)
        fname = filename or f"sighting_{taken_at:%Y%m%d_%H%M%S%f}.jpg"
        store_name = f"{taken_at:%Y%m%d_%H%M%S%f}_{fname}"
        crop_path = self.upload_dir / store_name
        crop.save(crop_path, "JPEG", quality=90)

        # 3-5) Embedding
        embedding = self.embed(crop)

        # 6-7) Match / register
        result = self.match(embedding)
        is_new = not result["matched"]

        if is_new:
            individual_id = next_individual_id(self.db)
            match_status = "new_individual"
        else:
            individual_id = result["nearest_individual_id"]
            match_status = "matched"
            # record may have detached assets if leaving the request scope
            existing = self.db.get(Individual, individual_id)
            if existing is None:
                # metadata points to an individual not in DB (e.g. empty index);
                # treat as new rather than crash
                individual_id = next_individual_id(self.db)
                match_status = "new_individual"

        # 8) Store sighting
        sighting = Sighting(
            individual_id=individual_id,
            image_url=str(crop_path.resolve()),
            embedding_id=self.matcher.faiss.size,
            latitude=latitude,
            longitude=longitude,
            zone_name=zone_name,
            captured_at=taken_at,
            confidence_score=result["similarity"] if not is_new else None,
            match_status=match_status,
            verified_by_human=False,
        )
        self.db.add(sighting)
        self.db.flush()  # materialize sighting.id

        # upsert individual
        individual = self.db.get(Individual, individual_id)
        if individual is None:
            individual = Individual(
                id=individual_id,
                species="Amur Tiger",
                first_seen_at=taken_at,
                last_seen_at=taken_at,
                total_sightings=1,
                representative_image_url=str(crop_path.resolve()),
                avg_sighting_interval_days=0.0,
            )
            self.db.add(individual)
            new_alert = None
        else:
            individual.last_seen_at = taken_at
            individual.total_sightings += 1
            individual.representative_image_url = individual.representative_image_url \
                or str(crop_path.resolve())
            self.db.add(individual)
            # An extra alert for genuinely new individuals
            new_alert = None

        # Update interval stats
        update_individual_interval(self.db, individual)

        # 9) Alert for new individuals
        alert = None
        if is_new:
            alert = Alert(
                individual_id=individual_id,
                alert_type="new_individual",
                description=f"New individual {individual_id} registered (no existing "
                            f"match above threshold {self.matcher.threshold:.2f}).",
                status="open",
            )
            self.db.add(alert)

        # Register embedding in the FAISS index & persist
        faiss_id = self.matcher.faiss.add(embedding, sighting.id, individual_id)
        sighting.embedding_id = faiss_id
        self.matcher.faiss.save(self.matcher.faiss.index_path or self.settings.FAISS_INDEX_PATH)

        self.db.commit()

        # Anomaly sweep after commit so reads see fresh intervals
        anomalies = check_absence_anomalies(self.db)

        return {
            "sighting_id": sighting.id,
            "individual_id": individual_id,
            "match_status": match_status,
            "confidence_score": result["similarity"] if not is_new else None,
            "similarity": result["similarity"],
            "matched_individual": result["nearest_individual_id"],
            "is_new_individual": is_new,
            "image_url": str(crop_path.resolve()),
            "detection_meta": det_meta,
            "created_alert": alert.id if alert else None,
        }


def run_pipeline_sync(image_path: str, **kwargs):
    """CLI/script friendly entry: process an image file and return JSON-able dict."""
    from app.db.database import SessionLocal, init_db
    init_db()
    db = SessionLocal()
    try:
        pipe = SightingPipeline(db)
        img = Image.open(image_path)
        return pipe.process_sighting(img, **kwargs)
    finally:
        db.close()