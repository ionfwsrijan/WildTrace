"""Assigns the next incremental WT-XXX individual ID.

MVP is scoped to Amur Tigers so the prefix is fixed. The generator queries the
database for the largest existing numeric suffix to avoid collisions.
"""
import re
from typing import Optional

from sqlalchemy.orm import Session

from app.models.individual import Individual

PREFIX = "WT"
PATTERN = re.compile(rf"^{PREFIX}-(\d+)$")


def next_individual_id(db: Session) -> str:
    """Return the next free individual ID, e.g. WT-125."""
    max_num = 0
    rows = db.query(Individual.id).all()
    for (iid,) in rows:
        m = PATTERN.match(iid or "")
        if m:
            max_num = max(max_num, int(m.group(1)))
    return f"{PREFIX}-{max_num + 1:03d}"


def parse_individual_number(iid: str) -> Optional[int]:
    m = PATTERN.match(iid or "")
    return int(m.group(1)) if m else None
