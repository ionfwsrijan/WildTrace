"""Rule-based anomaly detection engine.

For the MVP this is transparent and explainable (no ML): for each individual
with enough sightings to establish a baseline, if the number of days since the
last sighting exceeds a multiple of their historical average sighting interval,
we flag an "absence anomaly" — mirroring the deck's own example alert text:
    "{id} absent from usual zone for unusually long period"
"""
from datetime import datetime, timedelta

from app.db.database import utcnow
from typing import List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.alert import Alert
from app.models.individual import Individual


def _days_between(a: datetime, b: datetime) -> float:
    return abs((a - b).total_seconds()) / 86400.0


def check_absence_anomalies(db: Session,
                            now: Optional[datetime] = None,
                            threshold_multiplier: Optional[float] = None,
                            min_sightings: Optional[int] = None) -> List[Alert]:
    """Scan for individuals overdue since their last sighting; return new alerts."""
    settings = get_settings()
    multiplier = threshold_multiplier if threshold_multiplier is not None \
        else settings.ANOMALY_THRESHOLD_MULTIPLIER
    min_s = min_sightings if min_sightings is not None \
        else settings.ANOMALY_MIN_SIGHTINGS
    now = now or utcnow()

    created: List[Alert] = []
    individuals = db.query(Individual).all()
    for ind in individuals:
        if ind.total_sightings < min_s or ind.avg_sighting_interval_days <= 0:
            continue
        days_since = _days_between(now, ind.last_seen_at)
        threshold_days = ind.avg_sighting_interval_days * multiplier
        if days_since > threshold_days:
            # Avoid duplicate open alerts for the same individual
            existing = db.query(Alert).filter(
                Alert.individual_id == ind.id,
                Alert.alert_type == "absence_anomaly",
                Alert.status == "open",
            ).first()
            if existing:
                continue
            alert = Alert(
                individual_id=ind.id,
                alert_type="absence_anomaly",
                description=f"{ind.id} absent from usual zone for unusually long period "
                            f"({int(days_since)} days since last sighting, expected avg "
                            f"{ind.avg_sighting_interval_days:.1f} days)",
                status="open",
            )
            db.add(alert)
            created.append(alert)
    db.commit()
    return created


def update_individual_interval(db: Session, individual: Individual) -> None:
    """Recalculate avg sighting interval from the individual's sighting history."""
    from app.models.sighting import Sighting
    timestamps = [
        s.captured_at for s in db.query(Sighting)
        .filter(Sighting.individual_id == individual.id)
        .order_by(Sighting.captured_at.asc())
        .all()
    ]
    if len(timestamps) < 2:
        individual.avg_sighting_interval_days = 0.0
        return
    gaps = [_days_between(timestamps[i], timestamps[i + 1])
            for i in range(len(timestamps) - 1)]
    individual.avg_sighting_interval_days = round(sum(gaps) / len(gaps), 2)
    db.add(individual)
