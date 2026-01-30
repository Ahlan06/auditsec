function safeJsonParse(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

export function normalizeHttpxJsonLines(stdoutText) {
  const lines = stdoutText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const results = [];

  for (const line of lines) {
    const obj = safeJsonParse(line);
    if (!obj) continue;

    results.push({
      url: obj.url || obj.input || null,
      input: obj.input || null,
      host: obj.host || null,
      port: typeof obj.port === "number" ? obj.port : null,
      scheme: obj.scheme || null,
      statusCode: typeof obj["status-code"] === "number" ? obj["status-code"] : (typeof obj.status_code === "number" ? obj.status_code : null),
      title: obj.title || null,
      webserver: obj.webserver || null,
      contentType: obj["content-type"] || obj.content_type || null,
      contentLength: typeof obj["content-length"] === "number" ? obj["content-length"] : (typeof obj.content_length === "number" ? obj.content_length : null),
      technologies: Array.isArray(obj.tech) ? obj.tech : (Array.isArray(obj.technologies) ? obj.technologies : []),
      raw: obj,
    });
  }

  return results;
}

export function normalizeNucleiJsonLines(stdoutText) {
  const lines = stdoutText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const findings = [];

  for (const line of lines) {
    const obj = safeJsonParse(line);
    if (!obj) continue;

    const info = obj.info || {};

    findings.push({
      templateId: obj["template-id"] || obj.templateID || obj.template_id || null,
      name: info.name || obj.name || null,
      severity: (info.severity || obj.severity || "unknown")?.toString().toLowerCase(),
      matchedAt: obj["matched-at"] || obj.matched_at || obj.matchedAt || null,
      host: obj.host || null,
      ip: obj.ip || null,
      timestamp: obj.timestamp || null,
      type: obj.type || null,
      tags: Array.isArray(info.tags) ? info.tags : (typeof info.tags === "string" ? info.tags.split(",").map((t) => t.trim()).filter(Boolean) : []),
      description: info.description || null,
      reference: Array.isArray(info.reference) ? info.reference : (typeof info.reference === "string" ? [info.reference] : []),
      raw: obj,
    });
  }

  return findings;
}

export function buildNormalizedScanResult({
  target,
  mode,
  httpx,
  nuclei,
  errors,
  toolMeta,
}) {
  const now = new Date().toISOString();
  return {
    schemaVersion: 1,
    generatedAt: now,
    target,
    mode,
    tools: toolMeta || {},
    httpx: {
      assets: httpx || [],
    },
    nuclei: {
      findings: nuclei || [],
    },
    summary: {
      assetsCount: (httpx || []).length,
      findingsCount: (nuclei || []).length,
      severityCounts: (nuclei || []).reduce(
        (acc, f) => {
          const sev = (f.severity || "unknown").toLowerCase();
          acc[sev] = (acc[sev] || 0) + 1;
          return acc;
        },
        {}
      ),
    },
    errors: errors || [],
  };
}
