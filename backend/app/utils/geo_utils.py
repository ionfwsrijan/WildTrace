"""Geo helpers for sighting coordinates."""
import math
from typing import Optional, Tuple


def haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance in kilometres between two GPS points."""
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def jitter_location(lat: Optional[float], lon: Optional[float],
                    max_km: float = 0.5) -> Tuple[Optional[float], Optional[float]]:
    """Add a small random offset for privacy-friendly demo maps (no-op if NaN)."""
    if lat is None or lon is None:
        return lat, lon
    # ~0.5 km in lat/lon degrees (approx at equator)
    dl = max_km / 111.0
    import random
    return lat + random.uniform(-dl, dl), lon + random.uniform(-dl, dl)