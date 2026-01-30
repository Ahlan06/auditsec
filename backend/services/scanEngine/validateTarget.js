import dns from "node:dns/promises";

function isIPv4(ip) {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(ip);
}

function ipv4ToInt(ip) {
  const parts = ip.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return null;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function inCidrV4(ip, cidr) {
  const [base, bitsStr] = cidr.split("/");
  const bits = Number(bitsStr);
  const ipInt = ipv4ToInt(ip);
  const baseInt = ipv4ToInt(base);
  if (ipInt == null || baseInt == null || Number.isNaN(bits)) return false;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return (ipInt & mask) === (baseInt & mask);
}

function isPrivateIPv4(ip) {
  const blocked = [
    "0.0.0.0/8",
    "10.0.0.0/8",
    "100.64.0.0/10",
    "127.0.0.0/8",
    "169.254.0.0/16",
    "172.16.0.0/12",
    "192.0.0.0/24",
    "192.0.2.0/24",
    "192.168.0.0/16",
    "198.18.0.0/15",
    "198.51.100.0/24",
    "203.0.113.0/24",
    "224.0.0.0/4",
    "240.0.0.0/4",
  ];
  return blocked.some((cidr) => inCidrV4(ip, cidr));
}

function isPrivateIPv6(ip) {
  const v = ip.toLowerCase();
  // Loopback
  if (v === "::1") return true;
  // Link-local fe80::/10
  if (v.startsWith("fe8") || v.startsWith("fe9") || v.startsWith("fea") || v.startsWith("feb")) return true;
  // Unique local fc00::/7 (fcxx, fdxx)
  if (v.startsWith("fc") || v.startsWith("fd")) return true;
  // Unspecified
  if (v === "::") return true;
  return false;
}

function stripPort(hostname) {
  const idx = hostname.lastIndexOf(":");
  if (idx > -1 && hostname.indexOf(":") === idx) {
    // likely host:port for ipv4/hostname (not ipv6)
    const maybePort = hostname.slice(idx + 1);
    if (/^\d+$/.test(maybePort)) return hostname.slice(0, idx);
  }
  return hostname;
}

export async function validateAndNormalizeTarget(inputTarget) {
  if (typeof inputTarget !== "string") {
    return { ok: false, reason: "target must be a string" };
  }

  const raw = inputTarget.trim();
  if (!raw) return { ok: false, reason: "target is empty" };
  if (raw.length > 2048) return { ok: false, reason: "target too long" };

  // Accept either URL or hostname. Default to https if no scheme.
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw) ? raw : `https://${raw}`;

  let url;
  try {
    url = new URL(withScheme);
  } catch {
    return { ok: false, reason: "invalid URL/hostname" };
  }

  if (!url.hostname) return { ok: false, reason: "missing hostname" };

  const protocol = url.protocol.toLowerCase();
  if (protocol !== "http:" && protocol !== "https:") {
    return { ok: false, reason: "only http/https targets are allowed" };
  }

  const hostname = stripPort(url.hostname.trim().toLowerCase());
  if (hostname === "localhost" || hostname.endsWith(".local")) {
    return { ok: false, reason: "localhost targets are not allowed" };
  }

  // Block obvious injection / unsafe characters in hostname.
  if (!/^[a-z0-9.-]+$/.test(hostname) && !hostname.includes(":") /* ipv6 */) {
    return { ok: false, reason: "hostname contains invalid characters" };
  }

  // DNS resolve and block private IP ranges (SSRF defense).
  try {
    const results = await dns.lookup(hostname, { all: true, verbatim: true });
    if (!results || results.length === 0) {
      return { ok: false, reason: "hostname did not resolve" };
    }

    for (const r of results) {
      const addr = r.address;
      if (isIPv4(addr)) {
        if (isPrivateIPv4(addr)) return { ok: false, reason: "target resolves to a private IPv4 address" };
      } else {
        if (isPrivateIPv6(addr)) return { ok: false, reason: "target resolves to a private IPv6 address" };
      }
    }
  } catch {
    return { ok: false, reason: "DNS resolution failed" };
  }

  // Normalize: keep scheme + hostname + optional path (no creds).
  url.username = "";
  url.password = "";

  return {
    ok: true,
    normalizedUrl: url.toString(),
    hostname,
    scheme: protocol.replace(":", ""),
  };
}
