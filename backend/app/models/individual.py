"""ORM models and Pydantic schemas for the WildTrace domain.

Kept structured but readable for the MVP. We define three tables:
individuals, sightings, alerts (see docs/architecture.md for schema).
"""
from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base, utcnow


class Individual(Base):
    __tablename__ = "individuals"

    id = Column(String, primary_key=True)                 # e.g. WT-024
    species = Column(String, default="Amur Tiger")
    first_seen_at = Column(DateTime, default=utcnow)
    last_seen_at = Column(DateTime, default=utcnow)
    total_sightings = Column(Integer, default=0)
    representative_image_url = Column(Text, nullable=True)
    avg_sighting_interval_days = Column(Float, default=0.0)
    notes = Column(Text, default="")

    sightings = relationship("Sighting", back_populates="individual", cascade="all, delete-orphan")


class Sighting(Base):
    __tablename__ = "sightings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    individual_id = Column(String, ForeignKey("individuals.id"), nullable=True)
    image_url = Column(Text)
    embedding_id = Column(Integer, nullable=True)  # FAISS internal index reference
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    zone_name = Column(String, nullable=True)
    captured_at = Column(DateTime, default=utcnow)
    confidence_score = Column(Float, nullable=True)
    match_status = Column(String, default="new_individual")  # matched | new_individual
    verified_by_human = Column(Boolean, default=False)

    individual = relationship("Individual", back_populates="sightings")


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    individual_id = Column(String, ForeignKey("individuals.id"), nullable=True)
    alert_type = Column(String)  # absence_anomaly | new_individual | location_jump
    description = Column(Text)
    created_at = Column(DateTime, default=utcnow)
    status = Column(String, default="open")  # open | reviewed | resolved
    reviewed_by = Column(String, nullable=True)
