"""Sighting ORM model (re-export from the models package root).

Kept in its own module for clarity; `app.models.individual` defines the
shared `Base` by importing from the db layer, and this module files against an
importable module so Alembic and introspection stay simple.
"""
from app.models.individual import Sighting  # noqa: F401
from app.models.individual import Alert  # noqa: F401