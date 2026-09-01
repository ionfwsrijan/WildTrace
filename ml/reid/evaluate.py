"""Evaluation: mAP@1 / Rank-1 accuracy and CMC curve for the re-ID model.

Standard gallery/query protocol: split each individual's images into a gallery
set and a query set. For each query, we embed it and find its nearest neighbour
in the gallery; correct if gallery neighbour shares the same individual label.
Rank-1 (mAP@1) is the mean fraction of queries whose top-1 match is correct.

Usage:
    python -m ml.reid.evaluate --data ml/datasets/processed \
        --checkpoint ml/reid/checkpoints/densenet121_triplet_best.pt
"""
import argparse
from pathlib import Path

import numpy as np
import torch
from PIL import Image
from tqdm import tqdm

from ml.embedding.extract_embeddings import EmbeddingExtractor, preprocess_image


def embed_folder(extractor, data_root: Path, is_gallery: bool, gallery_ratio=0.5,
                 seed=42):
    """Return (embeddings, labels, paths) for a gallery/query split per individual."""
    rng = np.random.RandomState(seed)
    embed_list, label_list, path_list = [], [], []

    label_dirs = sorted(p for p in Path(data_root).iterdir() if p.is_dir())
    for i, lab_dir in enumerate(lab_dirs):
        imgs = sorted(p for p in lab_dir.iterdir()
                      if p.suffix.lower() in {".jpg", ".jpeg", ".png"})
        if len(imgs) == 0:
            continue
        if is_gallery:
            chosen = imgs[:max(1, int(len(imgs) * gallery_ratio))]
        else:
            chosen = imgs[max(1, int(len(imgs) * gallery_ratio)):]

        for p in chosen:
            with Image.open(p) as im:
                t = preprocess_image(im)
            emb = extractor.embed(im)
            embed_list.append(emb)
            label_list.append(lab_dir.name)
            path_list.append(str(p))
    return np.vstack(embed_list), label_list, path_list


def rank1_accuracy(gallery_embs, gallery_labels, query_embs, query_labels):
    # Pairwise distance: query (Q,D) x gallery (G,D) -> (Q,G)
    Q, D = query_embs.shape
    G = gallery_embs.shape[0]
    dists = np.zeros((Q, G))
    for q in range(Q):
        diff = query_embs[q][None, :] - gallery_embs  # (G, D)
        dists[q] = np.linalg.norm(diff, axis=1)

    correct = 0
    for q in range(Q):
        top = int(np.argmin(dists[q]))
        if gallery_labels[top] == query_labels[q]:
            correct += 1
    return correct / max(Q, 1)


def cmc_curve(gallery_embs, gallery_labels, query_embs, query_labels, max_rank=10):
    Q, D = query_embs.shape
    G = gallery_embs.shape[0]
    dists = np.zeros((Q, G))
    for q in range(Q):
        diff = query_embs[q][None, :] - gallery_embs
        dists[q] = np.linalg.norm(diff, axis=1)
    ranked = np.argsort(dists, axis=1)
    curve = []
    for k in range(1, max_rank + 1):
        correct = sum(1 for q in range(Q) if gallery_labels[int(ranked[q, :k])].count(query_labels[q]))
        curve.append(correct / max(Q, 1))
    return curve


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--data", default="ml/datasets/processed")
    p.add_argument("--checkpoint", default="ml/reid/checkpoints/densenet121_triplet_best.pt")
    p.add_argument("--gallery-ratio", type=float, default=0.5)
    p.add_argument("--embedding-dim", type=int, default=512)
    args = p.parse_args()

    extractor = EmbeddingExtractor(checkpoint_path=args.checkpoint,
                                   embedding_dim=args.embedding_dim)
    gallery_embs, gallery_labels, _ = embed_folder(extractor, Path(args.data),
                                                   True, args.gallery_ratio)
    query_embs, query_labels, _ = embed_folder(extractor, Path(args.data),
                                               False, args.gallery_ratio)
    mAP1 = rank1_accuracy(gallery_embs, gallery_labels, query_embs, query_labels)
    curve = cmc_curve(gallery_embs, gallery_labels, query_embs, query_labels)
    print(f"[eval] gallery={gallery_embs.shape[0]} query={query_embs.shape[0]}")
    print(f"[eval] Rank-1 / mAP@1 = {mAP1:.4f}")
    print(f"[eval] CMC = " + ", ".join(f"r{r+1}:{c:.3f}" for r, c in enumerate(curve)))

    # Compare to the deck's cited Amur Tiger benchmark (99.74%)
    print(f"[eval] Deck benchmark (Amur Tiger) = 0.9974 -> gap {0.9974 - mAP1:+.4f}")


if __name__ == "__main__":
    main()
