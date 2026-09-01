"""Upload route: drives the full detection→embed→match→store pipeline."""
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.core.pipeline import PipelineError, SightingPipeline
from app.db.database import get_db
from app.models.schemas import PipelineResult, SightingUpload

router = APIRouter()


@router.post("/api/sightings/upload", response_model=PipelineResult)
async def upload_sighting(
    file: UploadFile = File(...),
    latitude: float | None = Form(None),
    longitude: float | None = Form(None),
    zone_name: str | None = Form(None),
    captured_at: str | None = Form(None),
    db: Session = Depends(get_db),
):
    """Upload a camera-trap image and run the whole WildTrace pipeline."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    try:
        img_bytes = await file.read()
        from PIL import Image
        from io import BytesIO
        image = Image.open(BytesIO(img_bytes))
        image.load()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Invalid image file: {exc}")

    captured = None
    if captured_at:
        from datetime import datetime
        try:
            captured = datetime.fromisoformat(captured_at)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=f"Bad captured_at: {exc}")

    pipe = SightingPipeline(db)
    try:
        result = pipe.process_sighting(
            image,
            filename=file.filename,
            latitude=latitude,
            longitude=longitude,
            zone_name=zone_name,
            captured_at=captured,
        )
    except PipelineError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    return PipelineResult(**result)