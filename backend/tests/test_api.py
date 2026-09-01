"""API-level tests using FastAPI's TestClient.

The upload route instantiates SightingPipeline internally, so we monkeypatch
that class to a fake to test the HTTP layer without real model weights.
"""
import io

import pytest
from PIL import Image
from fastapi.testclient import TestClient

from app.main import app


class FakePipe:
    def process_sighting(self, *a, **kw):
        return {
            "sighting_id": 42,
            "individual_id": "WT-099",
            "match_status": "new_individual",
            "confidence_score": None,
            "similarity": 0.32,
            "matched_individual": None,
            "is_new_individual": True,
            "image_url": "/uploads/fake.jpg",
            "detection_meta": {"fallback": True, "reason": "test"},
            "created_alert": 1,
        }


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


@pytest.fixture
def fake_pipeline(monkeypatch):
    import app.api.routes.upload as upload_mod
    monkeypatch.setattr(upload_mod, "SightingPipeline", lambda db, **kw: FakePipe())


def test_health(client):
    assert client.get("/api/health").json()["status"] == "ok"


def test_upload_sighting(client, fake_pipeline):
    img = Image.new("RGB", (64, 64), (120, 80, 40))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    resp = client.post(
        "/api/sightings/upload",
        files={"file": ("tiger.jpg", buf, "image/jpeg")},
        data={"latitude": "46.5", "longitude": "137.0", "zone_name": "Sikhote-Alin"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["individual_id"] == "WT-099"
    assert data["is_new_individual"] is True


def test_dashboard_stats(client):
    resp = client.get("/api/dashboard/stats")
    assert resp.status_code == 200
    body = resp.json()
    assert "total_individuals" in body