import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

/**
 * Configuration du client S3
 */
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Support pour endpoints custom (Cloudflare R2, MinIO, etc.)
if (process.env.AWS_ENDPOINT_URL) {
  s3Config.endpoint = process.env.AWS_ENDPOINT_URL;
  s3Config.forcePathStyle = true; // Required pour certains providers S3-compatible
}

const s3Client = new S3Client(s3Config);

/**
 * Nom du bucket depuis les variables d'environnement
 */
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'auditsec-reports';

/**
 * Générer une clé S3 unique pour un fichier
 * @param {string} userId - ID de l'utilisateur
 * @param {string} auditId - ID de l'audit
 * @param {string} fileType - Type de fichier (pdf, json, etc.)
 * @returns {string} Clé S3 unique
 */
export function generateS3Key(userId, auditId, fileType = 'pdf') {
  const timestamp = Date.now();
  const randomHash = crypto.randomBytes(8).toString('hex');
  const extension = fileType.startsWith('.') ? fileType : `.${fileType}`;
  
  // Format: reports/{userId}/{auditId}/{timestamp}-{hash}.pdf
  return `reports/${userId}/${auditId}/${timestamp}-${randomHash}${extension}`;
}

/**
 * Upload un buffer PDF vers S3
 * @param {Buffer} buffer - Buffer du fichier PDF
 * @param {Object} options - Options d'upload
 * @param {string} options.userId - ID de l'utilisateur
 * @param {string} options.auditId - ID de l'audit
 * @param {string} options.fileName - Nom du fichier (optionnel)
 * @param {string} options.fileType - Type de fichier (default: 'pdf')
 * @param {Object} options.metadata - Métadonnées additionnelles
 * @returns {Promise<{key: string, url: string, bucket: string}>}
 */
export async function uploadPdfToS3(buffer, options = {}) {
  const {
    userId,
    auditId,
    fileName,
    fileType = 'pdf',
    metadata = {},
  } = options;

  // Validation
  if (!userId || !auditId) {
    throw new Error('userId and auditId are required');
  }

  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid buffer provided');
  }

  // Générer la clé S3 unique
  const key = generateS3Key(userId, auditId, fileType);

  // Déterminer le Content-Type
  const contentTypeMap = {
    pdf: 'application/pdf',
    json: 'application/json',
    html: 'text/html',
    txt: 'text/plain',
  };
  const contentType = contentTypeMap[fileType] || 'application/octet-stream';

  // Préparer les métadonnées S3
  const s3Metadata = {
    userId,
    auditId,
    uploadedAt: new Date().toISOString(),
    ...metadata,
  };

  // Commande d'upload
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ContentLength: buffer.length,
    // ACL privée (pas d'accès public)
    ACL: 'private',
    // Métadonnées personnalisées
    Metadata: s3Metadata,
    // Cache control
    CacheControl: 'max-age=31536000', // 1 an
    // Nom de fichier pour le téléchargement
    ContentDisposition: fileName 
      ? `attachment; filename="${fileName}"` 
      : `attachment; filename="report-${auditId}.${fileType}"`,
  });

  try {
    // Upload vers S3
    const response = await s3Client.send(command);
    
    console.log(`[S3Service] File uploaded successfully: ${key}`);
    console.log(`[S3Service] ETag: ${response.ETag}`);

    // Générer une URL présignée (valide 7 jours)
    const presignedUrl = await generatePresignedUrl(key, 7 * 24 * 60 * 60);

    return {
      key,
      url: presignedUrl,
      bucket: BUCKET_NAME,
      etag: response.ETag,
      size: buffer.length,
      contentType,
    };
  } catch (error) {
    console.error('[S3Service] Upload error:', error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
}

/**
 * Générer une URL présignée pour télécharger un fichier
 * @param {string} key - Clé S3 du fichier
 * @param {number} expiresIn - Durée de validité en secondes (default: 3600 = 1h)
 * @returns {Promise<string>} URL présignée
 */
export async function generatePresignedUrl(key, expiresIn = 3600) {
  if (!key) {
    throw new Error('S3 key is required');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn,
    });

    console.log(`[S3Service] Presigned URL generated for ${key} (expires in ${expiresIn}s)`);
    return presignedUrl;
  } catch (error) {
    console.error('[S3Service] Presigned URL generation error:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

/**
 * Télécharger un fichier depuis S3
 * @param {string} key - Clé S3 du fichier
 * @returns {Promise<Buffer>} Buffer du fichier
 */
export async function downloadFromS3(key) {
  if (!key) {
    throw new Error('S3 key is required');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    
    // Convertir le stream en buffer
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    console.log(`[S3Service] File downloaded: ${key} (${buffer.length} bytes)`);
    
    return buffer;
  } catch (error) {
    console.error('[S3Service] Download error:', error);
    throw new Error(`Failed to download from S3: ${error.message}`);
  }
}

/**
 * Vérifier si le service S3 est correctement configuré
 * @returns {boolean}
 */
export function isS3Configured() {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME
  );
}

/**
 * Générer une URL présignée avec une durée personnalisée
 * @param {string} key - Clé S3
 * @param {number} hours - Durée en heures
 * @returns {Promise<string>}
 */
export async function generatePresignedUrlForHours(key, hours = 24) {
  return generatePresignedUrl(key, hours * 60 * 60);
}

/**
 * Upload multiple buffers en parallèle
 * @param {Array<{buffer: Buffer, options: Object}>} uploads
 * @returns {Promise<Array>}
 */
export async function uploadMultipleToS3(uploads) {
  const promises = uploads.map(({ buffer, options }) => 
    uploadPdfToS3(buffer, options)
  );
  
  return Promise.all(promises);
}

export default {
  uploadPdfToS3,
  generatePresignedUrl,
  generatePresignedUrlForHours,
  downloadFromS3,
  generateS3Key,
  isS3Configured,
  uploadMultipleToS3,
};
