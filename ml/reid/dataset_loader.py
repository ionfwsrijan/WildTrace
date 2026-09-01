"""Triplet sampling dataset loader for few-shot re-ID training.

Given a directory of per-individual folders (one subfolder per individual,
each containing images of that individual), produce batches where each batch
contains only a handful of distinct individuals but several images each, so that
batch-hard triplet mining finds valid anchors/positives/negatives.

Expected structure:
    data_root/
        WT001/  img_1.jpg, img_2.jpg, ...
        WT002/  ...
"""
import random
from pathlib import Path
from typing import Dict, List, Tuple

import torch
from PIL import Image
from torch.utils.data import Dataset

from ml.preprocessing.preprocess import to_tensor


class TripletDataset(Dataset):
    """Samples mini-batches of individuals for batch-hard triplet loss.

    A single `__getitem__` returns a list of (tensor, label) pairs drawn from
    `num_identities` distinct individuals with `images_per_identity` images each.
    """

    def __init__(self, data_root: Path = None,
                 num_identities: int = 8,
                 images_per_identity: int = 4,
                 image_size: int = 224,
                 identity_map: Dict[str, str] = None,
                 lazy=True):
        # identity_map: {image_path: individual_label}
        self.images_per_identity = images_per_identity
        self.num_identities = num_identities
        self.image_size = image_size

        if identity_map is None:
            identity_map = self._scan(data_root)
        self.identity_map = identity_map
        # label -> list of image paths
        self.groups: Dict[str, List[str]] = {}
        for path, label in identity_map.items():
            self.groups.setdefault(label, []).append(path)
        # Only keep identities with enough images to form a valid positive pair
        # (>= max(2, images_per_identity)); singleton identities would produce
        # anchors with no positive in the batch and corrupt batch-hard training.
        min_per_id = max(2, images_per_identity)
        self.groups = {lab: ps for lab, ps in self.groups.items() if len(ps) >= min_per_id}
        self.labels = sorted(self.groups.keys())
        if not self.labels:
            raise ValueError("No individual has enough images to form a valid positive pair.")

    @staticmethod
    def _scan(data_root: Path):
        identity_map = {}
        data_root = Path(data_root)
        for label_dir in sorted(data_root.iterdir()):
            if label_dir.is_dir():
                for img in sorted(label_dir.glob("*.jpg")) + sorted(label_dir.glob("*.jpeg")) + sorted(label_dir.glob("*.png")):
                    identity_map[str(img)] = label_dir.name
        return identity_map

    def __len__(self):
        return max(len(self.labels) // self.num_identities, 1)

    def __getitem__(self, idx):
        labels = random.sample(self.labels, min(self.num_identities, len(self.labels)))
        tensors, label_ids = [], []
        all_labels = self.labels
        for lab in labels:
            paths = random.sample(self.groups[lab], min(self.images_per_identity, len(self.groups[lab])))
            for p in paths:
                with Image.open(p) as im:
                    im = im.convert("RGB")
                tensors.append(to_tensor(im, self.image_size))
                label_ids.append(all_labels.index(lab))
        return torch.from_numpy(np_stack(tensors)), torch.tensor(label_ids, dtype=torch.long)


def np_stack(tensors):
    import numpy as np
    return np.stack(tensors, axis=0)


def collate_pair(batch):
    """Concatenate the per-item lists into single batched tensors."""
    images = torch.cat([b[0] for b in batch], dim=0)
    labels = torch.cat([b[1] for b in batch], dim=0)
    return images, labels
