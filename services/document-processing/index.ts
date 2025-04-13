const fastify = require('fastify');
const cors = require('@fastify/cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { extractTextFromDocument } = require('./ocr');
const { initializeKafka, sendToKafka, startConsumer } = require('./kafka');
const { DOCUMENT_PROCESSING_URL, STORAGE_SERVICE_URL } = require('../../config');
const { DocumentUploadedEvent, ProcessDocumentRequest, ProcessDocumentResponse, StatusRequest, StatusResponse } = require('../../shared/types');

// Create fastify server
const server = fastify({
  logger: true
});

// Register CORS plugin
server.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
});

// Extract port from URL
const url = new URL(DOCUMENT_PROCESSING_URL);
const port = parseInt(url.port, 10) || 8001;

// Processing queue
const processingQueue: Map<number, { status: string, progress: number, error?: string }> = new Map();

// Process document from storage
async function processDocumentFromStorage(documentId: number, storageKey: string, fileName: string, mimeType: string): Promise<ProcessDocumentResponse> {
  try {
    // Update processing status
    processingQueue.set(documentId, { status: 'downloading', progress: 10 });
    
    // Download the file from storage service
    const downloadResponse = await fetch(`${STORAGE_SERVICE_URL}/download/${documentId}`);
    
    if (!downloadResponse.ok) {
      throw new Error(`Failed to download document: ${downloadResponse.statusText}`);
    }
    
    const downloadData = await downloadResponse.json();
    const fileUrl = downloadData.url;
    
    // Download the actual file
    const fileResponse = await fetch(fileUrl);
    
    if (!fileResponse.ok) {
      throw new Error(`Failed to download file from presigned URL: ${fileResponse.statusText}`);
    }
    
    // Create a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `doc-${documentId}-${fileName}`);
    
    // Write the file to disk
    processingQueue.set(documentId, { status: 'saving', progress: 30 });
    const fileBuffer = await fileResponse.buffer();
    fs.writeFileSync(tempFilePath, fileBuffer);
    
    // Extract text from the document
    processingQueue.set(documentId, { status: 'extracting', progress: 50 });
    const extractedText = await extractTextFromDocument(tempFilePath, mimeType);
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    
    // Extract metadata
    processingQueue.set(documentId, { status: 'analyzing', progress: 80 });
    const metadata = {
      title: fileName,
      pageCount: extractedText.split('\f').length,
      wordCount: extractedText.split(/\\s+/).length,
      language: 'tr', // Assuming Turkish as default language
      createdDate: new Date().toISOString()
    };
    
    // Send processed document event to Kafka
    const processedEvent: DocumentUploadedEvent = {
      documentId,
      userId: 0, // This would be set properly in a real system
      fileName,
      mimeType,
      storageKey,
      timestamp: new Date().toISOString()
    };
    
    await sendToKafka('document-processed', {
      ...processedEvent,
      textContent: extractedText,
      metadata
    });
    
    // Update document in storage service
    await fetch(`${STORAGE_SERVICE_URL}/document/${documentId}/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        textContent: extractedText,
        metadata,
        status: 'processed'
      })
    });
    
    // Update processing status
    processingQueue.set(documentId, { status: 'completed', progress: 100 });
    
    return {
      success: true,
      documentId,
      message: 'Document processed successfully',
      metadata
    };
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    
    // Update processing status with error
    processingQueue.set(documentId, { 
      status: 'failed', 
      progress: 0,
      error: error.message || 'Unknown error occurred while processing document' 
    });
    
    return {
      success: false,
      documentId,
      error: error.message || 'Unknown error occurred while processing document'
    };
  }
}

// Define routes
server.post<{ Body: ProcessDocumentRequest }>('/process', async (request, reply) => {
  try {
    const { documentId, storageKey, fileName, mimeType } = request.body;
    
    if (!documentId || !storageKey || !fileName) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Add to processing queue
    processingQueue.set(documentId, { status: 'queued', progress: 0 });
    
    // Process document in background
    processDocumentFromStorage(documentId, storageKey, fileName, mimeType)
      .then(result => {
        console.log(`Document ${documentId} processing completed:`, result);
      })
      .catch(error => {
        console.error(`Error processing document ${documentId}:`, error);
      });
    
    // Return immediate response
    return reply.code(202).send({
      success: true,
      documentId,
      message: 'Document processing started'
    });
  } catch (error) {
    console.error('Error starting document processing:', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

server.post<{ Body: StatusRequest }>('/status', async (request, reply) => {
  try {
    const { documentId } = request.body;
    
    if (!documentId) {
      return reply.code(400).send({
        success: false,
        error: 'Missing documentId'
      });
    }
    
    // Get processing status
    const status = processingQueue.get(documentId);
    
    if (!status) {
      return reply.code(404).send({
        documentId,
        status: 'unknown',
        error: 'No processing status found for this document'
      });
    }
    
    // Return status
    return reply.code(200).send({
      documentId,
      ...status
    } as StatusResponse);
  } catch (error) {
    console.error('Error getting processing status:', error);
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

// Start Kafka
initializeKafka()
  .then(({ producer, consumer }) => {
    console.log('Kafka initialized');
    
    // Start consumer for document-uploaded topic
    return startConsumer(async (message) => {
      try {
        if (message.documentId && message.storageKey && message.fileName) {
          console.log(`Processing document from Kafka message: ${message.documentId}`);
          await processDocumentFromStorage(
            message.documentId,
            message.storageKey,
            message.fileName,
            message.mimeType || 'application/octet-stream'
          );
        }
      } catch (error) {
        console.error('Error processing Kafka message:', error);
      }
    });
  })
  .catch(error => {
    console.error('Failed to initialize Kafka:', error);
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

module.exports = server;