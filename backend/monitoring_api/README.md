# AuditSec Monitoring API (FastAPI + Redis)

Small companion service that serves live monitoring entities for the Leaflet module.

## Endpoints

- `GET /health` — basic health info
- `GET /entities` — returns the current entity list
- `WS /ws` — pushes updates (`snapshot`, `upsert`)

## Run (dev)

1) (Optional) start Redis (recommended):

- `docker run -p 6379:6379 redis:7`

2) Create a virtualenv and install deps:

- `python -m venv .venv`
- `./.venv/Scripts/pip install -r requirements.txt`

3) Start API:

- `./.venv/Scripts/python main.py`

Defaults:
- API: `http://localhost:8008`
- WS: `ws://localhost:8008/ws`

## Env vars

- `MONITORING_PORT` (default `8008`)
- `MONITORING_REDIS_URL` (default `redis://localhost:6379/0`)
- `MONITORING_CORS_ORIGINS` (default `*`)
