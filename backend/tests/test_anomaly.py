"""Unit tests for the anomaly-rule engine and id generator."""
from datetime import datetime, timedelta

from app.core.anomaly import check_absence_anomalies, update_individual_interval
from app.core.id_generator import next_individual_id, parse_individual_number
from app.db.database import Base, SessionLocal, engine
from app.models.individual import Individual
from app.models.sighting import Sighting
from app.config import get_settings


def _clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def _make_individual(db, iid, sightings=4, interval_days=2.0, last_days_ago=1):
    ind = Individual(
        id=iid, species="Amur Tiger",
        first_seen_at=datetime.utcnow() - timedelta(days=interval_days * sightings),
        last_seen_at=datetime.utcnow() - timedelta(days=last_days_ago),
        total_sightings=sightings,
        avg_sighting_interval_days=interval_days,
    )
    db.add(ind)
    db.commit()
    return ind


def test_id_generator_increments():
    db = _fresh_session()
    assert next_individual_id(db) == "WT-001"
    _make_individual(db, "WT-007")
    assert next_individual_id(db) == "WT-008"
    assert parse_individual_number("WT-007") == 7
    assert parse_individual_number("nope") is None


def test_anomaly_fires_on_long_absence():
    db = _fresh_session()
    _make_individual(db, "WT-001", last_days_ago=10, interval_days=2.0)  # 5x overdue
    alerts = check_absence_anomalies(db, threshold_multiplier=2.0, min_sightings=3)
    assert any(a.alert_type == "absence_anomaly" for a in alerts)
    assert "WT-001 absent from usual zone for unusually long period" in alerts[0].description


def test_anomaly_silent_when_baseline_absent():
    db = _fresh_session()
    _make_individual(db, "WT-001", sightings=1, last_days_ago=100)
    alerts = check_absence_anomalies(db, threshold_multiplier=2.0, min_sightings=3)
    assert len(alerts) == 0


def test_interval_updates_from_sightings():
    db = _fresh_session()
    ind = _make_individual(db, "WT-001", last_days_ago=1)
    now = datetime.utcnow()
    for i in range(3):
        db.add(Sighting(individual_id="WT-001", captured_at=now - timedelta(days=i * 2),
                        image_url=f"/uploads/wt001_s{i}.jpg"))
    db.commit()
    update_individual_interval(db, ind)
    db.refresh(ind)
    assert ind.avg_sighting_interval_days == pytest.approx(2.0, abs=0.01)


def _fresh_session():
    _clean_db()
    return SessionLocal()


import pytest  # noqa: E402 (imported at bottom so _clean_db works above)