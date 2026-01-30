import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CircleMarker, MapContainer, Marker, Pane, Polyline, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import useLanguageStore from '../../store/languageStore';

import 'leaflet/dist/leaflet.css';

// Fix default marker icon asset resolution in bundlers (even if we only use CircleMarker,
// Leaflet may still reference defaults in some interactions).
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const TYPE_META = {
  server: { label: 'Servers', color: '#ef4444' },
  device: { label: 'Local devices', color: '#3b82f6' },
  iot: { label: 'IoT', color: '#22c55e' },
  anomaly: { label: 'Anomalies', color: '#facc15' },
  vpn: { label: 'VPN nodes', color: '#a855f7' },
};

const STATUS_META = {
  online: { label: 'Online', pill: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300' },
  offline: { label: 'Offline', pill: 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300' },
  warning: { label: 'Warning', pill: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-800 dark:text-yellow-300' },
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalize(s) {
  if (s === null || s === undefined) return '';
  return String(s).toLowerCase();
}

function formatMaybe(value) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function parseDateMs(s) {
  if (!s) return 0;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : 0;
}

function formatRelativeMs(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return '—';
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h}h`;
  const d = Math.round(h / 24);
  return `${d}d`;
}

function parseFirstNumber(value) {
  if (value === null || value === undefined) return null;
  const m = String(value).match(/(-?\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

function parseBandwidthToMbps(value) {
  if (value === null || value === undefined || value === '') return null;
  const s = String(value).trim().toLowerCase();
  const n = parseFirstNumber(s);
  if (n === null) return null;
  if (s.includes('gbps') || s.includes('gbit') || s.includes('gb/s')) return n * 1000;
  if (s.includes('mbps') || s.includes('mbit') || s.includes('mb/s')) return n;
  if (s.includes('kbps') || s.includes('kbit') || s.includes('kb/s')) return n / 1000;
  return n;
}

function formatMbps(mbps) {
  if (!Number.isFinite(mbps)) return '—';
  if (mbps >= 1000) return `${(mbps / 1000).toFixed(2)} Gbps`;
  if (mbps >= 10) return `${Math.round(mbps)} Mbps`;
  return `${mbps.toFixed(2)} Mbps`;
}

function bearingDeg(fromLat, fromLon, toLat, toLon) {
  const toRad = (d) => (d * Math.PI) / 180;
  const y = Math.sin(toRad(toLon - fromLon)) * Math.cos(toRad(toLat));
  const x =
    Math.cos(toRad(fromLat)) * Math.sin(toRad(toLat)) -
    Math.sin(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.cos(toRad(toLon - fromLon));
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

function distance2(lat1, lon1, lat2, lon2) {
  const dLat = lat1 - lat2;
  const dLon = lon1 - lon2;
  return dLat * dLat + dLon * dLon;
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function jitter(rng, base, spread) {
  return base + (rng() - 0.5) * spread;
}

function generateSyntheticEntities(count, seed = 1337) {
  const rng = mulberry32(seed);
  const providers = ['AWS', 'GCP', 'Azure', 'OVH', 'Hetzner', 'On-prem'];
  const types = ['server', 'device', 'iot', 'vpn', 'anomaly'];
  const statuses = ['online', 'online', 'online', 'warning', 'offline'];

  // A few global clusters to mimic real-world distribution
  const hubs = [
    { city: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
    { city: 'London', country: 'UK', lat: 51.5072, lon: -0.1276 },
    { city: 'Frankfurt', country: 'DE', lat: 50.1109, lon: 8.6821 },
    { city: 'New York', country: 'US', lat: 40.7128, lon: -74.006 },
    { city: 'San Francisco', country: 'US', lat: 37.7749, lon: -122.4194 },
    { city: 'Singapore', country: 'SG', lat: 1.3521, lon: 103.8198 },
    { city: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
    { city: 'Dubai', country: 'AE', lat: 25.2048, lon: 55.2708 },
  ];

  const out = [];
  const now = Date.now();
  for (let i = 0; i < count; i += 1) {
    const hub = pick(rng, hubs);
    const type = pick(rng, types);
    const status = pick(rng, statuses);
    const provider = pick(rng, providers);
    const lat = jitter(rng, hub.lat, 6.5);
    const lon = jitter(rng, hub.lon, 8.0);
    const latency = Math.max(1, Math.round(10 + rng() * 220 + (status === 'warning' ? 120 : 0)));
    const bw = Math.max(0.5, rng() * 950);
    const lastSeen = new Date(now - Math.floor(rng() * 60_000 * 25)).toISOString();

    out.push({
      id: `sim-${i + 1}`,
      type,
      status,
      hostname: type === 'server' ? `edge-${i + 1}` : undefined,
      ip_address: `10.${(i % 250) + 1}.${Math.floor(i / 250) % 250}.${(i % 250) + 1}`,
      provider,
      location: {
        city: hub.city,
        country: hub.country,
        coordinates: [lat, lon],
      },
      latency: `${latency} ms`,
      bandwidth: `${Math.round(bw)} Mbps`,
      last_seen: lastSeen,
      tags: type === 'anomaly' ? ['anomaly', 'waf'] : ['monitored'],
      security_score: Math.round(50 + rng() * 45),
    });
  }
  return out;
}

function useIsDark() {
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(document.documentElement.classList.contains('dark')));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  return isDark;
}

function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.setView(center, zoom, { animate: true, duration: 0.35 });
  }, [map, center, zoom]);

  return null;
}

export default function MonitoringLeafletMap({ initialEntities, apiUrl, wsUrl }) {
  const exportRef = useRef(null);
  const mapWrapperRef = useRef(null);

  const isDark = useIsDark();

  const { t, currentLanguage } = useLanguageStore();

  const MONITORING_CACHE_KEY = 'auditsec.monitoring.entities.v1';
  const MONITORING_CACHE_META_KEY = 'auditsec.monitoring.entitiesMeta.v1';

  const endpointsConfigured = useMemo(() => {
    const base = apiUrl || import.meta.env.VITE_MONITORING_API_URL;
    const url = wsUrl || import.meta.env.VITE_MONITORING_WS_URL;
    return Boolean(base || url);
  }, [apiUrl, wsUrl]);

  const [isOffline, setIsOffline] = useState(() => (typeof navigator !== 'undefined' ? !navigator.onLine : false));
  const [wsStatus, setWsStatus] = useState('disconnected'); // 'connecting' | 'connected' | 'disconnected'
  const [lastUpdateAt, setLastUpdateAt] = useState(0);

  const [cacheMeta, setCacheMeta] = useState(() => {
    try {
      const raw = localStorage.getItem(MONITORING_CACHE_META_KEY);
      if (!raw) return { cachedAt: 0, count: 0 };
      const parsed = JSON.parse(raw);
      return {
        cachedAt: typeof parsed?.cachedAt === 'number' ? parsed.cachedAt : 0,
        count: typeof parsed?.count === 'number' ? parsed.count : 0,
      };
    } catch {
      return { cachedAt: 0, count: 0 };
    }
  });

  const [entities, setEntities] = useState(() => {
    const seeded = Array.isArray(initialEntities) ? initialEntities : [];
    if (!endpointsConfigured) return seeded;
    try {
      const raw = localStorage.getItem(MONITORING_CACHE_KEY);
      if (!raw) return seeded;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : seeded;
    } catch {
      return seeded;
    }
  });
  const [activeTypes, setActiveTypes] = useState(() => new Set(Object.keys(TYPE_META)));
  const [activeStatuses, setActiveStatuses] = useState(() => new Set(Object.keys(STATUS_META)));
  const [activeProviders, setActiveProviders] = useState(() => new Set());
  const [search, setSearch] = useState('');

  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });

  const [selectedId, setSelectedId] = useState(null);

  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  const [exporting, setExporting] = useState(null); // 'png' | 'pdf' | 'json'

  const [simEnabled, setSimEnabled] = useState(false);
  const [simCount, setSimCount] = useState(0);
  const [simUpdatesPerSec, setSimUpdatesPerSec] = useState(0);
  const [simLastMergeMs, setSimLastMergeMs] = useState(0);

  const MotionDiv = motion.div;

  const canvasRenderer = useMemo(() => L.canvas({ padding: 0.5 }), []);

  useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Persist a compact cache snapshot (debounced)
  const cacheWriteTimerRef = useRef(null);
  useEffect(() => {
    if (!endpointsConfigured) return;
    if (cacheWriteTimerRef.current) clearTimeout(cacheWriteTimerRef.current);
    cacheWriteTimerRef.current = setTimeout(() => {
      try {
        const compact = (Array.isArray(entities) ? entities : []).map((e) => ({
          id: e?.id,
          type: e?.type,
          status: e?.status,
          hostname: e?.hostname,
          ip_address: e?.ip_address,
          provider: e?.provider,
          location: e?.location,
          latency: e?.latency,
          bandwidth: e?.bandwidth,
          last_seen: e?.last_seen,
          tags: e?.tags,
          security_score: e?.security_score,
        }));
        localStorage.setItem(MONITORING_CACHE_KEY, JSON.stringify(compact));
        localStorage.setItem(
          MONITORING_CACHE_META_KEY,
          JSON.stringify({ cachedAt: Date.now(), count: compact.length, lang: currentLanguage })
        );
        setCacheMeta({ cachedAt: Date.now(), count: compact.length });
      } catch {
        // ignore quota / serialization
      }
    }, 1000);
    return () => {
      if (cacheWriteTimerRef.current) clearTimeout(cacheWriteTimerRef.current);
    };
  }, [entities, endpointsConfigured, currentLanguage]);

  const providers = useMemo(() => {
    const set = new Set();
    for (const e of entities) {
      if (e?.provider) set.add(String(e.provider));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [entities]);

  useEffect(() => {
    setActiveProviders((prev) => {
      if (prev && prev.size) return prev;
      return new Set(providers);
    });
  }, [providers]);

  // Load initial entities from API (optional)
  useEffect(() => {
    const base = apiUrl || import.meta.env.VITE_MONITORING_API_URL;
    if (!base) return;

    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch(`${base}`.replace(/\/+$/, '') + '/entities');
        if (!resp.ok) return;
        const data = await resp.json().catch(() => null);
        if (!cancelled && Array.isArray(data)) {
          setEntities(data);
          setLastUpdateAt(Date.now());
          setIsOffline(false);
        }
      } catch {
        // ignore (dev/offline)
        if (!cancelled) setIsOffline(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [apiUrl]);

  // Live updates via WS (optional)
  useEffect(() => {
    const url = wsUrl || import.meta.env.VITE_MONITORING_WS_URL;
    if (!url) return;

    let ws;
    let retryTimer;
    let closed = false;

    const pendingUpserts = new Map();
    let flushTimer;

    const flush = () => {
      flushTimer = null;
      if (!pendingUpserts.size) return;
      const batch = Array.from(pendingUpserts.values());
      pendingUpserts.clear();
      setEntities((prev) => {
        const byId = new Map((Array.isArray(prev) ? prev : []).map((e) => [String(e.id), e]));
        for (const e of batch) byId.set(String(e.id), { ...byId.get(String(e.id)), ...e });
        return Array.from(byId.values());
      });
      setLastUpdateAt(Date.now());
    };

    const scheduleFlush = () => {
      if (flushTimer) return;
      flushTimer = setTimeout(flush, 120);
    };

    const connect = () => {
      if (closed) return;
      setWsStatus('connecting');
      try {
        ws = new WebSocket(url);
      } catch {
        retryTimer = setTimeout(connect, 1500);
        return;
      }

      ws.onopen = () => {
        setWsStatus('connected');
        setIsOffline(false);
      };

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg?.type === 'snapshot' && Array.isArray(msg.entities)) {
            setEntities(msg.entities);
            setIsOffline(false);
            setLastUpdateAt(Date.now());
            return;
          }
          if (msg?.type === 'upsert' && msg.entity) {
            pendingUpserts.set(String(msg.entity.id), msg.entity);
            scheduleFlush();
            return;
          }
          if (msg?.type === 'batch' && Array.isArray(msg.entities)) {
            for (const e of msg.entities) pendingUpserts.set(String(e.id), e);
            scheduleFlush();
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        if (closed) return;
        setWsStatus('disconnected');
        retryTimer = setTimeout(connect, 1500);
      };

      ws.onerror = () => {
        try {
          ws?.close();
        } catch {
          // ignore
        }
      };
    };

    connect();

    return () => {
      closed = true;
      if (retryTimer) clearTimeout(retryTimer);
      if (flushTimer) clearTimeout(flushTimer);
      setWsStatus('disconnected');
      try {
        ws?.close();
      } catch {
        // ignore
      }
    };
  }, [wsUrl]);

  // Dev-only: synthetic dataset + update simulator (for 1000+ points and <500ms refresh testing)
  useEffect(() => {
    const isDev = Boolean(import.meta.env.DEV);
    if (!isDev) return;

    const qs = new URLSearchParams(window.location.search);
    const flag = qs.get('sim') === '1' || String(import.meta.env.VITE_MONITORING_DEV_SIM || '') === '1';
    if (!flag) return;

    const base = apiUrl || import.meta.env.VITE_MONITORING_API_URL;
    const live = wsUrl || import.meta.env.VITE_MONITORING_WS_URL;
    // Don't override real backend data
    if (base || live) return;

    const count = Math.max(1000, Math.min(20000, Number(qs.get('n') || 5000)));
    const intervalMs = Math.max(80, Math.min(1000, Number(qs.get('interval') || 250)));
    const batchSize = Math.max(20, Math.min(2000, Number(qs.get('batch') || 200)));
    const seed = Number(qs.get('seed') || 1337);

    const rng = mulberry32(seed + 42);
    const list = generateSyntheticEntities(count, seed);
    setEntities(list);
    setSimEnabled(true);
    setSimCount(count);
    setLastUpdateAt(Date.now());
    setIsOffline(false);

    // Buffered upserts like the WS path, to exercise the same performance envelope
    const pending = new Map();
    let flushTimer;
    const updatesAppliedRef = { n: 0 };

    const flush = () => {
      flushTimer = null;
      if (!pending.size) return;
      const batch = Array.from(pending.values());
      pending.clear();

      const t0 = performance.now();
      setEntities((prev) => {
        const byId = new Map((Array.isArray(prev) ? prev : []).map((e) => [String(e.id), e]));
        for (const e of batch) byId.set(String(e.id), { ...byId.get(String(e.id)), ...e });
        return Array.from(byId.values());
      });
      const t1 = performance.now();
      setSimLastMergeMs(Math.round((t1 - t0) * 10) / 10);
      updatesAppliedRef.n += batch.length;
      setLastUpdateAt(Date.now());
    };

    const scheduleFlush = () => {
      if (flushTimer) return;
      flushTimer = setTimeout(flush, 120);
    };

    const updateTimer = setInterval(() => {
      // Update a subset of nodes
      for (let i = 0; i < batchSize; i += 1) {
        const idx = Math.floor(rng() * count);
        const id = `sim-${idx + 1}`;
        const st = rng() < 0.02 ? 'offline' : rng() < 0.08 ? 'warning' : 'online';
        const latency = Math.max(1, Math.round(10 + rng() * 220 + (st === 'warning' ? 140 : 0)));
        const bw = Math.max(1, rng() * 950);
        pending.set(id, {
          id,
          status: st,
          latency: `${latency} ms`,
          bandwidth: `${Math.round(bw)} Mbps`,
          last_seen: new Date().toISOString(),
        });
      }
      scheduleFlush();
    }, intervalMs);

    const statsTimer = setInterval(() => {
      setSimUpdatesPerSec(updatesAppliedRef.n);
      updatesAppliedRef.n = 0;
    }, 1000);

    return () => {
      clearInterval(updateTimer);
      clearInterval(statsTimer);
      if (flushTimer) clearTimeout(flushTimer);
      setSimEnabled(false);
      setSimCount(0);
      setSimUpdatesPerSec(0);
      setSimLastMergeMs(0);
    };
  }, [apiUrl, wsUrl]);

  const filteredEntities = useMemo(() => {
    const q = normalize(search).trim();
    return (Array.isArray(entities) ? entities : []).filter((e) => {
      if (!e) return false;
      if (!activeTypes.has(e.type)) return false;
      const st = e.status || 'offline';
      if (!activeStatuses.has(st)) return false;

      if (activeProviders.size) {
        const provider = e.provider ? String(e.provider) : '';
        if (provider && !activeProviders.has(provider)) return false;
      }

      if (!q) return true;
      const hay = [
        e.ip_address,
        e.hostname,
        e.provider,
        e.location?.city,
        e.location?.country,
        Array.isArray(e.tags) ? e.tags.join(' ') : '',
      ]
        .map(normalize)
        .join(' ');

      return hay.includes(q);
    });
  }, [entities, activeTypes, activeStatuses, activeProviders, search]);

  const counts = useMemo(() => {
    const c = { server: 0, device: 0, iot: 0, anomaly: 0, vpn: 0 };
    for (const e of filteredEntities) {
      if (c[e.type] !== undefined) c[e.type] += 1;
    }
    return c;
  }, [filteredEntities]);

  const metrics = useMemo(() => {
    const list = Array.isArray(filteredEntities) ? filteredEntities : [];
    const total = list.length;
    const online = list.filter((e) => e?.status === 'online').length;
    const warning = list.filter((e) => e?.status === 'warning' || e?.type === 'anomaly').length;
    const offline = list.filter((e) => (e?.status || 'offline') === 'offline').length;

    const latencyValues = list
      .map((e) => parseFirstNumber(e?.latency))
      .filter((n) => typeof n === 'number' && Number.isFinite(n));
    const avgLatency = latencyValues.length
      ? latencyValues.reduce((a, b) => a + b, 0) / latencyValues.length
      : null;

    const bwValues = list
      .map((e) => parseBandwidthToMbps(e?.bandwidth))
      .filter((n) => typeof n === 'number' && Number.isFinite(n));
    const totalBw = bwValues.length ? bwValues.reduce((a, b) => a + b, 0) : null;

    return {
      total,
      online,
      warning,
      offline,
      avgLatency,
      totalBw,
      providers: providers.length,
    };
  }, [filteredEntities, providers.length]);

  const notifications = useMemo(() => {
    const now = Date.now();
    const list = (Array.isArray(entities) ? entities : [])
      .map((e) => {
        if (!e?.location?.coordinates) return null;
        const [lat, lon] = e.location.coordinates;
        if (typeof lat !== 'number' || typeof lon !== 'number') return null;

        const lastSeenMs = parseDateMs(e.last_seen);
        const ageMs = lastSeenMs ? now - lastSeenMs : Number.POSITIVE_INFINITY;
        const latency = parseFirstNumber(e.latency);

        let level = 'info';
        let reason = '';
        if (e.type === 'anomaly') {
          level = 'warning';
          reason = 'Anomaly detected';
        } else if ((e.status || 'offline') === 'offline') {
          level = 'warning';
          reason = 'Node offline';
        } else if (e.status === 'warning') {
          level = 'warning';
          reason = 'Warning status';
        } else if (typeof latency === 'number' && latency >= 200) {
          level = 'warning';
          reason = 'High latency';
        } else if (ageMs <= 5 * 60 * 1000) {
          level = 'info';
          reason = 'Recent activity';
        } else {
          return null;
        }

        return {
          id: String(e.id ?? `${e.type}-${e.ip_address}-${e.hostname}`),
          entity: e,
          level,
          reason,
          ts: lastSeenMs || 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.level !== b.level) return a.level === 'warning' ? -1 : 1;
        return (b.ts || 0) - (a.ts || 0);
      })
      .slice(0, 10);

    return list;
  }, [entities]);

  const selectedEntity = useMemo(() => {
    if (!selectedId) return null;
    return (Array.isArray(entities) ? entities : []).find((e) => String(e.id) === String(selectedId)) || null;
  }, [entities, selectedId]);

  // Cluster (simple grid-based)
  const clusterThreshold = 4;
  const clustersOrPoints = useMemo(() => {
    const pts = filteredEntities
      .map((e) => {
        const [lat, lon] = e?.location?.coordinates || [];
        if (typeof lat !== 'number' || typeof lon !== 'number') return null;
        return { e, lat, lon };
      })
      .filter(Boolean);

    const clusterEnabled = mapZoom < clusterThreshold;
    if (!clusterEnabled) return pts.map((p) => ({ kind: 'entity', ...p }));

    const cell = 12 / mapZoom;
    const byCell = new Map();

    for (const p of pts) {
      const key = `${Math.floor(p.lat / cell)}:${Math.floor(p.lon / cell)}`;
      if (!byCell.has(key)) byCell.set(key, { items: [], sumLat: 0, sumLon: 0 });
      const b = byCell.get(key);
      b.items.push(p);
      b.sumLat += p.lat;
      b.sumLon += p.lon;
    }

    const out = [];
    for (const [key, bucket] of byCell.entries()) {
      if (bucket.items.length <= 1) {
        out.push({ kind: 'entity', ...bucket.items[0] });
        continue;
      }
      const lat = bucket.sumLat / bucket.items.length;
      const lon = bucket.sumLon / bucket.items.length;
      const typeCounts = bucket.items.reduce((acc, it) => {
        acc[it.e.type] = (acc[it.e.type] || 0) + 1;
        return acc;
      }, {});
      const dominantType = Object.keys(typeCounts).sort((a, b) => (typeCounts[b] || 0) - (typeCounts[a] || 0))[0] || 'server';
      out.push({ kind: 'cluster', id: `cluster:${key}`, lat, lon, count: bucket.items.length, dominantType, typeCounts });
    }
    return out;
  }, [filteredEntities, mapZoom]);

  useEffect(() => {
    const onMove = (ev) => {
      if (!hovered) return;
      const el = mapWrapperRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setTooltip({
        x: clamp(ev.clientX - rect.left + 14, 12, rect.width - 12),
        y: clamp(ev.clientY - rect.top + 14, 12, rect.height - 12),
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [hovered]);

  const resetFilters = () => {
    setActiveTypes(new Set(Object.keys(TYPE_META)));
    setActiveStatuses(new Set(Object.keys(STATUS_META)));
    setActiveProviders(new Set(providers));
    setSearch('');
    setSelectedId(null);
  };

  const focusCluster = (cluster) => {
    setHovered(null);
    setSelectedId(null);
    setMapCenter([cluster.lat, cluster.lon]);
    setMapZoom((z) => clamp(z + 1.25, 1, 8));
  };

  const focusEntity = (e) => {
    if (!e?.location?.coordinates) return;
    const [lat, lon] = e.location.coordinates;
    if (typeof lat !== 'number' || typeof lon !== 'number') return;
    setHovered(null);
    setSelectedId(e.id ?? null);
    setMapCenter([lat, lon]);
    setMapZoom((z) => clamp(Math.max(z, 5), 1, 18));
  };

  const flows = useMemo(() => {
    const list = filteredEntities
      .map((e) => {
        const [lat, lon] = e?.location?.coordinates || [];
        if (typeof lat !== 'number' || typeof lon !== 'number') return null;
        return { e, lat, lon };
      })
      .filter(Boolean);

    const servers = list.filter((p) => p.e.type === 'server');
    if (!servers.length) return [];

    const candidates = list.filter((p) => p.e.type === 'vpn' || p.e.type === 'anomaly');
    const out = [];

    for (const p of candidates.slice(0, 20)) {
      let best = null;
      let bestD = Number.POSITIVE_INFINITY;
      for (const s of servers) {
        const d = distance2(p.lat, p.lon, s.lat, s.lon);
        if (d < bestD) {
          bestD = d;
          best = s;
        }
      }
      if (!best) continue;
      const color = TYPE_META[p.e.type]?.color || '#ef4444';
      out.push({
        id: `${String(p.e.id)}->${String(best.e.id)}`,
        from: [p.lat, p.lon],
        to: [best.lat, best.lon],
        color,
        bearing: bearingDeg(p.lat, p.lon, best.lat, best.lon),
        fromEntity: p.e,
        toEntity: best.e,
      });
    }

    return out;
  }, [filteredEntities]);

  const flowIcons = useMemo(() => {
    const map = new Map();
    for (const f of flows) {
      const key = `${f.color}:${Math.round(f.bearing)}`;
      if (map.has(key)) continue;
      map.set(
        key,
        L.divIcon({
          className: 'auditsec-flow-arrow',
          html: `<div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid ${f.color};transform:rotate(${f.bearing}deg);opacity:0.85"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        })
      );
    }
    return map;
  }, [flows]);

  const heatBuckets = useMemo(() => {
    const pts = filteredEntities
      .map((e) => {
        const [lat, lon] = e?.location?.coordinates || [];
        if (typeof lat !== 'number' || typeof lon !== 'number') return null;
        return { e, lat, lon };
      })
      .filter(Boolean);

    if (!pts.length) return [];

    // bucket size tuned to reduce draw calls for 1000+ points
    const cell = clamp(18 / Math.max(1, mapZoom), 1.2, 10);
    const byCell = new Map();
    for (const p of pts) {
      const key = `${Math.floor(p.lat / cell)}:${Math.floor(p.lon / cell)}`;
      if (!byCell.has(key)) byCell.set(key, { items: [], sumLat: 0, sumLon: 0 });
      const b = byCell.get(key);
      b.items.push(p);
      b.sumLat += p.lat;
      b.sumLon += p.lon;
    }

    const out = [];
    for (const bucket of byCell.values()) {
      const count = bucket.items.length;
      const lat = bucket.sumLat / count;
      const lon = bucket.sumLon / count;
      const typeCounts = bucket.items.reduce((acc, it) => {
        acc[it.e.type] = (acc[it.e.type] || 0) + 1;
        return acc;
      }, {});
      const dominantType = Object.keys(typeCounts).sort((a, b) => (typeCounts[b] || 0) - (typeCounts[a] || 0))[0] || 'server';
      const color = TYPE_META[dominantType]?.color || '#ef4444';
      const radius = clamp(10 + Math.sqrt(count) * 7, 10, 34);
      const opacity = clamp(0.05 + Math.log10(count + 1) * 0.06, 0.05, 0.18);
      out.push({ id: `${lat}:${lon}:${count}:${dominantType}`, lat, lon, count, color, radius, opacity });
    }
    return out;
  }, [filteredEntities, mapZoom]);

  const exportJson = async () => {
    setExporting('json');
    try {
      const payload = JSON.stringify(filteredEntities, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'auditsec-monitoring-entities.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(null);
    }
  };

  const exportPng = async () => {
    setExporting('png');
    try {
      setHovered(null);
      const el = exportRef.current;
      if (!el) return;
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: isDark ? '#000000' : '#ffffff',
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'auditsec-monitoring-map.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } finally {
      setExporting(null);
    }
  };

  const exportPdf = async () => {
    setExporting('pdf');
    try {
      setHovered(null);
      const el = exportRef.current;
      if (!el) return;
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(el, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: isDark ? '#000000' : '#ffffff',
      });
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 24;
      doc.addImage(dataUrl, 'PNG', margin, margin, pageW - margin * 2, pageH - margin * 2);
      doc.save('auditsec-monitoring-map.pdf');
    } finally {
      setExporting(null);
    }
  };

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <div ref={exportRef} className="apple-card p-0 overflow-hidden">
      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-4 p-6">
          <div>
            <h2 className="card-title">{t('monitoringTitle')}</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t('monitoringSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200">
              {t('monitoringZoom')}: {mapZoom.toFixed(1)}×
            </div>

            {import.meta.env.DEV && simEnabled ? (
              <div className="rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200">
                Sim: {simCount.toLocaleString()} · {simUpdatesPerSec.toLocaleString()}/s · merge {simLastMergeMs}ms
              </div>
            ) : null}

            {(wsUrl || import.meta.env.VITE_MONITORING_WS_URL) ? (
              <div
                className={
                  'rounded-full border px-3 py-1.5 text-xs ' +
                  (wsStatus === 'connected'
                    ? 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300'
                    : wsStatus === 'connecting'
                      ? 'border-yellow-400/30 bg-yellow-400/10 text-yellow-800 dark:text-yellow-300'
                      : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300')
                }
                title="WebSocket status"
              >
                {t('monitoringWs')}: {wsStatus === 'connected' ? t('monitoringWsConnected') : wsStatus === 'connecting' ? t('monitoringWsConnecting') : t('monitoringWsDisconnected')}
              </div>
            ) : null}

            {lastUpdateAt ? (
              <div className="rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200">
                {t('monitoringLastUpdate')}: {formatRelativeMs(Date.now() - lastUpdateAt)}
              </div>
            ) : null}

            {endpointsConfigured && isOffline ? (
              <div className="rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200">
                {t('monitoringOfflineCache')}
              </div>
            ) : null}

            {endpointsConfigured && cacheMeta.cachedAt ? (
              <div className="rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200">
                {t('monitoringCacheAge')}: {formatRelativeMs(Date.now() - cacheMeta.cachedAt)}
              </div>
            ) : null}
            <button
              type="button"
              onClick={exportJson}
              disabled={exporting !== null}
              className={
                'rounded-full border px-3 py-1.5 text-xs transition ' +
                (exporting
                  ? 'border-gray-200 dark:border-white/10 text-gray-400'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10')
              }
            >
              {exporting === 'json' ? t('monitoringExporting') : t('monitoringExportJson')}
            </button>
            <button
              type="button"
              onClick={exportPng}
              disabled={exporting !== null}
              className={
                'rounded-full border px-3 py-1.5 text-xs transition ' +
                (exporting
                  ? 'border-gray-200 dark:border-white/10 text-gray-400'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10')
              }
            >
              {exporting === 'png' ? t('monitoringExporting') : t('monitoringExportPng')}
            </button>
            <button
              type="button"
              onClick={exportPdf}
              disabled={exporting !== null}
              className={
                'rounded-full border px-3 py-1.5 text-xs transition ' +
                (exporting
                  ? 'border-gray-200 dark:border-white/10 text-gray-400'
                  : 'border-gray-200 dark:border-white/10 bg-white dark:bg-black text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10')
              }
            >
              {exporting === 'pdf' ? t('monitoringExporting') : t('monitoringExportPdf')}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition"
            >
              {t('monitoringResetFilters')}
            </button>
          </div>
        </div>

        <div className="px-6 pb-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('monitoringSearchPlaceholder')}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-300 dark:focus:border-white/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-xs text-gray-700 dark:text-gray-200">
                  {t('monitoringShowing')}: {filteredEntities.length}
                </div>
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('monitoringType')}</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(TYPE_META).map(([type, meta]) => {
                  const enabled = activeTypes.has(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => {
                        setActiveTypes((prev) => {
                          const next = new Set(prev);
                          if (next.has(type)) next.delete(type);
                          else next.add(type);
                          return next;
                        });
                      }}
                      onDoubleClick={() => setActiveTypes(new Set([type]))}
                      className={
                        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ' +
                        (enabled
                          ? 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100'
                          : 'border-gray-200/70 dark:border-white/10 bg-gray-50 dark:bg-black/40 text-gray-500 dark:text-gray-500')
                      }
                      title="Click to toggle. Double-click to isolate."
                    >
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color, opacity: enabled ? 1 : 0.35 }} />
                      <span>{meta.label}</span>
                      <span className="ml-1 rounded-full border border-gray-200 dark:border-white/10 px-2 py-0.5 text-[10px] text-gray-600 dark:text-gray-300">
                        {counts[type] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('monitoringStatus')}</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_META).map(([status, meta]) => {
                  const enabled = activeStatuses.has(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => {
                        setActiveStatuses((prev) => {
                          const next = new Set(prev);
                          if (next.has(status)) next.delete(status);
                          else next.add(status);
                          return next;
                        });
                      }}
                      onDoubleClick={() => setActiveStatuses(new Set([status]))}
                      className={
                        'inline-flex items-center rounded-full border px-3 py-2 text-xs transition ' +
                        (enabled
                          ? `border-gray-200 dark:border-white/10 ${meta.pill}`
                          : 'border-gray-200/70 dark:border-white/10 bg-gray-50 dark:bg-black/40 text-gray-500 dark:text-gray-500')
                      }
                      title="Click to toggle. Double-click to isolate."
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('monitoringProvider')}</div>
              <div className="flex flex-wrap gap-2">
                {providers.length ? (
                  providers.slice(0, 10).map((p) => {
                    const enabled = activeProviders.has(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setActiveProviders((prev) => {
                            const next = new Set(prev);
                            if (next.has(p)) next.delete(p);
                            else next.add(p);
                            return next;
                          });
                        }}
                        className={
                          'inline-flex items-center rounded-full border px-3 py-2 text-xs transition ' +
                          (enabled
                            ? 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100'
                            : 'border-gray-200/70 dark:border-white/10 bg-gray-50 dark:bg-black/40 text-gray-500 dark:text-gray-500')
                        }
                        title={p}
                      >
                        {p}
                      </button>
                    );
                  })
                ) : (
                  <div className="text-xs text-gray-500 dark:text-gray-400">{t('monitoringNoProviders')}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('monitoringMetricsEntities')}</div>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{metrics.total}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('monitoringMetricsOnline')}</div>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{metrics.online}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('monitoringMetricsWarnings')}</div>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{metrics.warning}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('monitoringMetricsOffline')}</div>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{metrics.offline}</div>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('monitoringMetricsAvgLatency')}</div>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {metrics.avgLatency === null ? '—' : `${Math.round(metrics.avgLatency)} ms`}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black p-4">
              <div className="text-[11px] text-gray-500 dark:text-gray-400">{t('monitoringMetricsTotalBandwidth')}</div>
              <div className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                {metrics.totalBw === null ? '—' : formatMbps(metrics.totalBw)}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr]">
            <aside className="border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-white/10 p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('monitoringNotifications')}</div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{t('monitoringGeoAlerts')}</div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{notifications.length}</div>
              </div>

              <div className="mt-4 space-y-2 max-h-[25vh] overflow-y-auto">
                {notifications.length ? (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => focusEntity(n.entity)}
                      className="w-full text-left rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {n.entity.hostname || n.entity.ip_address || 'Unknown'}
                          </div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                            {n.entity.location?.city ? `${n.entity.location.city}, ` : ''}{formatMaybe(n.entity.location?.country)}
                          </div>
                          <div className="mt-2 text-xs text-gray-700 dark:text-gray-200 truncate">{n.reason}</div>
                        </div>
                        <div
                          className={
                            'rounded-full border px-2.5 py-1 text-[11px] ' +
                            (n.level === 'warning' ? STATUS_META.warning.pill : 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300')
                          }
                        >
                          {n.level}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{t('monitoringNoNotifications')}</div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('monitoringEntities')}</div>
                  <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {selectedEntity
                      ? `${t('monitoringSelected')}: ${selectedEntity.hostname || selectedEntity.ip_address || selectedEntity.id}`
                      : t('monitoringClickToFocus')}
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{filteredEntities.length}</div>
              </div>

              <div className="mt-4 space-y-2 max-h-[45vh] lg:max-h-[340px] overflow-y-auto">
                {(selectedEntity ? [selectedEntity] : filteredEntities)
                  .slice()
                  .sort((a, b) => parseDateMs(b?.last_seen) - parseDateMs(a?.last_seen))
                  .slice(0, 40)
                  .map((e) => (
                    <button
                      key={e.id || `${e.type}-${e.ip_address}`}
                      type="button"
                      onClick={() => focusEntity(e)}
                      className={
                        'w-full text-left rounded-2xl border bg-white dark:bg-black px-4 py-3 transition ' +
                        (String(selectedId) === String(e.id)
                          ? 'border-gray-300 dark:border-white/20'
                          : 'border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5')
                      }
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_META[e.type]?.color || '#9ca3af' }} />
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {e.hostname || e.ip_address || 'Unknown'}
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                            {e.location?.city ? `${e.location.city}, ` : ''}{formatMaybe(e.location?.country)} · {formatMaybe(e.provider)}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <div
                            className={
                              'rounded-full border px-2.5 py-1 text-[11px] ' +
                              (e.status === 'online'
                                ? STATUS_META.online.pill
                                : e.status === 'warning'
                                  ? STATUS_META.warning.pill
                                  : STATUS_META.offline.pill)
                            }
                          >
                            {formatMaybe(e.status)}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">{formatMaybe(e.last_seen)}</div>
                        </div>
                      </div>
                    </button>
                  ))}

                {filteredEntities.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400">No entities match the current filters.</div>
                ) : null}
              </div>

              <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                {t('monitoringClustering')}: {mapZoom < clusterThreshold ? t('monitoringClusteringOn') : t('monitoringClusteringOff')}
              </div>
            </aside>

            <div ref={mapWrapperRef} className="relative">
              <div className="h-[420px] sm:h-[480px] lg:h-[560px] w-full">
                <MapContainer
                  center={mapCenter}
                  zoom={mapZoom}
                  minZoom={1}
                  maxZoom={18}
                  scrollWheelZoom
                  preferCanvas
                  style={{ height: '100%', width: '100%' }}
                  whenCreated={(map) => {
                    map.on('zoomend', () => setMapZoom(map.getZoom()));
                    map.on('moveend', () => {
                      const c = map.getCenter();
                      setMapCenter([c.lat, c.lng]);
                    });
                  }}
                >
                  <MapController center={mapCenter} zoom={mapZoom} />
                  <TileLayer
                    url={tileUrl}
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                  />

                  <Pane name="heat" style={{ zIndex: 250 }}>
                    {heatBuckets.map((b) => (
                      <CircleMarker
                        key={`heat:${b.id}`}
                        center={[b.lat, b.lon]}
                        radius={b.radius}
                        renderer={canvasRenderer}
                        pathOptions={{ color: b.color, weight: 0, fillColor: b.color, fillOpacity: b.opacity }}
                      />
                    ))}
                  </Pane>

                  <Pane name="flows" style={{ zIndex: 320 }}>
                    {flows.map((f) => {
                      const iconKey = `${f.color}:${Math.round(f.bearing)}`;
                      const icon = flowIcons.get(iconKey);
                      return (
                        <span key={`flow:${f.id}`}>
                          <Polyline positions={[f.from, f.to]} renderer={canvasRenderer} pathOptions={{ color: f.color, weight: 2, opacity: 0.35 }} />
                          {icon ? <Marker position={f.to} icon={icon} eventHandlers={{ click: () => focusEntity(f.fromEntity) }} /> : null}
                        </span>
                      );
                    })}
                  </Pane>

                  {clustersOrPoints.map((p) => {
                    if (p.kind === 'cluster') {
                      const color = TYPE_META[p.dominantType]?.color || '#ef4444';
                      return (
                        <CircleMarker
                          key={p.id}
                          center={[p.lat, p.lon]}
                          radius={18}
                          renderer={canvasRenderer}
                          pathOptions={{ color, fillColor: color, fillOpacity: 0.18, weight: 2 }}
                          eventHandlers={{
                            mouseover: (ev) => {
                              setHovered({ kind: 'cluster', cluster: p });
                              const el = mapWrapperRef.current;
                              if (el) {
                                const rect = el.getBoundingClientRect();
                                setTooltip({
                                  x: clamp(ev.originalEvent.clientX - rect.left + 14, 12, rect.width - 12),
                                  y: clamp(ev.originalEvent.clientY - rect.top + 14, 12, rect.height - 12),
                                });
                              }
                            },
                            mouseout: () => setHovered(null),
                            click: () => focusCluster(p),
                          }}
                        />
                      );
                    }

                    const e = p.e;
                    const color = TYPE_META[e.type]?.color || '#ef4444';
                    const offline = (e.status || 'offline') === 'offline';
                    const warning = e.status === 'warning' || e.type === 'anomaly';

                    return (
                      <CircleMarker
                        key={e.id || `${e.type}-${e.ip_address}-${p.lat}-${p.lon}`}
                        center={[p.lat, p.lon]}
                        radius={8}
                        renderer={canvasRenderer}
                        pathOptions={{
                          color,
                          fillColor: color,
                          fillOpacity: offline ? 0.25 : 0.95,
                          weight: String(selectedId) === String(e.id) ? 3 : 1,
                          opacity: warning ? 1 : 0.9,
                        }}
                        eventHandlers={{
                          mouseover: (ev) => {
                            setHovered({ kind: 'entity', entity: e });
                            const el = mapWrapperRef.current;
                            if (el) {
                              const rect = el.getBoundingClientRect();
                              setTooltip({
                                x: clamp(ev.originalEvent.clientX - rect.left + 14, 12, rect.width - 12),
                                y: clamp(ev.originalEvent.clientY - rect.top + 14, 12, rect.height - 12),
                              });
                            }
                          },
                          mouseout: () => setHovered(null),
                          click: () => setSelectedId((cur) => (String(cur) === String(e.id) ? null : e.id)),
                        }}
                      />
                    );
                  })}
                </MapContainer>
              </div>

              {/* Mobile details sheet (hover tooltips don't work well on touch) */}
              <AnimatePresence>
                {selectedEntity ? (
                  <motion.div
                    key="mobile-details"
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 18 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="lg:hidden absolute left-3 right-3 bottom-3 z-30"
                  >
                    <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-black/80 backdrop-blur-xl p-4 shadow-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs text-gray-500 dark:text-gray-400">{t('monitoringDetails')}</div>
                          <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {selectedEntity.hostname || selectedEntity.ip_address || 'Unknown'}
                          </div>
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 truncate">
                            {selectedEntity.location?.city ? `${selectedEntity.location.city}, ` : ''}
                            {formatMaybe(selectedEntity.location?.country)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={
                              'rounded-full border px-2.5 py-1 text-[11px] ' +
                              (selectedEntity.status === 'online'
                                ? STATUS_META.online.pill
                                : selectedEntity.status === 'warning'
                                  ? STATUS_META.warning.pill
                                  : STATUS_META.offline.pill)
                            }
                          >
                            {formatMaybe(selectedEntity.status)}
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedId(null)}
                            className="rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition"
                          >
                            {t('monitoringClose')}
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div className="text-gray-500 dark:text-gray-400">IP</div>
                        <div className="text-gray-900 dark:text-gray-100 truncate">{formatMaybe(selectedEntity.ip_address)}</div>

                        <div className="text-gray-500 dark:text-gray-400">Provider</div>
                        <div className="text-gray-900 dark:text-gray-100 truncate">{formatMaybe(selectedEntity.provider)}</div>

                        <div className="text-gray-500 dark:text-gray-400">Last seen</div>
                        <div className="text-gray-900 dark:text-gray-100 truncate">{formatMaybe(selectedEntity.last_seen)}</div>

                        <div className="text-gray-500 dark:text-gray-400">Latency</div>
                        <div className="text-gray-900 dark:text-gray-100 truncate">{formatMaybe(selectedEntity.latency)}</div>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <AnimatePresence>
                {hovered ? (
                  <MotionDiv
                    key="tooltip"
                    initial={{ opacity: 0, scale: 0.98, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, y: 6 }}
                    transition={{ duration: 0.14, ease: 'easeOut' }}
                    className="hidden lg:block pointer-events-none absolute z-20"
                    style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-2px, -2px)' }}
                  >
                    <div className="w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-black/80 backdrop-blur-xl p-4 shadow-lg">
                      {hovered.kind === 'cluster' ? (
                        <>
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Cluster ({hovered.cluster.count})</div>
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">Click to zoom and focus.</div>
                          <div className="mt-3 text-xs text-gray-700 dark:text-gray-200">
                            {Object.entries(hovered.cluster.typeCounts)
                              .map(([t, n]) => `${TYPE_META[t]?.label || t}: ${n}`)
                              .join(' · ')}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                {hovered.entity.hostname || hovered.entity.ip_address || 'Unknown'}
                              </div>
                              <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 truncate">
                                {hovered.entity.location?.city ? `${hovered.entity.location.city}, ` : ''}
                                {formatMaybe(hovered.entity.location?.country)}
                              </div>
                            </div>
                            <div
                              className={
                                'rounded-full border px-2.5 py-1 text-[11px] ' +
                                (hovered.entity.status === 'online'
                                  ? STATUS_META.online.pill
                                  : hovered.entity.status === 'warning'
                                    ? STATUS_META.warning.pill
                                    : STATUS_META.offline.pill)
                              }
                            >
                              {formatMaybe(hovered.entity.status)}
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                            <div className="text-gray-500 dark:text-gray-400">Type</div>
                            <div className="text-gray-900 dark:text-gray-100">{TYPE_META[hovered.entity.type]?.label || hovered.entity.type}</div>

                            <div className="text-gray-500 dark:text-gray-400">IP</div>
                            <div className="text-gray-900 dark:text-gray-100 truncate">{formatMaybe(hovered.entity.ip_address)}</div>

                            <div className="text-gray-500 dark:text-gray-400">Provider</div>
                            <div className="text-gray-900 dark:text-gray-100 truncate">{formatMaybe(hovered.entity.provider)}</div>

                            <div className="text-gray-500 dark:text-gray-400">Last seen</div>
                            <div className="text-gray-900 dark:text-gray-100 truncate">{formatMaybe(hovered.entity.last_seen)}</div>

                            <div className="text-gray-500 dark:text-gray-400">Latency</div>
                            <div className="text-gray-900 dark:text-gray-100 truncate">{formatMaybe(hovered.entity.latency)}</div>

                            <div className="text-gray-500 dark:text-gray-400">Bandwidth</div>
                            <div className="text-gray-900 dark:text-gray-100 truncate">{formatMaybe(hovered.entity.bandwidth)}</div>

                            <div className="text-gray-500 dark:text-gray-400">Security score</div>
                            <div className="text-gray-900 dark:text-gray-100">{formatMaybe(hovered.entity.security_score)}</div>
                          </div>

                          {Array.isArray(hovered.entity.tags) && hovered.entity.tags.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {hovered.entity.tags.slice(0, 6).map((t) => (
                                <span
                                  key={t}
                                  className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-2.5 py-1 text-[11px] text-gray-700 dark:text-gray-200"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </>
                      )}
                    </div>
                  </MotionDiv>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
