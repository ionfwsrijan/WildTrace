"""CLI to run the WildTrace pipeline on a single image and print the result.

Usage (from wildtrace/ root):
    python -m scripts.run_pipeline_cli data/uploads/my_photo.jpg \
        --lat 45.1 --lon 136.2 --zone "Sikhote-Alin Central"
"""
import argparse
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))


def main():
    p = argparse.ArgumentParser(description="Run WildTrace detect→embed→match→store once")
    p.add_argument("image", help="Path to a camera-trap image")
    p.add_argument("--lat", type=float, default=None)
    p.add_argument("--lon", type=float, default=None)
    p.add_argument("--zone", default=None)
    p.add_argument("--captured-at", default=None, help="ISO datetime string")
    args = p.parse_args()

    captured = None
    if args.captured_at:
        from datetime import datetime
        captured = datetime.fromisoformat(args.captured_at)

    from app.core.pipeline import run_pipeline_sync
    result = run_pipeline_sync(
        args.image,
        latitude=args.lat,
        longitude=args.lon,
        zone_name=args.zone,
        captured_at=captured,
    )
    print(json.dumps(result, indent=2, default=str))


if __name__ == "__main__":
    main()