# WildTrace API Specification

Base URL: `http://localhost:8000` · Interactive docs at `/docs` (Swagger UI).

All responses are JSON.

## POST /api/sightings/upload

Run the full pipeline (detect → embed → match/register → store) on one image.
`multipart/form-data`.

| field | type | required | notes |
|---|---|---|---|
| `file` | image | yes | camera-trap image |
| `latitude` | form float | no | `-90..90` |
| `longitude` | form float | no | `-180..180` |
| `zone_name` | form str | no | human-readable zone label |
| `captured_at` | form str | no | ISO-8601 datetime |

**200 — PipelineResult**
```json
{
  "sighting_id": 42,
  "individual_id": "WT-024",
  "match_status": "matched",
  "is_new_individual": false,
  "similarity": 0.92,
  "confidence_score": 0.92,
  "matched_individual": "WT-024",
  "image_url": "/data/uploads/....jpg",
  "detection_meta": { "bbox": [0,0,10,10], "score": 0.9, "class_id": 21, "fallback": false },
  "created_alert": null
}
```

Errors: `400` invalid image, `422` no animal detected / bad timestamp.

## GET /api/individuals

Query: `limit` (default 50), `offset` (default 0). Returns newest-first list.

## GET /api/individuals/{id}

Returns one individual with its full `sightings[]` history. `404` if missing.

## GET /api/sightings

Query: `individual_id`, `start`, `end` (ISO), `zone`, `limit`, `offset`.
Ordered newest-first.

## GET /api/alerts

Query: `status` (`open|reviewed|resolved`), `alert_type`, `limit`.
Ordered newest-first.

## POST /api/alerts/{id}/resolve

Body:
```json
{ "reviewed_by": "Ranger Name", "status": "resolved" }
```
`status` must be `reviewed` or `resolved`. Returns the updated alert.

## GET /api/dashboard/stats

```json
{
  "total_individuals": 12,
  "total_sightings": 72,
  "open_alerts": 2,
  "recent_sightings": [ {Sighting} ... ],
  "species_breakdown": { "Amur Tiger": 12 }
}
```

## GET /api/health

Liveness probe: `{ "status": "ok", "service": "wildtrace-backend" }`.