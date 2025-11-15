import AWS from 'aws-sdk';

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET;

// Generate presigned URL for secure file download
export const generatePresignedUrl = async (fileKey, expirationSeconds = 3600) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      Expires: expirationSeconds, // 1 hour default
      ResponseContentDisposition: 'attachment' // Force download
    };

    const url = await s3.getSignedUrlPromise('getObject', params);
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate download link');
  }
};

// Upload file to S3 (for admin use)
export const uploadFileToS3 = async (fileBuffer, fileName, contentType) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: `products/${Date.now()}-${fileName}`,
      Body: fileBuffer,
      ContentType: contentType,
      ServerSideEncryption: 'AES256'
    };

    const result = await s3.upload(params).promise();
    return result.Key; // Return the S3 key for database storage
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file');
  }
};

// Delete file from S3
export const deleteFileFromS3 = async (fileKey) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    await s3.deleteObject(params).promise();
    console.log(`File deleted from S3: ${fileKey}`);
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete file');
  }
};

// Check if file exists in S3
export const checkFileExists = async (fileKey) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey
    };

    await s3.headObject(params).promise();
    return true;
  } catch (error) {
    if (error.code === 'NotFound') {
      return false;
    }
    throw error;
  }
};