import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ComposableMap, Geography, Geographies, Marker, ZoomableGroup } from 'react-simple-maps';

const WORLD_TOPOJSON_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const TYPE_META = {
  server: { label: 'Servers', dot: 'bg-red-500', ring: 'ring-red-500/30', text: 'text-red-600 dark:text-red-300' },
  device: { label: 'Local devices', dot: 'bg-blue-500', ring: 'ring-blue-500/30', text: 'text-blue-600 dark:text-blue-300' },
  iot: { label: 'IoT', dot: 'bg-green-500', ring: 'ring-green-500/30', text: 'text-green-600 dark:text-green-300' },
  anomaly: { label: 'Anomalies', dot: 'bg-yellow-400', ring: 'ring-yellow-400/30', text: 'text-yellow-600 dark:text-yellow-300' },
  vpn: { label: 'VPN nodes', dot: 'bg-purple-500', ring: 'ring-purple-500/30', text: 'text-purple-600 dark:text-purple-300' },
};

const STATUS_META = {
  online: { label: 'Online', pill: 'border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300' },
  offline: { label: 'Offline', pill: 'border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300' },
  warning: { label: 'Warning', pill: 'border-yellow-400/30 bg-yellow-400/10 text-yellow-800 dark:text-yellow-300' },
};

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function formatMaybe(value) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
}

function normalize(s) {
  if (s === null || s === undefined) return '';
  return String(s).toLowerCase();
}

function parseDateMs(s) {
  if (!s) return 0;
  const t = Date.parse(s);
  return Number.isFinite(t) ? t : 0;
}

export default function MonitoringWorldMap({ entities }) {
  const exportRef = useRef(null);
  const mapContainerRef = useRef(null);
  const [activeTypes, setActiveTypes] = useState(() => new Set(Object.keys(TYPE_META)));
  const [activeStatuses, setActiveStatuses] = useState(() => new Set(Object.keys(STATUS_META)));
  const [activeProviders, setActiveProviders] = useState(() => new Set());
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0 });
  const [mapCenter, setMapCenter] = useState([0, 20]);
  const [mapZoom, setMapZoom] = useState(1);
  const [exporting, setExporting] = useState(null); // 'png' | 'pdf' | 'json' | null

  const safeEntities = useMemo(() => (Array.isArray(entities) ? entities : []), [entities]);
  const MotionDiv = motion.div;

  const providers = useMemo(() => {
    const set = new Set();
    for (const e of safeEntities) {
      if (e?.provider) set.add(String(e.provider));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [safeEntities]);

  useEffect(() => {
    setActiveProviders((prev) => {
      if (prev && prev.size) return prev;
      return new Set(providers);
    });
  }, [providers]);

  const filteredEntities = useMemo(() => {
    const q = normalize(search).trim();
    return safeEntities.filter((e) => {
      if (!e) return false;
      if (!activeTypes.has(e.type)) return false;
      const status = e.status || 'offline';
      if (!activeStatuses.has(status)) return false;

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
  }, [safeEntities, activeTypes, activeStatuses, activeProviders, search]);

  const counts = useMemo(() => {
    const c = { server: 0, device: 0, iot: 0, anomaly: 0, vpn: 0 };
    for (const e of filteredEntities) {
      if (c[e.type] !== undefined) c[e.type] += 1;
    }
    return c;
  }, [filteredEntities]);

  const selectedEntity = useMemo(() => {
    if (!selectedId) return null;
    return safeEntities.find((e) => String(e.id) === String(selectedId)) || null;
  }, [safeEntities, selectedId]);

  useEffect(() => {
    const onMove = (ev) => {
      if (!hovered) return;
      const el = mapContainerRef.current;
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

  const toggleType = (t) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const toggleStatus = (s) => {
    setActiveStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  const toggleProvider = (p) => {
    setActiveProviders((prev) => {
      const next = new Set(prev);
      if (next.has(p)) next.delete(p);
      else next.add(p);
      return next;
    });
  };

  const setOnlyType = (t) => {
    setActiveTypes(new Set([t]));
  };

  const setOnlyStatus = (s) => setActiveStatuses(new Set([s]));

  const resetFilters = () => {
    setActiveTypes(new Set(Object.keys(TYPE_META)));
    setActiveStatuses(new Set(Object.keys(STATUS_META)));
    setActiveProviders(new Set(providers));
    setSearch('');
    setSelectedId(null);
  };

  const clusterThreshold = 1.8;
  const clustersOrPoints = useMemo(() => {
    const clusterEnabled = mapZoom < clusterThreshold;
    const base = [];

    const points = filteredEntities
      .map((e) => {
        const [lat, lon] = e?.location?.coordinates || [];
        if (typeof lat !== 'number' || typeof lon !== 'number') return null;
        return { e, lat, lon };
      })
      .filter(Boolean);

    if (!clusterEnabled) {
      for (const p of points) base.push({ kind: 'entity', ...p });
      return base;
    }

    const cell = 10 / mapZoom;
    const byCell = new Map();

    for (const p of points) {
      const key = `${Math.floor(p.lat / cell)}:${Math.floor(p.lon / cell)}`;
      if (!byCell.has(key)) {
        byCell.set(key, { items: [], sumLat: 0, sumLon: 0 });
      }
      const bucket = byCell.get(key);
      bucket.items.push(p);
      bucket.sumLat += p.lat;
      bucket.sumLon += p.lon;
    }

    for (const [key, bucket] of byCell.entries()) {
      if (bucket.items.length <= 1) {
        const only = bucket.items[0];
        base.push({ kind: 'entity', ...only });
        continue;
      }

      const lat = bucket.sumLat / bucket.items.length;
      const lon = bucket.sumLon / bucket.items.length;
      const typeCounts = bucket.items.reduce((acc, it) => {
        acc[it.e.type] = (acc[it.e.type] || 0) + 1;
        return acc;
      }, {});
      const dominantType = Object.keys(typeCounts).sort((a, b) => (typeCounts[b] || 0) - (typeCounts[a] || 0))[0] || 'server';

      base.push({
        kind: 'cluster',
        id: `cluster:${key}`,
        lat,
        lon,
        count: bucket.items.length,
        dominantType,
        typeCounts,
        items: bucket.items.map((it) => it.e),
      });
    }

    return base;
  }, [filteredEntities, mapZoom]);

  const focusCluster = (cluster) => {
    setHovered(null);
    setSelectedId(null);
    setMapCenter([cluster.lon, cluster.lat]);
    setMapZoom((z) => clamp(z + 1.25, 1, 4));
  };

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
      const isDark = document.documentElement.classList.contains('dark');
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
      const isDark = document.documentElement.classList.contains('dark');
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
      const imgW = pageW - margin * 2;
      const imgH = pageH - margin * 2;

      doc.addImage(dataUrl, 'PNG', margin, margin, imgW, imgH);
      doc.save('auditsec-monitoring-map.pdf');
    } finally {
      setExporting(null);
    }
  };

  return (
    <div ref={exportRef} className="apple-card p-0 overflow-hidden">
      <div className="flex flex-col gap-0">
        <div className="flex items-start justify-between gap-4 p-6">
          <div>
            <h2 className="card-title">Global monitoring map</h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              Visualize monitored entities worldwide. Hover a point to inspect details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-200">
              Zoom: {mapZoom.toFixed(1)}×
            </div>
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
              title="Export filtered entities as JSON"
            >
              {exporting === 'json' ? 'Exporting…' : 'Export JSON'}
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
              title="Export map as PNG"
            >
              {exporting === 'png' ? 'Exporting…' : 'Export PNG'}
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
              title="Export map as PDF"
            >
              {exporting === 'pdf' ? 'Exporting…' : 'Export PDF'}
            </button>
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-1.5 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition"
            >
              Reset filters
            </button>
          </div>
        </div>

        {/* Search + filters */}
        <div className="px-6 pb-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by IP, hostname, provider, city, country, tags…"
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-gray-300 dark:focus:border-white/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full border border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-3 py-2 text-xs text-gray-700 dark:text-gray-200">
                  Showing: {filteredEntities.length}
                </div>
                {selectedEntity ? (
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    className="rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-3 py-2 text-xs text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition"
                    title="Clear selection"
                  >
                    Clear selection
                  </button>
                ) : null}
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Type</div>
              <div className="flex flex-wrap gap-2">
            {Object.entries(TYPE_META).map(([type, meta]) => {
              const enabled = activeTypes.has(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  onDoubleClick={() => setOnlyType(type)}
                  className={
                    'group inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ' +
                    (enabled
                      ? 'border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-gray-100'
                      : 'border-gray-200/70 dark:border-white/10 bg-gray-50 dark:bg-black/40 text-gray-500 dark:text-gray-500')
                  }
                  title="Click to toggle. Double-click to isolate."
                >
                  <span className={'h-2.5 w-2.5 rounded-full ' + meta.dot + (enabled ? '' : ' opacity-40')} />
                  <span>{meta.label}</span>
                  <span className="ml-1 rounded-full border border-gray-200 dark:border-white/10 px-2 py-0.5 text-[10px] text-gray-600 dark:text-gray-300">
                    {counts[type] ?? 0}
                  </span>
                </button>
              );
            })}
              </div>
              <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                Tip: double-click a legend item to filter exclusively.
              </div>
            </div>

            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Status</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(STATUS_META).map(([status, meta]) => {
                  const enabled = activeStatuses.has(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleStatus(status)}
                      onDoubleClick={() => setOnlyStatus(status)}
                      className={
                        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition ' +
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
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Provider</div>
              <div className="flex flex-wrap gap-2">
                {providers.length ? (
                  providers.slice(0, 10).map((p) => {
                    const enabled = activeProviders.has(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleProvider(p)}
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
                  <div className="text-xs text-gray-500 dark:text-gray-400">No providers found.</div>
                )}
              </div>
              {providers.length > 10 ? (
                <div className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                  Showing first 10 providers. (Easy to extend to a dropdown if you want.)
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Map */}
        <div ref={mapContainerRef} className="relative">
          <div className="h-[520px] w-full bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-black">
            <ComposableMap
              projectionConfig={{ scale: 160 }}
              className="h-full w-full"
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup
                zoom={mapZoom}
                center={mapCenter}
                minZoom={1}
                maxZoom={4}
                onMoveEnd={(pos) => {
                  setMapZoom(pos.zoom);
                  if (Array.isArray(pos.coordinates) && pos.coordinates.length === 2) {
                    setMapCenter(pos.coordinates);
                  }
                }}
              >
                <Geographies geography={WORLD_TOPOJSON_URL}>
                  {({ geographies }) =>
                    geographies.map((geo) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="currentColor"
                        stroke="currentColor"
                        className="text-gray-200 dark:text-white/10"
                        style={{
                          default: { outline: 'none' },
                          hover: { outline: 'none' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    ))
                  }
                </Geographies>

                {clustersOrPoints.map((p) => {
                  if (p.kind === 'cluster') {
                    const meta = TYPE_META[p.dominantType] || TYPE_META.server;
                    return (
                      <Marker
                        key={p.id}
                        coordinates={[p.lon, p.lat]}
                        onMouseEnter={(ev) => {
                          setHovered({ kind: 'cluster', cluster: p });
                          const el = mapContainerRef.current;
                          if (el) {
                            const rect = el.getBoundingClientRect();
                            setTooltip({
                              x: clamp(ev.clientX - rect.left + 14, 12, rect.width - 12),
                              y: clamp(ev.clientY - rect.top + 14, 12, rect.height - 12),
                            });
                          }
                        }}
                        onMouseLeave={() => setHovered(null)}
                        onClick={() => focusCluster(p)}
                      >
                        <g style={{ cursor: 'pointer' }}>
                          <circle r={14} className={'fill-current ' + meta.text.replace('text-', 'text-')} />
                          <circle r={18} className={'fill-current ' + meta.text.replace('text-', 'text-')} style={{ opacity: 0.15 }} />
                          <circle r={14} className="text-gray-900" fill="transparent" />
                          <text
                            textAnchor="middle"
                            y={4}
                            style={{ fontSize: 10, fontWeight: 700 }}
                            className="fill-gray-900 dark:fill-gray-100"
                          >
                            {p.count}
                          </text>
                        </g>
                      </Marker>
                    );
                  }

                  const e = p.e;
                  const isOffline = e.status === 'offline';
                  const isWarning = e.status === 'warning' || e.type === 'anomaly';

                  const baseDot = isOffline ? 'opacity-35' : '';
                  const pulse = isWarning ? 'animate-ping' : '';

                  return (
                    <Marker
                      key={e.id || `${e.type}-${e.ip_address}-${p.lat}-${p.lon}`}
                      coordinates={[p.lon, p.lat]}
                      onMouseEnter={(ev) => {
                        setHovered({ kind: 'entity', entity: e });
                        const el = mapContainerRef.current;
                        if (el) {
                          const rect = el.getBoundingClientRect();
                          setTooltip({
                            x: clamp(ev.clientX - rect.left + 14, 12, rect.width - 12),
                            y: clamp(ev.clientY - rect.top + 14, 12, rect.height - 12),
                          });
                        }
                      }}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => setSelectedId((cur) => (String(cur) === String(e.id) ? null : e.id))}
                    >
                      <g style={{ cursor: 'pointer' }}>
                        <circle
                          r={7}
                          className={
                            'fill-current ' +
                            (e.type === 'server'
                              ? 'text-red-500'
                              : e.type === 'device'
                                ? 'text-blue-500'
                                : e.type === 'iot'
                                  ? 'text-green-500'
                                  : e.type === 'anomaly'
                                    ? 'text-yellow-400'
                                    : 'text-purple-500')
                          }
                          style={{ opacity: isOffline ? 0.35 : 0.95 }}
                        />
                        <circle
                          r={14}
                          className={
                            (e.type === 'server'
                              ? 'text-red-500/30'
                              : e.type === 'device'
                                ? 'text-blue-500/30'
                                : e.type === 'iot'
                                  ? 'text-green-500/30'
                                  : e.type === 'anomaly'
                                    ? 'text-yellow-400/30'
                                    : 'text-purple-500/30') +
                            ' fill-current ' +
                            pulse
                          }
                          style={{ opacity: isWarning ? 1 : 0 }}
                        />
                        <circle r={18} className={baseDot} fill="transparent" />

                        {String(selectedId) === String(e.id) ? (
                          <circle r={11} className="stroke-white/80 dark:stroke-white/60" fill="transparent" strokeWidth={2} />
                        ) : null}
                      </g>
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* Tooltip */}
          <AnimatePresence>
            {hovered ? (
              <MotionDiv
                key="tooltip"
                initial={{ opacity: 0, scale: 0.98, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 6 }}
                transition={{ duration: 0.14, ease: 'easeOut' }}
                className="pointer-events-none absolute z-20"
                style={{ left: tooltip.x, top: tooltip.y, transform: 'translate(-2px, -2px)' }}
              >
                <div className="w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-black/80 backdrop-blur-xl p-4 shadow-lg">
                  {hovered.kind === 'cluster' ? (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={'h-2.5 w-2.5 rounded-full ' + (TYPE_META[hovered.cluster.dominantType]?.dot || 'bg-gray-400')} />
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              Cluster ({hovered.cluster.count})
                            </div>
                          </div>
                          <div className="mt-1 text-xs text-gray-600 dark:text-gray-300">
                            Click to zoom and focus.
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                        <div className="text-gray-500 dark:text-gray-400">Breakdown</div>
                        <div className="text-gray-900 dark:text-gray-100">
                          {Object.entries(hovered.cluster.typeCounts)
                            .map(([t, n]) => `${TYPE_META[t]?.label || t}: ${n}`)
                            .join(' · ')}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={'h-2.5 w-2.5 rounded-full ' + (TYPE_META[hovered.entity.type]?.dot || 'bg-gray-400')} />
                            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {hovered.entity.hostname || hovered.entity.ip_address || 'Unknown'}
                            </div>
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
                        <div className="text-gray-900 dark:text-gray-100">
                          {TYPE_META[hovered.entity.type]?.label || hovered.entity.type}
                        </div>

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

        {/* Timeline */}
        <div className="border-t border-gray-200 dark:border-white/10 p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Timeline</div>
              <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                {selectedEntity
                  ? `Showing recent activity for ${selectedEntity.hostname || selectedEntity.ip_address || selectedEntity.id}`
                  : 'Showing recent activity for the current filters'}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Clustering: {mapZoom < clusterThreshold ? 'On (zoom in to expand)' : 'Off'}
            </div>
          </div>

          <div className="mt-4 space-y-2 max-h-[240px] overflow-y-auto">
            {(selectedEntity ? [selectedEntity] : filteredEntities)
              .slice()
              .sort((a, b) => parseDateMs(b?.last_seen) - parseDateMs(a?.last_seen))
              .slice(0, 20)
              .map((e) => (
                <button
                  key={e.id || `${e.type}-${e.ip_address}`}
                  type="button"
                  onClick={() => setSelectedId(e.id)}
                  className="w-full text-left rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={'h-2.5 w-2.5 rounded-full ' + (TYPE_META[e.type]?.dot || 'bg-gray-400')} />
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
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {formatMaybe(e.last_seen)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}

            {filteredEntities.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No entities match the current filters.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
