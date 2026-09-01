"""Training loop for the DenseNet121 + triplet-loss re-ID model.

Usage (from the wildtrace/ root):
    python -m ml.reid.train --data ml/datasets/processed --epochs 20 \
        --out ml/reid/checkpoints/densenet121_triplet_best.pt

If no checkpoint exists after training, the extractor will still run but with
an untrained head — the training script is the path to a real embedding model.
"""
import argparse
import time
from pathlib import Path

import torch
import torch.optim as optim
from torch.utils.data import DataLoader
from tqdm import tqdm

from ml.reid.dataset_loader import TripletDataset, collate_pair
from ml.reid.model import DenseNetEmbedding
from ml.reid.triplet_loss import BatchHardTripletLoss


def train(args):
    device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[train] device={device}")

    dataset = TripletDataset(data_root=Path(args.data),
                             num_identities=args.identities_per_batch,
                             images_per_identity=args.images_per_identity,
                             image_size=args.image_size)
    loader = DataLoader(dataset, batch_size=1, shuffle=True,
                        collate_fn=collate_pair, num_workers=0)

    model = DenseNetEmbedding(embedding_dim=args.embedding_dim).to(device)
    loss_fn = BatchHardTripletLoss(margin=args.margin)
    optimizer = optim.Adam(model.parameters(), lr=args.lr)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)

    best_loss = float("inf")
    for epoch in range(args.epochs):
        model.train()
        running = 0.0
        n = 0
        start = time.time()
        for images, labels in tqdm(loader, desc=f"epoch {epoch+1}/{args.epochs}"):
            images, labels = images.to(device), labels.to(device)
            embeddings = model(images)
            loss = loss_fn(embeddings, labels)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            running += loss.item()
            n += 1
        avg = running / max(n, 1)
        print(f"[train] epoch={epoch+1} loss={avg:.4f} ({time.time()-start:.1f}s)")

        out_ckpt = out_path if epoch == args.epochs - 1 else out_path.with_name(f"{out_path.stem}_e{epoch+1}.pt")
        torch.save({"state_dict": model.state_dict(), "epoch": epoch + 1, "loss": avg},
                   out_ckpt)
        if avg < best_loss:
            best_loss = avg
            torch.save({"state_dict": model.state_dict(), "epoch": epoch + 1,
                        "loss": avg, "best": True}, out_path)
    print(f"[train] done. best_loss={best_loss:.4f} saved to {out_path}")


def main():
    p = argparse.ArgumentParser(description="Train WildTrace re-ID embedding model")
    p.add_argument("--data", default="ml/datasets/processed")
    p.add_argument("--out", default="ml/reid/checkpoints/densenet121_triplet_best.pt")
    p.add_argument("--epochs", type=int, default=20)
    p.add_argument("--embedding-dim", type=int, default=512)
    p.add_argument("--margin", type=float, default=1.0)
    p.add_argument("--lr", type=float, default=1e-4)
    p.add_argument("--identities-per-batch", type=int, default=8)
    p.add_argument("--images-per-identity", type=int, default=4)
    p.add_argument("--image-size", type=int, default=224)
    p.add_argument("--device", default=None)
    train(p.parse_args())


if __name__ == "__main__":
    main()
