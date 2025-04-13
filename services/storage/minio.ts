import { Client } from 'minio';
import { MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_USE_SSL, MINIO_BUCKET_NAME } from '../../config';

// Configure MinIO client
export const minioClient = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

// Initialize MinIO connection and create bucket if not exists
export async function initializeMinIO() {
  try {
    const bucketExists = await minioClient.bucketExists(MINIO_BUCKET_NAME);
    if (!bucketExists) {
      await minioClient.makeBucket(MINIO_BUCKET_NAME, 'us-east-1');
      console.log(`Bucket '${MINIO_BUCKET_NAME}' created successfully`);
    } else {
      console.log(`Bucket '${MINIO_BUCKET_NAME}' already exists`);
    }

    // Set bucket policy to allow public read access
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
    console.log(`Bucket policy has been set for '${MINIO_BUCKET_NAME}'`);
    
    console.log('MinIO initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing MinIO:', error);
    throw error;
  }
}

// Upload a file to MinIO
export async function uploadFile(buffer: Buffer, fileName: string, contentType: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const objectName = `${timestamp}_${fileName}`;
    
    await minioClient.putObject(
      MINIO_BUCKET_NAME,
      objectName,
      buffer,
      {
        'Content-Type': contentType
      }
    );
    
    console.log(`File uploaded successfully: ${objectName}`);
    return objectName;
  } catch (err) {
    console.error('Error uploading file to MinIO:', err);
    throw err;
  }
}

// Get a presigned URL for downloading a file
export async function getPresignedUrl(objectName: string, expiryInSeconds = 3600): Promise<string> {
  try {
    const url = await minioClient.presignedGetObject(MINIO_BUCKET_NAME, objectName, expiryInSeconds);
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
}

// Delete a file from MinIO
export async function deleteFile(objectName: string): Promise<boolean> {
  try {
    await minioClient.removeObject(MINIO_BUCKET_NAME, objectName);
    console.log(`File ${objectName} deleted successfully`);
    return true;
  } catch (error) {
    console.error(`Error deleting file ${objectName}:`, error);
    throw error;
  }
}

// List all files in a directory
export async function listFiles(prefix: string): Promise<string[]> {
  try {
    const objectsList: string[] = [];
    const objectsStream = await minioClient.listObjects(MINIO_BUCKET_NAME, prefix, true);
    
    for await (const obj of objectsStream) {
      if (obj.name) {
        objectsList.push(obj.name);
      }
    }
    
    return objectsList;
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
}