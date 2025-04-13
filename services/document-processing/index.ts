import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { multipart } from '@elysiajs/multipart';
import { processDocument } from './ocr';
import { extractEntities } from './nlp';
import { sendToKafka } from './kafka';
import { HOST, SERVER_PORT } from '../../config';

// Create an instance of the Elysia server
const app = new Elysia()
  .use(cors())
  .use(multipart())
  .onError(({ error, set }) => {
    console.error('Error in document processing service:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'An unexpected error occurred during document processing',
    };
  });

// Health check endpoint
app.get('/health', () => {
  return {
    status: 'ok',
    service: 'document-processing',
    timestamp: new Date().toISOString(),
  };
});

// Upload and process document endpoint
app.post('/process', async ({ body, set }) => {
  try {
    if (!body || !body.file) {
      set.status = 400;
      return {
        success: false,
        error: 'No file provided',
      };
    }

    const file = body.file;
    const userId = body.userId;
    
    if (!userId) {
      set.status = 400;
      return {
        success: false,
        error: 'User ID is required',
      };
    }

    // Process the document (OCR if PDF)
    const { text, metadata } = await processDocument(file);
    
    // Extract entities and other NLP features
    const nlpResults = await extractEntities(text);
    
    // Prepare document data
    const documentData = {
      userId,
      title: body.title || file.name,
      filename: file.name,
      mimeType: file.type,
      text,
      metadata,
      nlpResults,
    };
    
    // Send to Kafka for further processing by other services
    await sendToKafka('document-processed', documentData);
    
    return {
      success: true,
      documentId: documentData.id,
      message: 'Document submitted for processing',
    };
    
  } catch (error) {
    console.error('Error processing document:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Failed to process document',
    };
  }
});

// Start the server
if (import.meta.main) {
  app.listen(SERVER_PORT, HOST, () => {
    console.log(`🚀 Document Processing Service running at http://${HOST}:${SERVER_PORT}`);
  });
}

export default app;
