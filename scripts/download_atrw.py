"""Download the ATRW (Amur Tiger Re-identification in the Wild) re-ID dataset.

Retrieves the training re-ID images (cropped per-tiger crops) and their identity
annotations from the public Microsoft Azure blob mirror (LILA Bioscience), the
same source referenced by the official ATRW repositories.

Sources (LILA Bioscience mirrors, verified reachable):
  train images       https://storage.googleapis.com/public-datasets-lila/cvwc2019/train/atrw_reid_train.tar.gz
  train annotations  https://storage.googleapis.com/public-datasets-lila/cvwc2019/train/atrw_anno_reid_train.tar.gz

Usage:
    python -m scripts.download_atrw
    python -m scripts.download_atrw --images-only   # skip annotations if already present
"""
import argparse
import sys
import tarfile
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / "backend"))

IMAGES_URL = "https://storage.googleapis.com/public-datasets-lila/cvwc2019/train/atrw_reid_train.tar.gz"
ANNO_URL = "https://storage.googleapis.com/public-datasets-lila/cvwc2019/train/atrw_anno_reid_train.tar.gz"

ATRW_DIR = ROOT / "ml" / "datasets" / "atrw"
TAR_DIR = ATRW_DIR / "_downloads"
CROPPED_DIR = ATRW_DIR / "cropped"
TRAIN_DIR = CROPPED_DIR / "train"
ANNO_DIR = ATRW_DIR / "annotation"


def _fetch(url: str, dest: Path, chunk=1024 * 256) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        print(f"[download] {dest.name} already present, skipping.")
        return
    print(f"[download] fetching {url}")
    with urllib.request.urlopen(url) as resp, open(dest, "wb") as out:
        total = 0
        while True:
            block = resp.read(chunk)
            if not block:
                break
            out.write(block)
            total += len(block)
            print(f"  ... {total/1e6:.1f} MB", end="\r")
    print(f"\n[download] saved {total/1e6:.1f} MB -> {dest}")


def _extract(archive: Path, target: Path) -> None:
    target.mkdir(parents=True, exist_ok=True)
    print(f"[extract] {archive.name} -> {target}")
    with tarfile.open(archive, "r:gz") as tar:
        # Security: only extract known members, strip path traversal
        for member in tar.getmembers():
            name = Path(member.name)
            if name.is_absolute() or ".." in name.parts:
                continue
            tar.extract(member, path=target)
    print(f"[extract] done")


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--images-only", action="store_true",
                   help="Only download images, skip annotations")
    p.add_argument("--skip-download", action="store_true",
                   help="Use already-downloaded tarballs")
    args = p.parse_args()

    TAR_DIR.mkdir(parents=True, exist_ok=True)
    img_tar = TAR_DIR / "atrw_reid_train.tar.gz"
    anno_tar = TAR_DIR / "atrw_anno_reid_train.tar.gz"

    if not args.skip_download:
        _fetch(IMAGES_URL, img_tar)
        if not args.images_only:
            _fetch(ANNO_URL, anno_tar)

    if not img_tar.exists():
        print("[download] images tarball not found; nothing to extract.")
        return
    _extract(img_tar, CROPPED_DIR)
    if anno_tar.exists():
        _extract(anno_tar, ANNO_DIR)

    print("[download] ATRW re-ID data ready.")
    if TRAIN_DIR.exists():
        print(f"[download] cropped train images: {sum(1 for _ in TRAIN_DIR.rglob('*') if _.suffix.lower() in {'.jpg','.jpeg','.png'})}")


if __name__ == "__main__":
    main()