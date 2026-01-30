import { Worker } from "bullmq";
import { getRedisConnection, scanQueueName } from "../queues/scanQueue.js";
import { validateAndNormalizeTarget } from "../services/scanEngine/validateTarget.js";
import { runDockerCommand } from "../services/scanEngine/dockerRunner.js";
import {
  normalizeHttpxJsonLines,
  normalizeNucleiJsonLines,
  buildNormalizedScanResult,
} from "../services/scanEngine/normalize.js";
import { analyzeWithAI } from "../services/aiAnalysis.js";
import db from "../client/db.js";

const HTTPX_IMAGE = process.env.HTTPX_IMAGE || "projectdiscovery/httpx:latest";
const NUCLEI_IMAGE = process.env.NUCLEI_IMAGE || "projectdiscovery/nuclei:latest";

const HTTPX_TIMEOUT_MS = Number(process.env.HTTPX_TIMEOUT_MS || 60_000);
const NUCLEI_TIMEOUT_MS = Number(process.env.NUCLEI_TIMEOUT_MS || 180_000);

const DOCKER_CPU = process.env.SCAN_DOCKER_CPU || "1";
const DOCKER_MEM = process.env.SCAN_DOCKER_MEM || "1024m";

function getAuditById(auditId) {
  const stmt = db.prepare("SELECT * FROM audits WHERE id = ?");
  return stmt.get(auditId);
}

function updateAuditRun(auditId, patch) {
  const status = String(patch.status || "").toLowerCase();
  const isTerminal = ["completed", "completed_with_errors", "failed"].includes(status);
  const errorText =
    typeof patch.errorText === "string"
      ? patch.errorText
      : Array.isArray(patch.result?.errors) && patch.result.errors.length
        ? String(patch.result.errors[0]?.message || "")
        : null;

  // Keep schema-compatible columns only.
  // - started_at: set once when execution actually starts
  // - finished_at: set when the run reaches a terminal state
  // - ai_analysis_json: AI-powered AppSec interpretation
  const stmt = db.prepare(
    "UPDATE audits SET status = ?, result_json = ?, error_text = ?, ai_analysis_json = ?, started_at = COALESCE(started_at, strftime('%Y-%m-%dT%H:%M:%SZ','now')), finished_at = CASE WHEN ? THEN strftime('%Y-%m-%dT%H:%M:%SZ','now') ELSE finished_at END WHERE id = ?"
  );

  stmt.run(
    status,
    JSON.stringify(patch.result ?? null),
    errorText,
    patch.aiAnalysis ? JSON.stringify(patch.aiAnalysis) : null,
    isTerminal ? 1 : 0,
    auditId
  );
}

function safeModeFromAudit(audit) {
  const raw = (audit?.mode || audit?.scan_mode || audit?.scanMode || "passive").toString().toLowerCase();
  return raw === "active" ? "active" : "passive";
}

async function runHttpx(normalizedUrl) {
  // NOTE: exact flags vary by version; keep conservative + jsonl.
  const args = [
    "httpx",
    "-u",
    normalizedUrl,
    "-json",
    "-silent",
    "-no-color",
    "-timeout",
    "10",
  ];

  const res = await runDockerCommand({
    image: HTTPX_IMAGE,
    args,
    timeoutMs: HTTPX_TIMEOUT_MS,
    cpu: DOCKER_CPU,
    memory: DOCKER_MEM,
  });

  return res;
}

async function runNuclei(normalizedUrl) {
  // Run with JSONL output. Prefer a limited template set in production.
  const args = [
    "nuclei",
    "-u",
    normalizedUrl,
    "-jsonl",
    "-silent",
    "-no-color",
  ];

  const res = await runDockerCommand({
    image: NUCLEI_IMAGE,
    args,
    timeoutMs: NUCLEI_TIMEOUT_MS,
    cpu: DOCKER_CPU,
    memory: DOCKER_MEM,
  });

  return res;
}

const worker = new Worker(
  scanQueueName,
  async (job) => {
    const { auditId } = job.data || {};
    if (!auditId) throw new Error("scan job missing auditId");

    const audit = getAuditById(auditId);
    if (!audit) throw new Error(`audit not found: ${auditId}`);

    const mode = safeModeFromAudit(audit);

    // Target validation + SSRF defenses
    const target = audit.target || audit.url || audit.hostname;
    const validated = await validateAndNormalizeTarget(target);
    if (!validated.ok) {
      const result = buildNormalizedScanResult({
        target,
        mode,
        httpx: [],
        nuclei: [],
        errors: [{ stage: "validate", message: validated.reason }],
      });
      updateAuditRun(auditId, { status: "failed", result });
      return { ok: false, reason: validated.reason };
    }

    updateAuditRun(auditId, {
      status: "running",
      result: {
        schemaVersion: 1,
        generatedAt: new Date().toISOString(),
        target: validated.normalizedUrl,
        mode,
        status: "running",
      },
    });

    const errors = [];

    // Execute tools in isolated containers.
    const httpxRes = await runHttpx(validated.normalizedUrl);
    if (httpxRes.exitCode !== 0) {
      errors.push({
        stage: "httpx",
        message: "httpx exited non-zero",
        exitCode: httpxRes.exitCode,
        stderr: httpxRes.stderrText.slice(0, 20_000),
      });
    }
    const httpxAssets = normalizeHttpxJsonLines(httpxRes.stdoutText);

    const nucleiRes = await runNuclei(validated.normalizedUrl);
    if (nucleiRes.exitCode !== 0) {
      errors.push({
        stage: "nuclei",
        message: "nuclei exited non-zero",
        exitCode: nucleiRes.exitCode,
        stderr: nucleiRes.stderrText.slice(0, 20_000),
      });
    }
    const nucleiFindings = normalizeNucleiJsonLines(nucleiRes.stdoutText);

    const normalized = buildNormalizedScanResult({
      target: validated.normalizedUrl,
      mode,
      httpx: httpxAssets,
      nuclei: nucleiFindings,
      errors,
      toolMeta: {
        httpx: { image: HTTPX_IMAGE },
        nuclei: { image: NUCLEI_IMAGE },
      },
    });

    // AI-powered AppSec analysis (if AI endpoint configured)
    let aiAnalysis = null;
    const AI_ENDPOINT = process.env.AI_ANALYSIS_ENDPOINT;
    if (AI_ENDPOINT && normalized.summary.findingsCount > 0) {
      try {
        aiAnalysis = await analyzeWithAI(normalized, {
          aiEndpoint: AI_ENDPOINT,
          authToken: process.env.AI_ANALYSIS_TOKEN,
        });
      } catch (aiErr) {
        // eslint-disable-next-line no-console
        console.error("AI analysis failed for audit", auditId, aiErr.message);
      }
    }

    updateAuditRun(auditId, {
      status: errors.length ? "completed_with_errors" : "completed",
      result: normalized,
      aiAnalysis,
    });

    return {
      ok: true,
      assetsCount: normalized.summary.assetsCount,
      findingsCount: normalized.summary.findingsCount,
      errorsCount: normalized.errors.length,
      aiAnalysisGenerated: Boolean(aiAnalysis),
    };
  },
  {
    connection: getRedisConnection(),
    concurrency: Number(process.env.SCAN_WORKER_CONCURRENCY || 1),
  }
);

worker.on("failed", (job, err) => {
  // eslint-disable-next-line no-console
  console.error("scan job failed", { jobId: job?.id, err: err?.message });
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});
