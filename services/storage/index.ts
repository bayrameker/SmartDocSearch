import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { multipart } from '@elysiajs/multipart';
import { Kafka } from 'kafkajs';
import { 
  uploadFile, 
  downloadFile, 
  deleteFile,
  initializeBucket
} from './minio';
import { 
  saveDocumentMetadata, 
  getDocument, 
  listDocuments,
  updateDocumentStatus,
  deleteDocument,
  initializeDatabase
} from './db';
import { KAFKA_BROKERS, HOST, SERVER_PORT } from '../../config';

// Initialize Kafka client
const kafka = new Kafka({
  clientId: 'storage-service',
  brokers: KAFKA_BROKERS,
});

const producer = kafka.producer();

// Create an instance of the Elysia server
const app = new Elysia()
  .use(cors())
  .use(multipart())
  .onError(({ error, set }) => {
    console.error('Error in storage service:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'An unexpected error occurred in the storage service',
    };
  });

// Health check endpoint
app.get('/health', () => {
  return {
    status: 'ok',
    service: 'storage',
    timestamp: new Date().toISOString(),
  };
});

// Upload document endpoint
app.post('/documents', async ({ body, set }) => {
  try {
    if (!body || !body.file || !body.userId) {
      set.status = 400;
      return {
        success: false,
        error: 'Missing required fields: file, userId',
      };
    }
    
    const file = body.file;
    const userId = parseInt(body.userId);
    const title = body.title || file.name;
    
    // Upload to MinIO
    const storageKey = await uploadFile(file);
    
    // Save metadata to database
    const document = await saveDocumentMetadata({
      userId,
      title,
      filename: file.name,
      mimeType: file.type,
      storageKey,
    });
    
    // Publish event to Kafka for processing
    await producer.send({
      topic: 'document-uploaded',
      messages: [
        {
          value: JSON.stringify({
            documentId: document.id,
            userId,
            title,
            filename: file.name,
            mimeType: file.type,
            storageKey,
          }),
        },
      ],
    });
    
    return {
      success: true,
      document: {
        id: document.id,
        title: document.title,
        filename: document.filename,
        status: document.status,
        createdAt: document.createdAt,
      },
    };
    
  } catch (error) {
    console.error('Document upload error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Document upload failed',
    };
  }
});

// Get document metadata
app.get('/documents/:id', async ({ params, set }) => {
  try {
    const document = await getDocument(parseInt(params.id));
    
    if (!document) {
      set.status = 404;
      return {
        success: false,
        error: 'Document not found',
      };
    }
    
    return {
      success: true,
      document,
    };
    
  } catch (error) {
    console.error('Get document error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Failed to retrieve document',
    };
  }
});

// Download document
app.get('/documents/:id/download', async ({ params, set }) => {
  try {
    const document = await getDocument(parseInt(params.id));
    
    if (!document) {
      set.status = 404;
      return {
        success: false,
        error: 'Document not found',
      };
    }
    
    const fileStream = await downloadFile(document.storageKey);
    
    // Set appropriate headers
    set.headers['Content-Type'] = document.mimeType;
    set.headers['Content-Disposition'] = `attachment; filename="${document.filename}"`;
    
    // Return file stream
    return fileStream;
    
  } catch (error) {
    console.error('Document download error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Document download failed',
    };
  }
});

// List documents
app.get('/documents', async ({ query }) => {
  try {
    const userId = query.userId ? parseInt(query.userId as string) : undefined;
    const page = query.page ? parseInt(query.page as string) : 1;
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    
    const { documents, total } = await listDocuments(userId, page, limit);
    
    return {
      success: true,
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
    
  } catch (error) {
    console.error('List documents error:', error);
    return {
      success: false,
      error: error.message || 'Failed to list documents',
    };
  }
});

// Delete document
app.delete('/documents/:id', async ({ params, set }) => {
  try {
    const documentId = parseInt(params.id);
    const document = await getDocument(documentId);
    
    if (!document) {
      set.status = 404;
      return {
        success: false,
        error: 'Document not found',
      };
    }
    
    // Delete from MinIO
    await deleteFile(document.storageKey);
    
    // Delete from database
    await deleteDocument(documentId);
    
    // Publish event to Kafka
    await producer.send({
      topic: 'document-deleted',
      messages: [
        {
          value: JSON.stringify({
            id: documentId,
          }),
        },
      ],
    });
    
    return {
      success: true,
      message: `Document ${documentId} deleted successfully`,
    };
    
  } catch (error) {
    console.error('Delete document error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Failed to delete document',
    };
  }
});

// Update document status
app.patch('/documents/:id/status', async ({ params, body, set }) => {
  try {
    if (!body || !body.status) {
      set.status = 400;
      return {
        success: false,
        error: 'Missing required field: status',
      };
    }
    
    const documentId = parseInt(params.id);
    const status = body.status;
    
    const document = await updateDocumentStatus(documentId, status);
    
    if (!document) {
      set.status = 404;
      return {
        success: false,
        error: 'Document not found',
      };
    }
    
    return {
      success: true,
      document,
    };
    
  } catch (error) {
    console.error('Update document status error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Failed to update document status',
    };
  }
});

// Initialize service
async function initialize() {
  try {
    // Initialize MinIO bucket
    await initializeBucket();
    
    // Initialize database connection
    await initializeDatabase();
    
    // Connect to Kafka
    await producer.connect();
    
    console.log('Storage service initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize storage service:', error);
    process.exit(1);
  }
}

// Start the server
if (import.meta.main) {
  app.listen(SERVER_PORT, HOST, () => {
    console.log(`🚀 Storage Service running at http://${HOST}:${SERVER_PORT}`);
    initialize().catch(error => {
      console.error('Initialization failed:', error);
      process.exit(1);
    });
  });
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing connections');
  await producer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing connections');
  await producer.disconnect();
  process.exit(0);
});

export default app;
