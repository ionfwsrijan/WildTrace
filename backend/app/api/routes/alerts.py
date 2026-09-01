"""Alert listing and resolution endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.alert import Alert
from app.models.schemas import AlertOut, AlertResolve

router = APIRouter()


@router.get("/api/alerts", response_model=list[AlertOut])
def list_alerts(status: Optional[str] = Query(None),
                alert_type: Optional[str] = Query(None),
                limit: int = Query(100, ge=1, le=1000),
                db: Session = Depends(get_db)):
    """List alerts, newest first, optionally filtered by status/type."""
    q = db.query(Alert)
    if status:
        q = q.filter(Alert.status == status)
    if alert_type:
        q = q.filter(Alert.alert_type == alert_type)
    rows = q.order_by(Alert.created_at.desc()).limit(limit).all()
    return rows


@router.post("/api/alerts/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(alert_id: int, body: AlertResolve, db: Session = Depends(get_db)):
    """Mark an alert as reviewed/resolved by a ranger (human verification)."""
    alert = db.get(Alert, alert_id)
    if alert is None:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    alert.status = body.status
    alert.reviewed_by = body.reviewed_by
    db.commit()
    db.refresh(alert)
    return alert