"""Pydantic request/response schemas for the WildTrace API."""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# ---- request models -----------------------------------------------------
class SightingUpload(BaseModel):
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    zone_name: Optional[str] = None
    captured_at: Optional[datetime] = None


class AlertResolve(BaseModel):
    reviewed_by: str
    status: str = Field("resolved", pattern="^(reviewed|resolved)$")


# ---- response models ----------------------------------------------------
class SightingOut(BaseModel):
    id: int
    individual_id: Optional[str]
    image_url: str
    latitude: Optional[float]
    longitude: Optional[float]
    zone_name: Optional[str]
    captured_at: datetime
    confidence_score: Optional[float]
    match_status: str
    verified_by_human: bool

    model_config = ConfigDict(from_attributes=True)


class PipelineResult(BaseModel):
    sighting_id: int
    individual_id: str
    match_status: str
    is_new_individual: bool
    similarity: Optional[float]
    confidence_score: Optional[float]
    matched_individual: Optional[str]
    image_url: str
    detection_meta: dict
    created_alert: Optional[int]


class IndividualOut(BaseModel):
    id: str
    species: str
    first_seen_at: datetime
    last_seen_at: datetime
    total_sightings: int
    representative_image_url: Optional[str]
    avg_sighting_interval_days: float
    notes: str
    sightings: List[SightingOut] = []

    model_config = ConfigDict(from_attributes=True)


class AlertOut(BaseModel):
    id: int
    individual_id: Optional[str]
    alert_type: str
    description: str
    created_at: datetime
    status: str
    reviewed_by: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class DashboardStats(BaseModel):
    total_individuals: int
    total_sightings: int
    open_alerts: int
    recent_sightings: List[SightingOut]
    species_breakdown: dict