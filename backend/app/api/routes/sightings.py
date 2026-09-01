"""Sighting listing/filtering endpoints."""
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.schemas import SightingOut
from app.models.sighting import Sighting

router = APIRouter()


@router.get("/api/sightings", response_model=list[SightingOut])
def list_sightings(
    individual_id: Optional[str] = Query(None),
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    zone: Optional[str] = Query(None),
    limit: int = Query(100, ge=1, le=1000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List sightings with optional filtering."""
    q = db.query(Sighting)
    if individual_id:
        q = q.filter(Sighting.individual_id == individual_id)
    if start:
        q = q.filter(Sighting.captured_at >= start)
    if end:
        q = q.filter(Sighting.captured_at <= end)
    if zone:
        q = q.filter(Sighting.zone_name == zone)
    rows = q.order_by(Sighting.captured_at.desc()).offset(offset).limit(limit).all()
    return rows