"""Individual endpoints: list and profile."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.individual import Individual
from app.models.schemas import IndividualOut

router = APIRouter()


@router.get("/api/individuals", response_model=list[IndividualOut])
def list_individuals(limit: int = Query(50, ge=1, le=500),
                     offset: int = Query(0, ge=0),
                     db: Session = Depends(get_db)):
    """List all registered individuals, newest-seen first."""
    rows = db.query(Individual).order_by(Individual.last_seen_at.desc()).offset(offset).limit(limit).all()
    return rows


@router.get("/api/individuals/{iid}", response_model=IndividualOut)
def get_individual(iid: str, db: Session = Depends(get_db)):
    """Return a single individual's profile including full sighting history."""
    ind = db.get(Individual, iid)
    if ind is None:
        raise HTTPException(status_code=404, detail=f"Individual {iid} not found")
    return ind