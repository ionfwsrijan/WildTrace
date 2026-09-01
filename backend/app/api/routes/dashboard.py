"""Dashboard statistics endpoint."""
from fastapi import APIRouter, Depends
from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.alert import Alert
from app.models.individual import Individual
from app.models.schemas import DashboardStats, SightingOut
from app.models.sighting import Sighting

router = APIRouter()


@router.get("/api/dashboard/stats", response_model=DashboardStats)
def dashboard_stats(db: Session = Depends(get_db)):
    """Return headline conservation-intelligence numbers for the dashboard."""
    total_individuals = db.query(func.count(Individual.id)).scalar() or 0
    total_sightings = db.query(func.count(Sighting.id)).scalar() or 0
    open_alerts = db.query(func.count(Alert.id)).filter(Alert.status == "open").scalar() or 0

    recent = db.query(Sighting).order_by(Sighting.captured_at.desc()).limit(10).all()

    species_breakdown = {}
    for species, cnt in db.query(Individual.species, func.count(Individual.id)).group_by(Individual.species).all():
        species_breakdown[species or "Unknown"] = cnt

    return DashboardStats(
        total_individuals=total_individuals,
        total_sightings=total_sightings,
        open_alerts=open_alerts,
        recent_sightings=[SightingOut.model_validate(s) for s in recent],
        species_breakdown=species_breakdown,
    )