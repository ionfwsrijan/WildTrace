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
        batch = embeddings.shape[0]
        if batch < 2:
            return embeddings.new_zeros(1)[0]

        # Pairwise squared Euclidean distances
        dist = torch.cdist(embeddings, embeddings, p=2)

        labels = labels.contiguous().view(-1, 1)
        same = labels == labels.t()  # (batch, batch) boolean of same individual
        same.fill_diagonal_(False)

        pos_mask = same.float()
        # Replace zero-within-row entries with a large finite sentinel so
        # `.min` never selects a co-occurring different-identity example.
        sentinel = 1e4
        no_positive_row = pos_mask.sum(dim=1) == 0  # anchors lacking a positive
        pos_dist = dist + (1 - pos_mask) * sentinel
        hardest_pos = pos_dist.min(dim=1)[0]

        neg_mask = (~same).float()
        pos_dist_neg = dist + (1 - neg_mask) * sentinel
        hardest_neg = pos_dist_neg.min(dim=1)[0]

        # Batch-hard triplet loss, dropping anchors that have no positive in the
        # batch (their hardest_pos is the sentinel and would corrupt the loss).
        valid = ~no_positive_row
        if not valid.any():
            return embeddings.new_zeros(1)[0]
        loss_all = torch.relu(hardest_pos - hardest_neg + self.margin)
        return loss_all[valid].mean()
