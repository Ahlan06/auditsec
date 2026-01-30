import asyncio
import json
import os
import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

try:
    from redis.asyncio import Redis  # type: ignore
except Exception:  # pragma: no cover
    Redis = None  # type: ignore

APP_HOST = os.getenv("MONITORING_HOST", "0.0.0.0")
APP_PORT = int(os.getenv("MONITORING_PORT", "8008"))
REDIS_URL = os.getenv("MONITORING_REDIS_URL", "redis://localhost:6379/0")
CACHE_KEY = os.getenv("MONITORING_CACHE_KEY", "auditsec:monitoring:entities")
PUBSUB_CH = os.getenv("MONITORING_PUBSUB_CHANNEL", "auditsec:monitoring:updates")

CORS_ORIGINS = [o.strip() for o in os.getenv("MONITORING_CORS_ORIGINS", "*").split(",") if o.strip()]

app = FastAPI(title="AuditSec Monitoring API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def now_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def demo_entities() -> List[Dict[str, Any]]:
    # Coordinates are [lat, lon] to match the frontend spec.
    return [
        {
            "id": "srv-par-01",
            "type": "server",
            "ip_address": "51.158.23.10",
            "hostname": "server-prod-01",
            "location": {"city": "Paris", "country": "France", "coordinates": [48.8566, 2.3522]},
            "status": "online",
            "provider": "OVH",
            "last_seen": now_str(),
            "bandwidth": "1.2 Gbps",
            "latency": "24ms",
            "security_score": 85,
            "tags": ["production", "encrypted", "monitored"],
        },
        {
            "id": "srv-nyc-01",
            "type": "server",
            "ip_address": "34.231.11.8",
            "hostname": "api-edge-us-east",
            "location": {"city": "New York", "country": "United States", "coordinates": [40.7128, -74.006]},
            "status": "warning",
            "provider": "AWS",
            "last_seen": now_str(),
            "bandwidth": "850 Mbps",
            "latency": "38ms",
            "security_score": 71,
            "tags": ["edge", "waf", "monitored"],
        },
        {
            "id": "dev-lan-01",
            "type": "device",
            "ip_address": "192.168.1.10",
            "hostname": "workstation-01",
            "location": {"city": "Lyon", "country": "France", "coordinates": [45.764, 4.8357]},
            "status": "online",
            "provider": "Local",
            "last_seen": now_str(),
            "bandwidth": "1 Gbps",
            "latency": "2ms",
            "security_score": 92,
            "tags": ["lan", "edr", "monitored"],
        },
        {
            "id": "iot-cam-01",
            "type": "iot",
            "ip_address": "192.168.1.55",
            "hostname": "camera-entrance",
            "location": {"city": "Lyon", "country": "France", "coordinates": [45.764, 4.84]},
            "status": "offline",
            "provider": "Local",
            "last_seen": now_str(),
            "bandwidth": "—",
            "latency": "—",
            "security_score": 54,
            "tags": ["iot", "camera", "isolated"],
        },
        {
            "id": "anom-01",
            "type": "anomaly",
            "ip_address": "203.0.113.77",
            "hostname": "suspicious-actor",
            "location": {"city": "Moscow", "country": "Russia", "coordinates": [55.7558, 37.6173]},
            "status": "warning",
            "provider": "Unknown",
            "last_seen": now_str(),
            "bandwidth": "—",
            "latency": "—",
            "security_score": 22,
            "tags": ["bruteforce", "geo-anomaly"],
        },
        {
            "id": "vpn-ams-01",
            "type": "vpn",
            "ip_address": "145.40.12.9",
            "hostname": "vpn-exit-ams",
            "location": {"city": "Amsterdam", "country": "Netherlands", "coordinates": [52.3676, 4.9041]},
            "status": "online",
            "provider": "AuditSec VPN",
            "last_seen": now_str(),
            "bandwidth": "2.4 Gbps",
            "latency": "18ms",
            "security_score": 96,
            "tags": ["vpn", "exit", "encrypted"],
        },
    ]


class EntityStore:
    def __init__(self):
        self._mem: List[Dict[str, Any]] = demo_entities()
        self._redis: Optional[Redis] = None

    async def connect(self) -> None:
        if Redis is None:
            return
        try:
            self._redis = Redis.from_url(REDIS_URL, decode_responses=True)
            await self._redis.ping()
        except Exception:
            self._redis = None

    async def get_entities(self) -> List[Dict[str, Any]]:
        if self._redis is None:
            return list(self._mem)

        raw = await self._redis.get(CACHE_KEY)
        if raw:
            try:
                data = json.loads(raw)
                if isinstance(data, list):
                    return data
            except Exception:
                pass

        # cache miss -> seed demo
        data = demo_entities()
        await self._redis.set(CACHE_KEY, json.dumps(data), ex=60)
        return data

    async def set_entities(self, entities: List[Dict[str, Any]]) -> None:
        self._mem = list(entities)
        if self._redis is None:
            return
        await self._redis.set(CACHE_KEY, json.dumps(entities), ex=60)

    async def publish_update(self, entity: Dict[str, Any]) -> None:
        if self._redis is None:
            return
        await self._redis.publish(PUBSUB_CH, json.dumps({"type": "upsert", "entity": entity}))


store = EntityStore()


@app.on_event("startup")
async def _startup() -> None:
    await store.connect()
    # Start a demo updater that simulates live monitoring.
    asyncio.create_task(_demo_updater())


@app.get("/health")
async def health() -> Dict[str, Any]:
    return {"ok": True, "redis": store._redis is not None}


@app.get("/entities")
async def list_entities() -> List[Dict[str, Any]]:
    return await store.get_entities()


@app.websocket("/ws")
async def ws(websocket: WebSocket) -> None:
    await websocket.accept()

    # Send initial snapshot
    entities = await store.get_entities()
    await websocket.send_text(json.dumps({"type": "snapshot", "entities": entities}))

    if store._redis is None:
        # No redis: we can only periodically resend snapshots.
        try:
            while True:
                await asyncio.sleep(3)
                entities = await store.get_entities()
                await websocket.send_text(json.dumps({"type": "snapshot", "entities": entities}))
        except WebSocketDisconnect:
            return

    # Redis pubsub
    pubsub = store._redis.pubsub()
    await pubsub.subscribe(PUBSUB_CH)

    try:
        while True:
            msg = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
            if msg and msg.get("type") == "message" and msg.get("data"):
                await websocket.send_text(msg["data"])
            await asyncio.sleep(0.05)
    except WebSocketDisconnect:
        return
    finally:
        try:
            await pubsub.unsubscribe(PUBSUB_CH)
            await pubsub.close()
        except Exception:
            pass


async def _demo_updater() -> None:
    # Simulates live updates by toggling statuses and last_seen.
    while True:
        try:
            entities = await store.get_entities()
            if not entities:
                await asyncio.sleep(2)
                continue

            e = random.choice(entities)
            status_cycle = ["online", "warning", "offline"]
            cur = e.get("status") or "offline"
            nxt = status_cycle[(status_cycle.index(cur) + 1) % len(status_cycle)] if cur in status_cycle else "online"

            updated = dict(e)
            updated["status"] = nxt
            updated["last_seen"] = now_str()

            # Small variability
            if updated.get("latency") and isinstance(updated.get("latency"), str) and updated["latency"].endswith("ms"):
                base = int("".join([c for c in updated["latency"] if c.isdigit()]) or "20")
                updated["latency"] = f"{max(1, base + random.randint(-4, 7))}ms"

            # apply
            entities2 = [updated if str(x.get("id")) == str(updated.get("id")) else x for x in entities]
            await store.set_entities(entities2)
            await store.publish_update(updated)
        except Exception:
            # keep loop alive
            pass

        await asyncio.sleep(2)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host=APP_HOST, port=APP_PORT, reload=True)
