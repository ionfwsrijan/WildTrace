# WildTrace 🐯

**Every Animal Has a Story. WildTrace Helps Remember It.**

WildTrace is a **decision-support and monitoring tool for conservation teams**
for individual animal re-identification and longitudinal tracking. It answers not
just *"what species was seen"* but *"which individual, where it was seen before,
and what has changed."*

**Track:** Wildlife & Anti-Poaching · **Team:** Srijan Jaiswal (leader),
Madhav Bharadwaj, M Rohit Kumar, Prisha Pandey

> ⚠️ **Framing:** WildTrace surfaces anomalies (e.g. "WT-024 absent from usual
> zone for unusually long period") for **human rangers to verify and act on**.
> It is *not* an automated poacher detection system.

---

## What it does

A single photo drives a 9-stage pipeline:

```
Upload (image + GPS + timestamp)
  → [YOLO detection & crop]
  → [Preprocess & align]
  → [DenseNet121 embedding → feature vector]
  → [FAISS similarity search]
  → [Match existing individual]  OR  [Register new individual (WT-XXX)]
  → [Store sighting record]
  → [Anomaly check & alerts]
  → [Dashboard / profile / movement map / alerts]
```

**MVP scope:** single species (Amur Tiger). Read the full plan + design in
`docs/architecture.md`.

---

## Tech stack

| Layer | Choice |
|---|---|
| Detection | YOLOv8 (Ultralytics) |
| Re-ID backbone | DenseNet121 (torchvision) + triplet loss |
| Vector search | FAISS (IndexFlatL2) |
| Backend | Python + FastAPI |
| Database | SQLite (MVP) / PostgreSQL later |
| Frontend | React + Vite + Tailwind CSS |
| Maps | Leaflet · Charts: Recharts |

---

## Quick start

### 1. Backend

```bash
cd wildtrace
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Initialize DB
python -m scripts.setup_db

# (Optional) populate with REAL ATRW Amur-tiger sightings.
# Skip this block and the app already ships with the DB pre-loaded from real data.
python -m scripts.load_real_data        # reads data/sightings_real.csv

# Run the API server
cd backend
uvicorn app.main:app --reload
```

Interactive API docs at http://localhost:8000/docs

### 2. Frontend

```bash
cd wildtrace/frontend
npm install
npm run dev
```

Open http://localhost:5173

### 3. Real ML (training the embedding model on ATRW)

The repo ships pre-loaded with a trained DenseNet121 embedding model, a FAISS
index, and 848 real Amur-tiger sightings. To reproduce/customise that from the
raw **ATRW** dataset:

1. Download + extract ATRW re-ID train images & annotations (GCP mirror):
   ```bash
   python -m scripts.download_atrw             # 3392 cropped tiger images
   ```
2. Group real images per individual and generate `data/sightings_real.csv`:
   ```bash
   python -m scripts.prepare_atrw --individuals 24
   ```
3. Train the embedding model on the real per-individual folders:
   ```bash
   python -m ml.reid.train --data ml/datasets/processed --epochs 15
   ```
4. Build the FAISS index from the real embeddings:
   ```bash
   python -m scripts.build_faiss_index --data ml/datasets/processed \
       --checkpoint ml/reid/checkpoints/densenet121_triplet_best.pt
   ```
5. Load the real individuals + sightings + alerts into the DB:
   ```bash
   python -m scripts.load_real_data
   ```
6. Evaluate Rank-1 / mAP@1:
   ```bash
   python -m ml.reid.evaluate --data ml/datasets/processed
   ```

Run a single image through the full pipeline without the UI:

```bash
python -m scripts.run_pipeline_cli my_cam_image.jpg --lat 45.1 --lon 136.2 --zone "Sikhote-Alin"
```

---

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/sightings/upload` | Full pipeline on one image |
| GET | `/api/individuals` | List individuals |
| GET | `/api/individuals/{id}` | Profile + sighting history |
| GET | `/api/sightings` | List/filter sightings |
| GET | `/api/alerts` | List alerts (filter by status) |
| POST | `/api/alerts/{id}/resolve` | Human verification / resolve |
| GET | `/api/dashboard/stats` | Dashboard summary |

Full spec: `docs/api_spec.md`

---

## Repository layout

```
ml/          models, training, embedding, FAISS
backend/     FastAPI app + core pipeline + DB + tests
frontend/    React dashboard (upload, profiles, map, alerts, insights)
scripts/     setup, seed, FAISS build, CLI pipeline
data/        uploads + persisted FAISS index
docs/        architecture, API spec, model card
```

## Tests

```bash
cd backend && pytest -q
```

## Project structure & team notes

- `docs/model_card.md` — benchmark comparison (our mAP@1 vs the cited 99.74%).
- `docs/architecture.md` — pipeline diagram + DB schema for the final report.
