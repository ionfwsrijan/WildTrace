"""WildTrace FastAPI application entrypoint.

Run with:
    uvicorn app.main:app --reload
"""
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import alerts, dashboard, individuals, sightings, upload
from app.config import get_settings
from app.db.database import init_db

settings = get_settings()
# Ensure uploads dir exists for static serving
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="WildTrace API",
    description="Individual animal re-identification & conservation intelligence.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(individuals.router)
app.include_router(sightings.router)
app.include_router(alerts.router)
app.include_router(dashboard.router)

@app.get("/api/health")
def health():
    return {"status": "ok", "service": "wildtrace-backend"}


@app.get("/")
def root():
    return {"message": "WildTrace API — see /docs for interactive spec."}


# Serve uploaded images statically (MVP local disk storage)
app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")