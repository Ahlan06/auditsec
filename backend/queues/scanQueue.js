import { Queue } from "bullmq";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

export const scanQueueName = process.env.SCAN_QUEUE_NAME || "auditsec-scans";

export function getRedisConnection() {
  return {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    // In prod, prefer TLS via REDIS_TLS=1 and a managed Redis endpoint.
    tls: process.env.REDIS_TLS === "1" ? {} : undefined,
  };
}

export function getScanQueue() {
  return new Queue(scanQueueName, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      removeOnComplete: 1000,
      removeOnFail: 2000,
      attempts: 1,
    },
  });
}

export async function enqueueScanJob(data) {
  const queue = getScanQueue();
  const job = await queue.add("scan", data, {
    jobId: data?.auditId ? `audit:${data.auditId}` : undefined,
  });
  return job;
}
