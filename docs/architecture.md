# WildTrace Architecture

## Problem & Technical Shift

Current wildlife monitoring tells us **what** animal was seen. WildTrace tells
us **which individual**, **where it was seen before**, and **what has changed** —
shifting from **classification** ("what species?") to **re-identification**
("which individual?").

Learning to separate individuals uses **triplet loss** with few-shot learning:

- **Anchor** = a reference image of an individual (e.g. WT-024)
- **Positive** = another image of the **same** individual → embeddings pulled closer
- **Negative** = an image of a **different** individual → embeddings pushed apart

The result is an embedding space where images of the same animal cluster tightly
and different animals stay separated, even with few examples per individual.

## End-to-End Pipeline

```
Ranger/User uploads image + GPS + timestamp
        │
        ▼
[1. Input]           camera-trap photo (auto or manual upload)
        │
        ▼
[2. YOLO Detection]  detect + bbox + crop region of interest
        │
        ▼
[3. Preprocess]      resize → center-crop → normalize
        │
        ▼
[4-5. Embedding]     DenseNet121 → L2-normalized 512-d feature vector
        │                       [0.21, -0.45, 0.32, ..., 0.17]
        ▼
[6. FAISS search]    approximate nearest-neighbour in the individual index
        │
        ▼
[7. Match/Register]  sim ≥ 0.65 → KNOWN  (e.g. WT-024, sim 0.92)
        │             sim <  0.65 → NEW    (assign WT-125)
        ▼
[8. Sighting record] individual_id, image, GPS, timestamp, confidence
        │
        ▼
[9. Intelligence]    movement patterns · absence anomalies · ranger alerts
```

## Database Schema (MVP)

**individuals**
| column | type |
|---|---|
| id | text PK (`WT-024`) |
| species | text (`Amur Tiger`) |
| first_seen_at / last_seen_at | timestamp |
| total_sightings | int |
| representative_image_url | text |
| avg_sighting_interval_days | float |
| notes | text |

**sightings**
| column | type |
|---|---|
| id | serial PK |
| individual_id | FK → individuals (nullable) |
| image_url | text |
| embedding_id | int (FAISS ref) |
| latitude / longitude | float |
| zone_name | text |
| captured_at | timestamp |
| confidence_score | float |
| match_status | text (`matched` / `new_individual`) |
| verified_by_human | bool |

**alerts**
| column | type |
|---|---|
| id | serial PK |
| individual_id | FK |
| alert_type | text (`absence_anomaly` / `new_individual` / `location_jump`) |
| description | text |
| created_at | timestamp |
| status | text (`open` / `reviewed` / `resolved`) |
| reviewed_by | text |

## Anomaly Detection (rule-based, explainable)

```
for each individual:
    expected = individual.avg_sighting_interval_days
    overdue  = today - individual.last_seen_at
    if overdue > expected * 2.0  and  total_sightings ≥ 3:
        create alert:  "{id} absent from usual zone for unusually long period"
```

Human rangers review and resolve alerts — the system is decision-support, not
automated detection.

## Anti-Poaching Workflow (the deck's scenario, implemented)

1. Camera-trap image → WildTrace identifies **WT-024**
2. Sighting check → cross-references previous observations
3. Anomaly detected → *"WT-024 absent from usual zone for unusually long period"*
4. **Human verification** → alert sent to conservation team
5. Conservation response → informed action by rangers

## Benchmarks & Feasibility

Source: Wahltinez & Wahltinez (2024), *Methods in Ecology and Evolution* —
an open-source few-shot individual re-ID framework. Reported **mAP@1**:

| Species | mAP@1 |
|---|---|
| Amur Tigers | 99.74% |
| Cattle | 99.37% |
| StripeSpotter | 98.22% |
| Zebra + Giraffe | 90.72% |
| Ringed Seals | 87.04% |
| Chimpanzees | 83.85% |

Our MVP targets 1 species (Amur Tiger), maximizing feasibility. See
`docs/model_card.md` for our measured numbers compared against 99.74%.

## Out of Scope for MVP (future)

Multi-species re-ID · real-time video/live trap ingestion · geospatial risk
scoring · external conservation-DB integration · mobile ranger app ·
automated poacher detection.