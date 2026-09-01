"""Triplet loss implementation for embedding-space re-ID learning.

Uses an online (batch-hard) strategy: within each sampled batch we mine the
hardest positive and hardest negative for each anchor from the *embedded*
space, which is known to converge faster and more robustly than random
triplets for few-shot re-ID.
"""
import torch
import torch.nn as nn
import torch.nn.functional as F


class BatchHardTripletLoss(nn.Module):
    """Computes triplet loss with batch-hard mining.

    Expects embeddings of shape (batch, embedding_dim) and labels of shape
    (batch,) where images of the same individual share the same label.

    Args:
        margin: Margin betwen positive and negative distances.
    """

    def __init__(self, margin: float = 1.0):
        super().__init__()
        self.margin = margin

    def forward(self, embeddings: torch.Tensor, labels: torch.Tensor) -> torch.Tensor:
        # Pairwise squared Euclidean distances
        dist = torch.cdist(embeddings, embeddings, p=2)

        labels = labels.contiguous().view(-1, 1)
        same = labels == labels.t()  # (batch, batch) boolean of same individual
        same.fill_diagonal_(False)

        # Hardest positive: min distance to a same-label sample
        pos_mask = same.float()
        # Replace zeros with large number so min ignores them
        pos_dist = dist + (1 - pos_mask) * 1e9
        hardest_pos = pos_dist.min(dim=1)[0]

        # Hardest negative: min distance to a different-label sample
        neg_mask = (~same).float()
        pos_dist_neg = dist + (1 - neg_mask) * 1e9
        hardest_neg = pos_dist_neg.min(dim=1)[0]

        # Batch-hard triplet loss (mean over valid anchors only)
        loss = torch.relu(hardest_pos - hardest_neg + self.margin)
        return loss.mean()
