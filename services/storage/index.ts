import fastify from 'fastify';
import multer from 'fastify-multer';
import cors from '@fastify/cors';
import { STORAGE_SERVICE_URL } from '../../config';
import { sendToDocumentProcessing, checkProcessingStatus } from './document-processing';
import { initializeMinIO, uploadFile, getPresignedUrl, deleteFile, listFiles } from './minio';
import { createDocument, getDocumentById, getDocumentsByUserId, updateDocumentStatus, deleteDocumentById } from './db';
import { eq } from 'drizzle-orm';
import { db } from '../../server/db';
import { documents } from '../../shared/schema';

const server = fastify({
  logger: true
});

// Register plugins
server.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});

server.register(multer.contentParser);

// Extract the port from the URL
const url = new URL(STORAGE_SERVICE_URL);
const port = parseInt(url.port, 10) || 8003;

// Initialize MinIO
initializeMinIO().catch(err => {
  server.log.error('Failed to initialize MinIO:', err);
  process.exit(1);
});

// Configure file upload
const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Define routes
server.post('/upload', { preHandler: upload.single('file') }, async (request, reply) => {
  try {
    const file = request.file;
    const { userId } = request.body as { userId: string };
    
    if (!userId || !file) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Get file info
    const fileName = file.originalname;
    const fileBuffer = file.buffer;
    const mimeType = file.mimetype;
    const fileSize = file.size;
    const fileExtension = fileName.split('.').pop() || '';
    
    // Upload file to MinIO
    const storageKey = await uploadFile(fileBuffer, `${userId}/${fileName}`, mimeType);
    
    // Create document record in database
    const userIdNumber = parseInt(userId, 10);
    const newDocument = await createDocument({
      userId: userIdNumber,
      title: fileName,
      fileName: fileName,
      fileSize: fileSize,
      fileType: fileExtension,
      storageKey: storageKey,
      status: 'uploaded',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Send to document processing service
    await sendToDocumentProcessing({
      documentId: newDocument.id,
      storageKey: storageKey,
      fileName: fileName,
      mimeType: mimeType
    });
    
    // Update document status to 'processing'
    await updateDocumentStatus(newDocument.id, 'processing');
    
    return reply.code(200).send({
      success: true,
      document: newDocument
    });
  } catch (error) {
    server.log.error('Error uploading file', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

server.get('/document/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const documentId = parseInt(id, 10);
    
    if (isNaN(documentId)) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid document ID'
      });
    }
    
    const document = await getDocumentById(documentId);
    
    if (!document) {
      return reply.code(404).send({
        success: false,
        error: 'Document not found'
      });
    }
    
    return reply.code(200).send({
      success: true,
      document
    });
  } catch (error) {
    server.log.error('Error getting document', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

server.get('/documents/user/:userId', async (request, reply) => {
  try {
    const { userId } = request.params as { userId: string };
    const userIdNumber = parseInt(userId, 10);
    
    if (isNaN(userIdNumber)) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid user ID'
      });
    }
    
    const { limit = '10', offset = '0' } = request.query as { limit?: string, offset?: string };
    const limitNumber = parseInt(limit, 10);
    const offsetNumber = parseInt(offset, 10);
    
    const documents = await getDocumentsByUserId(userIdNumber, limitNumber, offsetNumber);
    
    return reply.code(200).send({
      success: true,
      documents,
      total: documents.length,
      limit: limitNumber,
      offset: offsetNumber
    });
  } catch (error) {
    server.log.error('Error getting user documents', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

server.get('/download/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const documentId = parseInt(id, 10);
    
    if (isNaN(documentId)) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid document ID'
      });
    }
    
    const document = await getDocumentById(documentId);
    
    if (!document) {
      return reply.code(404).send({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Get a presigned URL for the document
    const presignedUrl = await getPresignedUrl(document.storageKey);
    
    return reply.code(200).send({
      success: true,
      url: presignedUrl,
      document
    });
  } catch (error) {
    server.log.error('Error generating download URL', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

server.post('/document/:id/update', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const documentId = parseInt(id, 10);
    
    if (isNaN(documentId)) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid document ID'
      });
    }
    
    const document = await getDocumentById(documentId);
    
    if (!document) {
      return reply.code(404).send({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Get update data from request body
    const { textContent, metadata, status } = request.body as any;
    
    // Update document properties
    const updatedDocument = await db.update(documents)
      .set({
        ...(textContent && { textContent }),
        ...(status && { status }),
        updatedAt: new Date()
      })
      .where(eq(documents.id, documentId))
      .returning();
    
    // Update metadata separately if provided
    if (metadata) {
      await updateDocumentMetadata(documentId, metadata);
    }
    
    return reply.code(200).send({
      success: true,
      document: updatedDocument[0]
    });
  } catch (error) {
    server.log.error('Error updating document', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

server.delete('/document/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const documentId = parseInt(id, 10);
    
    if (isNaN(documentId)) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid document ID'
      });
    }
    
    const document = await getDocumentById(documentId);
    
    if (!document) {
      return reply.code(404).send({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Delete the file from MinIO
    await deleteFile(document.storageKey);
    
    // Delete the document record from database
    const deleted = await deleteDocumentById(documentId);
    
    return reply.code(200).send({
      success: true,
      deleted
    });
  } catch (error) {
    server.log.error('Error deleting document', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

server.get('/status/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const documentId = parseInt(id, 10);
    
    if (isNaN(documentId)) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid document ID'
      });
    }
    
    const document = await getDocumentById(documentId);
    
    if (!document) {
      return reply.code(404).send({
        success: false,
        error: 'Document not found'
      });
    }
    
    // Check processing status
    const processingStatus = await checkProcessingStatus(documentId);
    
    return reply.code(200).send({
      success: true,
      document,
      processingStatus
    });
  } catch (error) {
    server.log.error('Error checking document status', error);
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