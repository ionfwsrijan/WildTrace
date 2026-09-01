"""Build and persist a FAISS index from a folder of per-individual images.

The index stores one embedding per image plus parallel metadata (individual
labels + sighting ids), so the backend can resolve nearest neighbours back to
individuals immediately.

Usage (from wildtrace/ root):
    python -m scripts.build_faiss_index --data ml/datasets/processed \
        --checkpoint ml/reid/checkpoints/densenet121_triplet_best.pt \
        --out data/faiss_index/wildtrace.index
"""
import argparse
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from ml.embedding.extract_embeddings import EmbeddingExtractor
from ml.embedding.faiss_index import FaissIndex


def main():
    p = argparse.ArgumentParser(description="Embed a folder and write a FAISS index")
    p.add_argument("--data", default="ml/datasets/processed",
                   help="Folder of per-individual subfolders")
    p.add_argument("--checkpoint", default="ml/reid/checkpoints/densenet121_triplet_best.pt")
    p.add_argument("--embedding-dim", type=int, default=512)
    p.add_argument("--out", default="data/faiss_index/wildtrace.index")
    args = p.parse_args()

    data_root = Path(args.data)
    images = sorted(p for p in data_root.rglob("*")
                    if p.suffix.lower() in {".jpg", ".jpeg", ".png"})
    if not images:
        print(f"[build] no images under {data_root}; index stays empty.")
        return

    extractor = EmbeddingExtractor(checkpoint_path=args.checkpoint,
                                   embedding_dim=args.embedding_dim)
    index = FaissIndex(dimension=args.embedding_dim, index_path=Path(args.out))

    for path in images:
        from PIL import Image
        with Image.open(path) as im:
            emb = extractor.embed(im.convert("RGB"))
        label = path.parent.name
        idx = index.add(emb, individual_id=label)
        print(f"[build] {path.relative_to(data_root)} -> label={label} id={idx}")

    index.save()
    print(f"[build] saved {index.size} vectors to {args.out}")


if __name__ == "__main__":
    main()