import fastify from 'fastify';
import { Client } from 'minio';
import { MINIO_ENDPOINT, MINIO_PORT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY, MINIO_USE_SSL, MINIO_BUCKET_NAME, STORAGE_SERVICE_URL } from '../../config';
import { sendToDocumentProcessing } from './document-processing';

const server = fastify({
  logger: true
});

// Extract the port from the URL
const url = new URL(STORAGE_SERVICE_URL);
const port = parseInt(url.port, 10) || 8003;

// Configure MinIO client
const minioClient = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

// Initialize MinIO connection and create bucket if not exists
async function initializeMinIO() {
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
  } catch (error) {
    console.error('Error initializing MinIO:', error);
    throw error;
  }
}

// Initialize MinIO
initializeMinIO().catch(err => {
  server.log.error('Failed to initialize MinIO:', err);
  process.exit(1);
});

// Define routes
server.post('/upload', async (request, reply) => {
  try {
    // TODO: Implement file upload
    const { userId, file, fileName } = request.body as any;
    
    if (!userId || !file || !fileName) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Generate a unique storage key
    const fileExtension = fileName.split('.').pop();
    const timestamp = Date.now();
    const storageKey = `${userId}/${timestamp}_${fileName}`;
    
    // TODO: Upload file to MinIO
    
    // Create document record in database
    const documentId = 1; // TODO: Insert into database
    
    // Send to document processing service
    await sendToDocumentProcessing({
      documentId,
      storageKey,
      fileName,
      mimeType: `application/${fileExtension}`
    });
    
    return reply.code(200).send({
      success: true,
      documentId,
      storageKey
    });
  } catch (error) {
    server.log.error('Error uploading file', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

server.get('/download/:key', async (request, reply) => {
  try {
    const { key } = request.params as { key: string };
    
    if (!key) {
      return reply.code(400).send({
        success: false,
        error: 'Missing storage key'
      });
    }
    
    // TODO: Implement file download from MinIO
    
    return reply.code(200).send({
      success: true,
      url: `https://${MINIO_ENDPOINT}:${MINIO_PORT}/${MINIO_BUCKET_NAME}/${key}`
    });
  } catch (error) {
    server.log.error('Error downloading file', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'storage' };
});

// Start the server
const start = async () => {
  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Storage Service running on ${STORAGE_SERVICE_URL}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

export default server;