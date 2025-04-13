import fastify from 'fastify';
import { processDocument } from './ocr';
import { initializeKafka } from './kafka';
import { DOCUMENT_PROCESSING_URL } from '../../config';

const server = fastify({
  logger: true
});

// Extract the port from the URL
const url = new URL(DOCUMENT_PROCESSING_URL);
const port = parseInt(url.port, 10) || 8001;

// Initialize Kafka connection
initializeKafka().catch(err => {
  server.log.error('Failed to initialize Kafka connection', err);
  process.exit(1);
});

// Define routes
server.post('/process', async (request, reply) => {
  try {
    const { documentId, storageKey, fileName, mimeType } = request.body as any;
    
    if (!documentId || !storageKey || !fileName || !mimeType) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Start document processing asynchronously
    processDocument({ documentId, storageKey, fileName, mimeType })
      .then(() => {
        server.log.info(`Document ${documentId} processed successfully`);
      })
      .catch(err => {
        server.log.error(`Error processing document ${documentId}`, err);
      });

    return reply.code(202).send({
      success: true,
      documentId,
      message: 'Document processing started'
    });
  } catch (error) {
    server.log.error('Error processing document', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

server.get('/status/:id', async (request, reply) => {
  try {
    const { id } = request.params as { id: string };
    const documentId = parseInt(id);
    
    if (isNaN(documentId)) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid document ID'
      });
    }

    // TODO: Implement status checking
    return reply.code(200).send({
      documentId,
      status: 'processing',
      progress: 50
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
  return { status: 'ok', service: 'document-processing' };
});

// Start the server
const start = async () => {
  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Document Processing Service running on ${DOCUMENT_PROCESSING_URL}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

export default server;