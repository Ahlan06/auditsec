import net from 'net';
import { URL } from 'url';

const isLocalhostHostname = (hostname) => {
  const h = String(hostname || '').toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
};

export const normalizeHostnameFromTarget = (target) => {
  if (!target) return null;
  const raw = String(target).trim();
  if (!raw) return null;

  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      return u.hostname || null;
    }

    // domain only
    if (!/^[a-z0-9.-]+$/i.test(raw)) return null;
    return raw;
  } catch {
    return null;
  }
};

export const canBypassVerificationForLocalhost = () => {
  const raw = (process.env.ALLOW_UNVERIFIED_LOCALHOST || '').trim().toLowerCase();
  return raw === 'true';
};

const tcpProbe = ({ host, port, timeoutMs }) => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let done = false;

    const finish = (status, error) => {
      if (done) return;
      done = true;
      try {
        socket.destroy();
      } catch {
        // ignore
      }
      resolve({ port, status, ...(error ? { error: String(error?.message || error) } : {}) });
    };

    socket.setTimeout(timeoutMs);

    socket.once('connect', () => finish('open'));
    socket.once('timeout', () => finish('filtered'));
    socket.once('error', (err) => {
      // Common: ECONNREFUSED means closed.
      if (err && (err.code === 'ECONNREFUSED' || err.code === 'EHOSTUNREACH' || err.code === 'ENETUNREACH')) {
        return finish('closed', err);
      }
      return finish('error', err);
    });

    socket.connect(port, host);
  });
};

export const portScan = async ({ hostname, ports, timeoutMs = 1200, maxConcurrency = 50 }) => {
  const host = String(hostname);
  if (!host) throw new Error('hostname is required');

  const list = (ports || []).map((p) => Number(p)).filter((p) => Number.isInteger(p) && p > 0 && p < 65536);
  if (!list.length) throw new Error('ports list is required');

  // Basic safety limits (avoid accidental massive scans)
  const cappedPorts = list.slice(0, 512);

  const results = [];
  let idx = 0;

  const worker = async () => {
    while (idx < cappedPorts.length) {
      const myIdx = idx++;
      const port = cappedPorts[myIdx];
      // eslint-disable-next-line no-await-in-loop
      const r = await tcpProbe({ host, port, timeoutMs });
      results.push(r);
    }
  };

  const concurrency = Math.max(1, Math.min(Number(maxConcurrency) || 1, 200));
  const workers = Array.from({ length: Math.min(concurrency, cappedPorts.length) }, () => worker());
  await Promise.all(workers);

  results.sort((a, b) => a.port - b.port);
  return {
    hostname: host,
    scannedPorts: cappedPorts.length,
    openPorts: results.filter((r) => r.status === 'open').map((r) => r.port),
    results,
  };
};

export const owaspWebQuickChecks = async ({ baseUrl }) => {
  if (!baseUrl) throw new Error('baseUrl is required');
  const u = new URL(baseUrl);
  if (!u.hostname) throw new Error('Invalid URL');

  const url = u.toString();
  const startedAt = new Date().toISOString();

  // Node 18+ has global fetch. If unavailable, this will throw.
  const res = await fetch(url, { method: 'GET', redirect: 'follow' });
  const headers = {};
  for (const [k, v] of res.headers.entries()) headers[k.toLowerCase()] = v;

  const findings = [];

  const requireHeader = (name, severity, why) => {
    if (!headers[name.toLowerCase()]) {
      findings.push({
        id: `missing-${name.toLowerCase()}`,
        title: `Missing security header: ${name}`,
        severity,
        evidence: `Header ${name} not found`,
        recommendation: why,
      });
    }
  };

  requireHeader('strict-transport-security', 'medium', 'Enable HSTS to enforce HTTPS.');
  requireHeader('content-security-policy', 'medium', 'Add a CSP to reduce XSS impact.');
  requireHeader('x-content-type-options', 'low', 'Set X-Content-Type-Options: nosniff.');
  requireHeader('x-frame-options', 'low', 'Set X-Frame-Options or frame-ancestors via CSP to mitigate clickjacking.');
  requireHeader('referrer-policy', 'low', 'Set a Referrer-Policy to limit referrer leakage.');
  requireHeader('permissions-policy', 'low', 'Set Permissions-Policy to restrict powerful browser features.');

  const setCookie = headers['set-cookie'];
  if (setCookie) {
    const cookies = Array.isArray(setCookie) ? setCookie : String(setCookie).split(',');
    for (const c of cookies.slice(0, 20)) {
      const lower = c.toLowerCase();
      if (!lower.includes('secure')) {
        findings.push({
          id: 'cookie-missing-secure',
          title: 'Cookie missing Secure flag',
          severity: 'low',
          evidence: c.trim(),
          recommendation: 'Add Secure flag to cookies sent over HTTPS.',
        });
        break;
      }
      if (!lower.includes('httponly')) {
        findings.push({
          id: 'cookie-missing-httponly',
          title: 'Cookie missing HttpOnly flag',
          severity: 'low',
          evidence: c.trim(),
          recommendation: 'Add HttpOnly flag for session cookies to reduce XSS risk.',
        });
        break;
      }
    }
  }

  // Lightweight tech disclosure checks
  const server = headers['server'];
  if (server) {
    findings.push({
      id: 'server-header-disclosure',
      title: 'Server header disclosure',
      severity: 'low',
      evidence: server,
      recommendation: 'Consider minimizing version disclosure in Server header.',
    });
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    url,
    httpStatus: res.status,
    findings,
  };
};

export const isLocalhost = (hostname) => isLocalhostHostname(hostname);
