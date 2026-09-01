"""Database engine, session factory and Base declarative class."""
from datetime import datetime, timezone

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import get_settings


def utcnow() -> datetime:
    """Naive UTC now (avoids deprecated datetime.utcnow)."""
    return datetime.now(timezone.utc).replace(tzinfo=None)

settings = get_settings()

connect_args = {}
use_static_pool = False
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False
    if ":memory:" in settings.DATABASE_URL:
        from sqlalchemy.pool import StaticPool
        use_static_pool = True

engine_kwargs = dict(echo=settings.DATABASE_ECHO, connect_args=connect_args)
if use_static_pool:
    engine_kwargs["poolclass"] = StaticPool
engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and closes it after request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables (used for a fast MVP instead of Alembic)."""
    import app.models.individual  # noqa: F401
    import app.models.sighting  # noqa: F401
    import app.models.alert  # noqa: F401

    Base.metadata.create_all(bind=engine)
