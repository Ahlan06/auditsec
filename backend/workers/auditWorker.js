import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import { getRedisConnection, auditQueueName } from '../queues/auditQueue.js';

// Lazy-load models to avoid circular dependencies
let Audit, Report;

async function loadModels() {
  if (!Audit || !Report) {
    const auditModule = await import('../models/Audit.js');
    const reportModule = await import('../models/Report.js');
    Audit = auditModule.default;
    Report = reportModule.default;
  }
  return { Audit, Report };
}

/**
 * Simuler un scan de sécurité avec progression
 */
async function simulateSecurityScan(job) {
  const { targetType, targetValue } = job.data;
  
  const steps = [
    { name: 'DNS Resolution', duration: 1000, progress: 10 },
    { name: 'Port Scanning', duration: 2000, progress: 30 },
    { name: 'Service Detection', duration: 1500, progress: 50 },
    { name: 'Vulnerability Analysis', duration: 2500, progress: 75 },
    { name: 'Report Generation', duration: 1000, progress: 95 },
  ];
  
  const findings = [];
  let currentProgress = 0;
  
  for (const step of steps) {
    console.log(`[AuditWorker] ${job.id} - ${step.name} (${step.progress}%)`);
    
    // Mettre à jour la progression dans BullMQ
    await job.updateProgress(step.progress);
    currentProgress = step.progress;
    
    // Simuler le traitement
    await new Promise(resolve => setTimeout(resolve, step.duration));
    
    // Générer des findings aléatoires
    if (Math.random() > 0.3) {
      findings.push({
        type: step.name.toLowerCase().replace(' ', '_'),
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)],
        description: `Finding detected during ${step.name}`,
        targetType,
        targetValue,
        timestamp: new Date(),
      });
    }
  }
  
  await job.updateProgress(100);
  
  return {
    findings,
    statistics: {
      totalFindings: findings.length,
      criticalFindings: findings.filter(f => f.severity === 'critical').length,
      highFindings: findings.filter(f => f.severity === 'high').length,
      mediumFindings: findings.filter(f => f.severity === 'medium').length,
      lowFindings: findings.filter(f => f.severity === 'low').length,
    },
    scanDuration: steps.reduce((acc, s) => acc + s.duration, 0),
    completedAt: new Date(),
  };
}

/**
 * Process audit job
 */
async function processAuditJob(job) {
  const { auditId, targetType, targetValue, userId } = job.data;
  
  console.log(`[AuditWorker] Starting job ${job.id} for audit ${auditId}`);
  console.log(`[AuditWorker] Target: ${targetType} - ${targetValue}`);
  
  const { Audit, Report } = await loadModels();
  
  // 1. Marquer l'audit comme "running"
  const audit = await Audit.findById(auditId);
  if (!audit) {
    throw new Error(`Audit ${auditId} not found`);
  }
  
  if (audit.status === 'cancelled') {
    console.log(`[AuditWorker] Audit ${auditId} was cancelled, skipping`);
    return { status: 'cancelled' };
  }
  
  await audit.start();
  console.log(`[AuditWorker] Audit ${auditId} status set to running`);
  
  try {
    // 2. Exécuter le scan avec progression
    const scanResults = await simulateSecurityScan(job);
    
    // 3. Mettre à jour l'audit avec les résultats
    audit.results = {
      findings: scanResults.findings,
      statistics: scanResults.statistics,
      metadata: {
        targetType,
        targetValue,
        scanDuration: scanResults.scanDuration,
        completedAt: scanResults.completedAt,
      },
    };
    
    // 4. Marquer l'audit comme "completed"
    await audit.complete();
    console.log(`[AuditWorker] Audit ${auditId} completed successfully`);
    
    // 5. Créer un rapport JSON
    const reportData = {
      auditId: audit._id,
      userId: audit.userId,
      type: 'json',
      status: 'generated',
      data: {
        auditId: audit._id.toString(),
        targetType: audit.targetType,
        targetValue: audit.targetValue,
        status: audit.status,
        findings: scanResults.findings,
        statistics: scanResults.statistics,
        startedAt: audit.startedAt,
        finishedAt: audit.finishedAt,
        duration: audit.duration,
        generatedAt: new Date(),
      },
      s3Path: null, // TODO: Upload to S3 if needed
      hash: null,   // TODO: Generate hash for integrity
    };
    
    const report = new Report(reportData);
    
    // Générer un token de téléchargement
    const downloadToken = await report.createDownloadToken();
    
    await report.save();
    
    console.log(`[AuditWorker] Report created with ID ${report._id}`);
    console.log(`[AuditWorker] Download token: ${downloadToken.token}`);
    
    return {
      status: 'success',
      auditId: audit._id.toString(),
      reportId: report._id.toString(),
      downloadToken: downloadToken.token,
      findings: scanResults.findings.length,
      statistics: scanResults.statistics,
    };
  } catch (error) {
    // En cas d'erreur, marquer l'audit comme "failed"
    console.error(`[AuditWorker] Error processing audit ${auditId}:`, error);
    
    await audit.fail(error.message);
    
    throw error; // Re-throw pour que BullMQ gère le retry
  }
}

/**
 * Create and start the audit worker
 */
export function createAuditWorker() {
  const worker = new Worker(
    auditQueueName,
    async (job) => {
      return await processAuditJob(job);
    },
    {
      connection: getRedisConnection(),
      concurrency: Number(process.env.AUDIT_WORKER_CONCURRENCY || 5),
      limiter: {
        max: 10,      // Max 10 jobs
        duration: 1000, // per second
      },
    }
  );
  
  // Event handlers
  worker.on('completed', (job, result) => {
    console.log(`[AuditWorker] ✅ Job ${job.id} completed:`, result);
  });
  
  worker.on('failed', (job, error) => {
    console.error(`[AuditWorker] ❌ Job ${job?.id} failed:`, error.message);
    
    if (job?.attemptsMade >= job?.opts?.attempts) {
      console.error(`[AuditWorker] Job ${job.id} exceeded max retry attempts`);
    }
  });
  
  worker.on('error', (error) => {
    console.error('[AuditWorker] Worker error:', error);
  });
  
  worker.on('stalled', (jobId) => {
    console.warn(`[AuditWorker] ⚠️  Job ${jobId} stalled`);
  });
  
  worker.on('progress', (job, progress) => {
    console.log(`[AuditWorker] Job ${job.id} progress: ${progress}%`);
  });
  
  console.log(`[AuditWorker] Worker started with concurrency ${worker.opts.concurrency}`);
  
  return worker;
}

/**
 * Graceful shutdown
 */
export async function shutdownWorker(worker) {
  console.log('[AuditWorker] Shutting down worker...');
  await worker.close();
  console.log('[AuditWorker] Worker closed');
}

// Auto-start worker if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('[AuditWorker] Starting standalone audit worker...');
  
  // Connect to MongoDB first
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/auditsec';
  
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log('[AuditWorker] Connected to MongoDB');
      
      const worker = createAuditWorker();
      
      // Graceful shutdown
      process.on('SIGTERM', async () => {
        await shutdownWorker(worker);
        await mongoose.disconnect();
        process.exit(0);
      });
      
      process.on('SIGINT', async () => {
        await shutdownWorker(worker);
        await mongoose.disconnect();
        process.exit(0);
      });
    })
    .catch((error) => {
      console.error('[AuditWorker] MongoDB connection error:', error);
      process.exit(1);
    });
}

export default createAuditWorker;
