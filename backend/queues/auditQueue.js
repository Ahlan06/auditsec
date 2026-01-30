import { Queue } from 'bullmq';

// Configuration Redis
const REDIS_HOST = process.env.REDIS_HOST || '127.0.0.1';
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

export const auditQueueName = process.env.AUDIT_QUEUE_NAME || 'auditsec-audits';

/**
 * Get Redis connection configuration
 */
export function getRedisConnection() {
  return {
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    // TLS pour production (Redis Cloud, AWS ElastiCache, etc.)
    tls: process.env.REDIS_TLS === '1' ? {} : undefined,
    // Options de reconnexion
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  };
}

/**
 * Get Audit Queue instance
 */
export function getAuditQueue() {
  return new Queue(auditQueueName, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      // Retry configuration
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000, // 2s, puis 4s, puis 8s
      },
      // Cleanup
      removeOnComplete: {
        age: 24 * 3600, // Garder 24h
        count: 1000,
      },
      removeOnFail: {
        age: 7 * 24 * 3600, // Garder 7 jours pour debug
        count: 5000,
      },
    },
  });
}

/**
 * Enqueue an audit job
 * @param {Object} auditData - Audit data
 * @param {string} auditData.auditId - Audit MongoDB ID
 * @param {string} auditData.targetType - Type of target (domain, ip, email)
 * @param {string} auditData.targetValue - Target value
 * @param {string} auditData.userId - User ID
 * @returns {Promise<Job>} BullMQ Job
 */
export async function enqueueAuditJob(auditData) {
  const queue = getAuditQueue();
  
  const jobId = `audit:${auditData.auditId}`;
  
  const job = await queue.add(
    'processAudit',
    {
      auditId: auditData.auditId,
      targetType: auditData.targetType,
      targetValue: auditData.targetValue,
      userId: auditData.userId,
    },
    {
      jobId,
      priority: auditData.priority || 10, // Lower = higher priority
    }
  );
  
  console.log(`[AuditQueue] Job ${job.id} enqueued for audit ${auditData.auditId}`);
  return job;
}

/**
 * Remove a job from the queue
 * @param {string} auditId - Audit MongoDB ID
 * @returns {Promise<void>}
 */
export async function removeAuditJob(auditId) {
  const queue = getAuditQueue();
  const jobId = `audit:${auditId}`;
  
  try {
    const job = await queue.getJob(jobId);
    if (job) {
      await job.remove();
      console.log(`[AuditQueue] Job ${jobId} removed`);
    }
  } catch (error) {
    console.error(`[AuditQueue] Error removing job ${jobId}:`, error);
    throw error;
  }
}

/**
 * Get job status
 * @param {string} auditId - Audit MongoDB ID
 * @returns {Promise<Object|null>}
 */
export async function getAuditJobStatus(auditId) {
  const queue = getAuditQueue();
  const jobId = `audit:${auditId}`;
  
  try {
    const job = await queue.getJob(jobId);
    if (!job) return null;
    
    const state = await job.getState();
    const progress = job.progress;
    
    return {
      id: job.id,
      state,
      progress,
      attemptsMade: job.attemptsMade,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
    };
  } catch (error) {
    console.error(`[AuditQueue] Error getting job status ${jobId}:`, error);
    return null;
  }
}

/**
 * Get queue statistics
 * @returns {Promise<Object>}
 */
export async function getAuditQueueStats() {
  const queue = getAuditQueue();
  
  const [waiting, active, completed, failed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
  ]);
  
  return {
    waiting,
    active,
    completed,
    failed,
    total: waiting + active + completed + failed,
  };
}

export default getAuditQueue;
