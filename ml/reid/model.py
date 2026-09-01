"""DenseNet121-based embedding network for individual animal re-identification.

This mirrors the WildTrace approach: a DenseNet121 backbone (ImageNet-pretrained)
whose final classification head is replaced with a dense embedding projection.
The model is trained with triplet loss so that embeddings of the same individual
cluster together in Euclidean space.
"""
import torch
import torch.nn as nn
from torchvision import models


class DenseNetEmbedding(nn.Module):
    """Produces a fixed-length embedding vector for a re-ID input image.

    Args:
        embedding_dim: Output dimensionality (e.g. 512).
        release_layers: Number of trailing DenseNet layers to unfreeze for fine-tuning.
    """

    def __init__(self, embedding_dim: int = 512):
        super().__init__()
        backbone = models.densenet121(weights=models.DenseNet121_Weights.IMAGENET1K_V1)
        self.features = backbone.features
        in_features = backbone.classifier.in_features  # 1024 for DenseNet121

        # Global pooling + embedding projection
        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.bn1 = nn.BatchNorm1d(in_features)
        self.fc = nn.Linear(in_features, embedding_dim)
        self.embedding_dim = embedding_dim

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        features = self.features(x)
        features = self.pool(features)
        features = features.view(features.size(0), -1)
        features = self.bn1(features)
        embedding = self.fc(features)
        # L2-normalize so that cosine similarity == dot product and
        # Euclidean distance is bounded, which makes thresholding simple.
        return nn.functional.normalize(embedding, p=2, dim=1)


def build_model(embedding_dim: int = 512) -> DenseNetEmbedding:
    return DenseNetEmbedding(embedding_dim=embedding_dim)
