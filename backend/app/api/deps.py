"""Shared API dependencies."""
from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.database import get_db


def get_db_session() -> Session:
    """Alias dependency so route modules that don't import db directly can."""
    return get_db()