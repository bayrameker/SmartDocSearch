import { Client } from 'minio';
import crypto from 'crypto';
import stream from 'stream';
import { Readable } from 'stream';
import {
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_USE_SSL,
  MINIO_BUCKET_NAME
} from '../../config';

// Initialize MinIO client
const minioClient = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

/**
 * Initialize MinIO bucket
 */
export async function initializeBucket() {
  try {
    // Check if bucket exists
    const exists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
    
    if (!exists) {
      // Create bucket if it doesn't exist
      await minioClient.makeBucket(MINIO_BUCKET_NAME, 'us-east-1');
      console.log(`Created bucket ${MINIO_BUCKET_NAME}`);
      
      // Set bucket policy to allow document downloads
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${MINIO_BUCKET_NAME}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(MINIO_BUCKET_NAME, JSON.stringify(policy));
    } else {
      console.log(`Bucket ${MINIO_BUCKET_NAME} already exists`);
    }
    
  } catch (error) {
    console.error('MinIO initialization error:', error);
    throw new Error(`Failed to initialize MinIO bucket: ${error.message}`);
  }
}

/**
 * Upload a file to MinIO
 * 
 * @param file The file to upload
 * @returns The storage key (object name)
 */
export async function uploadFile(file: any): Promise<string> {
  try {
    // Generate a unique object name
    const hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
    const objectName = `${hash}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    // Create a buffer from the file
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Upload the file
    await minioClient.putObject(
      MINIO_BUCKET_NAME,
      objectName,
      buffer,
      buffer.length,
      { 'Content-Type': file.type }
    );
    
    console.log(`File uploaded successfully as ${objectName}`);
    
    return objectName;
    
  } catch (error) {
    console.error('MinIO upload error:', error);
    throw new Error(`File upload failed: ${error.message}`);
  }
}

/**
 * Download a file from MinIO
 * 
 * @param objectName The storage key (object name)
 * @returns A readable stream of the file content
 */
export async function downloadFile(objectName: string): Promise<Readable> {
  try {
    // Get the object as a stream
    return await minioClient.getObject(MINIO_BUCKET_NAME, objectName);
    
  } catch (error) {
    console.error('MinIO download error:', error);
    throw new Error(`File download failed: ${error.message}`);
  }
}

/**
 * Delete a file from MinIO
 * 
 * @param objectName The storage key (object name)
 */
export async function deleteFile(objectName: string): Promise<void> {
  try {
    await minioClient.removeObject(MINIO_BUCKET_NAME, objectName);
    console.log(`File ${objectName} deleted successfully`);
    
  } catch (error) {
    console.error('MinIO delete error:', error);
    throw new Error(`File deletion failed: ${error.message}`);
  }
}
