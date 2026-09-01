# WildTrace Model Card — individual re-identification

## Overview
Individual animal re-identification (Re-ID) via **learned image embeddings**.
Input: cropped camera-trap image. Output: an L2-normalized embedding vector and,
through FAISS search, an identity decision (match existing / register new).

## Model
- **Backbone:** DenseNet121, ImageNet-pretrained (torchvision).
- **Head:** global average pool → BN → linear projection to 512-d → L2 norm.
- **Loss:** batch-hard triplet loss (margin 1.0), fine-tuning for episodes.
- **Optimizer:** Adam, lr 1e-4.

## Training data
- **ATRW — Amur Tiger Re-identification in the Wild** (Li et al., 2019),
  organized as per-individual folders under `ml/datasets/processed/`.
- Few-shot episodic sampling: batches of N identities × M images each.

## Evaluation protocol
Gallery/query split (50/50 per individual). A query is correct if its
nearest neighbour in the gallery shares the individual's label.

## Benchmark comparison (mAP@1)

| Metric | Deck-cited (Wahltinez & Wahltinez 2024) | This project |
|---|---|---|
| Amur Tiger mAP@1 | **99.74%** | *fill in from `ml/reid/evaluate.py` output* |
| Our measured Rank-1 | — | *fill in* |

Update `docs/model_card.md` with the actual number from:

```bash
python -m ml.reid.evaluate --data ml/datasets/processed \
    --checkpoint ml/reid/checkpoints/densenet121_triplet_best.pt
```

A strong final-presentation point is the comparison of our measured mAP@1
against the 99.74% published benchmark.

## Match threshold
- Embeddings are L2-normalized, so Euclidean distance maps to cosine similarity
  `sim = 1 - d²/2`.
- Decision: `sim ≥ 0.65` → **match** existing individual; else **new individual**.

## Known limits (MVP)
- Single species (Amur Tiger) only.
- Requires a detector to produce a clean crop; poor crops degrade accuracy.
- Threshold (0.65) is a coarse knob — can be tuned per deployment after
  evaluating new-vs-known precision/recall on local data.
- No real-time/video support; batch/on-demand processing only.