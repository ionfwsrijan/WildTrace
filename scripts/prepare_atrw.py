"""Prepare the downloaded ATRW re-ID data for training and for the Dashboard.

Two outputs:
  1. `ml/datasets/processed/<WTxxx>/`  — real tiger images grouped into
     per-individual folders (used to train the embedding model).
  2. `data/sightings_real.csv`          — one row per annotated image with:
       individual_id (WTxxx), filename, captured_at, lat, lon, zone, image_url.
     This CSV is imported into the database by `scripts/load_real_data.py` so
     the dashboard / movement map / alerts are driven by REAL animal identities
     and REAL images.

Notes on honesty: the tiger identity + photo come from ATRW (real annotated
data). ATRW does not publish GPS or timestamps, so sighting coordinates/
timestamps are plausibly synthesised within the Sikhote-Alin reserve. This is
clearly only metadata for the demo movement timeline.

Usage:
    python -m scripts.prepare_atrw
    python -m scripts.prepare_atrw --max-images 120      # limit total images (speed)
    python -m scripts.prepare_atrw --individuals 20      # cap number of identities
"""
import argparse
import csv
import random
import sys
import shutil
from datetime import datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))

ANNO_DIR = ROOT / "ml" / "datasets" / "atrw" / "annotation"
IMAGES_DIR = ROOT / "ml" / "datasets" / "atrw" / "cropped" / "train"
PROCESSED_DIR = ROOT / "ml" / "datasets" / "processed"
OUT_CSV = ROOT / "data" / "sightings_real.csv"

# Sikhote-Alin reserve bounding box (plausible demo ranges)
LAT_MIN, LAT_MAX = 44.5, 46.5
LON_MIN, LON_MAX = 135.0, 137.5
ZONES = ["Sikhote-Alin North", "Sikhote-Alin Central", "Sikhote-Alin South",
         "Bikin Valley", "Olga Reserve"]


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--max-images", type=int, default=0, help="0 = all images")
    p.add_argument("--individuals", type=int, default=0, help="0 = all identities")
    args = p.parse_args()

    anno_csv = ANNO_DIR / "reid_list_train.csv"
    if not anno_csv.exists() or not IMAGES_DIR.exists():
        print("[prepare] run scripts.download_atrw first. Missing ATRW data.")
        return

    # Build id -> [files] from the real annotation list
    groups: dict[str, list] = {}
    with open(anno_csv, newline="") as f:
        for row in csv.reader(f):
            if len(row) < 2:
                continue
            raw_id, fname = row[0].strip(), row[1].strip()
            src = IMAGES_DIR / fname
            if not src.exists():
                continue
            groups.setdefault(raw_id, []).append(fname)

    if args.individuals:
        # keep the identities with the most images for a good demo/train basis
        groups = dict(sorted(groups.items(), key=lambda kv: len(kv[1]), reverse=True)[:args.individuals])

    # Only keep identities with >= 4 images: enough for a rich individual
    # profile page and to form valid positive pairs during batch-hard training.
    groups = {raw_id: files for raw_id, files in groups.items() if len(files) >= 4}

    rng = random.Random(42)

    # (re)create processed dir
    if PROCESSED_DIR.exists():
        shutil.rmtree(PROCESSED_DIR)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    rows = []
    for n, (raw_id, files) in enumerate(sorted(groups.items(), key=lambda kv: len(kv[1]), reverse=True), start=1):
        wt_id = f"WT-{int(raw_id):03d}"
        id_dir = PROCESSED_DIR / wt_id
        id_dir.mkdir(parents=True, exist_ok=True)

        keep = sorted(files)  # keep all images for this balanced identity

        # derive a demo timeline for this individual
        first = datetime(2026, 1, 1) + timedelta(days=rng.randint(0, 40))
        base_gap = rng.uniform(2.0, 6.0)
        t = first

        for fi, fname in enumerate(sorted(keep)):
            src = IMAGES_DIR / fname
            dst = id_dir / fname
            try:
                shutil.copy2(src, dst)
            except OSError as e:
                print(f"[prepare] skip {fname}: {e}")
                continue

            t = t + timedelta(days=max(0.2, base_gap + rng.gauss(0, 0.7)))
            rows.append({
                "individual_id": wt_id,
                "filename": fname,
                "captured_at": t.strftime("%Y-%m-%d %H:%M:%S"),
                "lat": round(rng.uniform(LAT_MIN, LAT_MAX), 6),
                "lon": round(rng.uniform(LON_MIN, LON_MAX), 6),
                "zone": rng.choice(ZONES),
                "image_url": f"ml/datasets/processed/{wt_id}/{fname}",
            })

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT_CSV, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["individual_id", "filename", "captured_at",
                                               "lat", "lon", "zone", "image_url"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"[prepare] {len(groups)} individuals, {len(rows)} real sightings")
    print(f"[prepare] images staged under ml/datasets/processed/")
    print(f"[prepare] sighting record -> {OUT_CSV}")


if __name__ == "__main__":
    main()