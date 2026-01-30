import MonitoringLeafletMap from '../components/monitoring/MonitoringLeafletMap';

const demoEntities = [
  {
    id: 'srv-par-01',
    type: 'server',
    ip_address: '51.158.23.10',
    hostname: 'server-prod-01',
    location: { city: 'Paris', country: 'France', coordinates: [48.8566, 2.3522] },
    status: 'online',
    provider: 'OVH',
    last_seen: '2025-12-23 14:30:00',
    bandwidth: '1.2 Gbps',
    latency: '24ms',
    security_score: 85,
    tags: ['production', 'encrypted', 'monitored'],
  },
  {
    id: 'srv-nyc-01',
    type: 'server',
    ip_address: '34.231.11.8',
    hostname: 'api-edge-us-east',
    location: { city: 'New York', country: 'United States', coordinates: [40.7128, -74.006] },
    status: 'warning',
    provider: 'AWS',
    last_seen: '2025-12-23 14:28:10',
    bandwidth: '850 Mbps',
    latency: '38ms',
    security_score: 71,
    tags: ['edge', 'waf', 'monitored'],
  },
  {
    id: 'dev-lan-01',
    type: 'device',
    ip_address: '192.168.1.10',
    hostname: 'workstation-01',
    location: { city: 'Lyon', country: 'France', coordinates: [45.764, 4.8357] },
    status: 'online',
    provider: 'Local',
    last_seen: '2025-12-23 14:30:44',
    bandwidth: '1 Gbps',
    latency: '2ms',
    security_score: 92,
    tags: ['lan', 'edr', 'monitored'],
  },
  {
    id: 'iot-cam-01',
    type: 'iot',
    ip_address: '192.168.1.55',
    hostname: 'camera-entrance',
    location: { city: 'Lyon', country: 'France', coordinates: [45.764, 4.84] },
    status: 'offline',
    provider: 'Local',
    last_seen: '2025-12-23 11:02:00',
    bandwidth: '—',
    latency: '—',
    security_score: 54,
    tags: ['iot', 'camera', 'isolated'],
  },
  {
    id: 'anom-01',
    type: 'anomaly',
    ip_address: '203.0.113.77',
    hostname: 'suspicious-actor',
    location: { city: 'Moscow', country: 'Russia', coordinates: [55.7558, 37.6173] },
    status: 'warning',
    provider: 'Unknown',
    last_seen: '2025-12-23 14:29:31',
    bandwidth: '—',
    latency: '—',
    security_score: 22,
    tags: ['bruteforce', 'geo-anomaly'],
  },
  {
    id: 'vpn-ams-01',
    type: 'vpn',
    ip_address: '145.40.12.9',
    hostname: 'vpn-exit-ams',
    location: { city: 'Amsterdam', country: 'Netherlands', coordinates: [52.3676, 4.9041] },
    status: 'online',
    provider: 'AuditSec VPN',
    last_seen: '2025-12-23 14:30:50',
    bandwidth: '2.4 Gbps',
    latency: '18ms',
    security_score: 96,
    tags: ['vpn', 'exit', 'encrypted'],
  },
  {
    id: 'vpn-sin-01',
    type: 'vpn',
    ip_address: '198.51.100.18',
    hostname: 'vpn-exit-sin',
    location: { city: 'Singapore', country: 'Singapore', coordinates: [1.3521, 103.8198] },
    status: 'online',
    provider: 'AuditSec VPN',
    last_seen: '2025-12-23 14:30:12',
    bandwidth: '1.8 Gbps',
    latency: '66ms',
    security_score: 94,
    tags: ['vpn', 'exit', 'monitored'],
  },
  {
    id: 'srv-sfo-01',
    type: 'server',
    ip_address: '35.212.90.5',
    hostname: 'gke-cluster-01',
    location: { city: 'San Francisco', country: 'United States', coordinates: [37.7749, -122.4194] },
    status: 'online',
    provider: 'Google Cloud',
    last_seen: '2025-12-23 14:29:58',
    bandwidth: '3.2 Gbps',
    latency: '44ms',
    security_score: 88,
    tags: ['k8s', 'prod', 'monitored'],
  },
];

export default function ClientMonitoringPage() {
  return (
    <div className="space-y-4">
      <h1 className="section-title">Monitoring</h1>
      <div className="apple-card p-6">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Monitor your assets and security indicators.
        </p>
      </div>

      <MonitoringLeafletMap
        initialEntities={demoEntities}
        apiUrl={import.meta.env.VITE_MONITORING_API_URL}
        wsUrl={import.meta.env.VITE_MONITORING_WS_URL}
      />
    </div>
  );
}
