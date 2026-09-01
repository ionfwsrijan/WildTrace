"""Seed demo data to make the dashboard/map/timeline look realistic.

Loads the (optional) ATRW-derived per-individual images from ml/datasets/processed.
If no images exist we generate procedural tiger-stripe placeholder images so the
project is fully runnable without the dataset download.

Usage:
    python -m scripts.seed_demo_data --individuals 12 --sightings-per-ind 6
"""
import argparse
import random
from datetime import datetime, timedelta
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

from app.core.id_generator import next_individual_id
from app.db.database import init_db, SessionLocal, utcnow
from app.models.individual import Individual
from app.models.sighting import Sighting

ROOT = Path(__file__).resolve().parent.parent
DATA_ROOT = ROOT / "ml" / "datasets" / "processed"
UPLOAD_DIR = ROOT / "data" / "uploads"

# Bounding box for demo GPS around Sikhote-Alin, Russia
LAT_MIN, LAT_MAX = 44.5, 46.5
LON_MIN, LON_MAX = 135.0, 137.5
ZONES = ["Sikhote-Alin North", "Sikhote-Alin Central", "Sikhote-Alin South",
         "Bikin Valley", "Olga Reserve"]


def _make_stripe_placeholder(seed: int, size=224) -> Image.Image:
    """Procedurally generate a tiger-stripe-like placeholder image."""
    rng = np.random.RandomState(seed)
    base = (rng.randint(180, 230), rng.randint(110, 160), rng.randint(40, 80))
    img = Image.new("RGB", (size, size), base)
    draw = ImageDraw.Draw(img)
    cx, cy = size // 2, size // 2
    draw.ellipse([cx - size // 3, cy - size // 3, cx + size // 3, cy + size // 3],
                 fill=(base[0] - 30, base[1] - 20, base[2] - 10))
    for _ in range(40):
        sx = rng.randint(0, size)
        w = rng.randint(2, 6)
        for y in range(size):
            if rng.rand() < 0.6:
                draw.line([(sx + rng.randint(-w, w), y), (sx + rng.randint(-w, w), y + 3)],
                          fill=(20, 15, 12), width=2)
    return img


def _available_images() -> list:
    """Return real per-individual image paths if present, else empty list."""
    if not DATA_ROOT.exists():
        return []
    return sorted(str(p) for p in DATA_ROOT.rglob("*")
                  if p.suffix.lower() in {".jpg", ".jpeg", ".png"})


def seed(args):
    init_db()
    db = SessionLocal()
    rng = random.Random(args.seed)
    real_images = _available_images()

    individuals = []
    for i in range(args.individuals):
        iid = next_individual_id(db)
        first = utcnow() - timedelta(days=rng.randint(20, 90))
        ind = Individual(
            id=iid,
            species="Amur Tiger",
            first_seen_at=first,
            last_seen_at=first,
            total_sightings=0,
            avg_sighting_interval_days=0.0,
        )
        db.add(ind)
        db.flush()  # materialise id so next_individual_id sees it
        individuals.append(ind)
    db.commit()

    total = 0
    for ind in individuals:
        n = args.sightings_per_ind
        # realistic irregular gaps: base 2-5 days + jitter
        base_gap = rng.uniform(2.0, 5.0)
        t = ind.first_seen_at
        for k in range(n):
            t = t + timedelta(days=max(0.3, base_gap + rng.gauss(0, 0.8)))
            # occasionally cross over "now" for freshness
            captures = t
            lat = rng.uniform(LAT_MIN, LAT_MAX)
            lon = rng.uniform(LON_MIN, LON_MAX)
            zone = rng.choice(ZONES)

            if real_images and args.use_real_images:
                path = rng.choice(real_images)
                img = Image.open(path).convert("RGB")
            else:
                img = _make_stripe_placeholder(seed=hash((ind.id, k)) % 2**31,
                                               size=args.image_size)

            fname = f"{iid}_{k+1:02d}_{captures:%Y%m%d%H%M%S}.jpg"
            save_path = UPLOAD_DIR / fname
            UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
            img.save(save_path, "JPEG", quality=85)

            db.add(Sighting(
                individual_id=ind.id,
                image_url=str(save_path.resolve()),
                latitude=lat,
                longitude=lon,
                zone_name=zone,
                captured_at=captures,
                confidence_score=rng.uniform(0.82, 0.99),
                match_status="matched",
            ))
            total += 1
            ind.last_seen_at = captures
        ind.total_sightings = n
        db.add(ind)

    db.commit()

    # Recompute intervals the same way the pipeline does, then run anomaly sweep
    from app.core.anomaly import check_absence_anomalies
    from app.core.anomaly import update_individual_interval
    for ind in individuals:
        update_individual_interval(db, ind)
    db.commit()
    alerts = check_absence_anomalies(db)
    print(f"[seed] created {args.individuals} individuals, {total} sightings")
    print(f"[seed] generated {len(alerts)} absence anomalies")


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--individuals", type=int, default=12)
    p.add_argument("--sightings-per-ind", type=int, default=6)
    p.add_argument("--image-size", type=int, default=224)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--use-real-images", action="store_true",
                   help="Reuse images found under ml/datasets/processed")
    seed(p.parse_args())


if __name__ == "__main__":
    main()