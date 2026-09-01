"""WildTrace configuration using pydantic-settings.

Reads from environment variables (with `.env` file support).
Paths are resolved relative to the project backend directory.
"""
from pathlib import Path
from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent  # backend/
PROJECT_ROOT = BACKEND_DIR.parent  # wildtrace/


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(PROJECT_ROOT / ".env"), extra="ignore")

    # Database
    DATABASE_URL: str = f"sqlite:///{BACKEND_DIR / 'wildtrace.db'}"
    DATABASE_ECHO: bool = False

    # ML paths
    FAISS_INDEX_PATH: Path = PROJECT_ROOT / "data" / "faiss_index" / "wildtrace.index"
    UPLOAD_DIR: Path = PROJECT_ROOT / "data" / "uploads"
    YOLO_MODEL_PATH: Path = PROJECT_ROOT / "ml" / "detection" / "weights" / "yolov8_best.pt"
    REID_MODEL_PATH: Path = PROJECT_ROOT / "ml" / "reid" / "checkpoints" / "densenet121_triplet_best.pt"

    # Embedding / matching
    EMBEDDING_DIM: int = 512
    SIMILARITY_THRESHOLD: float = 0.65

    # Anomaly detection
    ANOMALY_THRESHOLD_MULTIPLIER: float = 2.0
    ANOMALY_MIN_SIGHTINGS: int = 3

    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Runtime flags
    USE_YOLO: bool = True
    USE_REID: bool = True


@lru_cache
def get_settings() -> Settings:
    s = Settings()
    # Resolve any relative env-provided paths against the project root so the
    # app behaves identically regardless of the working directory.
    for attr in ("FAISS_INDEX_PATH", "UPLOAD_DIR", "YOLO_MODEL_PATH", "REID_MODEL_PATH"):
        val = getattr(s, attr)
        if isinstance(val, Path) and not val.is_absolute():
            setattr(s, attr, (PROJECT_ROOT / val).resolve())
    return s
