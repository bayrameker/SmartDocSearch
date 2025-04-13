import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { Kafka } from 'kafkajs';
import { 
  initializeTypesense, 
  createDocumentIndex, 
  updateDocument, 
  searchDocuments,
  deleteDocument
} from './typesense';
import { KAFKA_BROKERS, HOST, SERVER_PORT } from '../../config';

// Initialize Kafka client
const kafka = new Kafka({
  clientId: 'search-service',
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: 'search-service-group' });

// Create an instance of the Elysia server
const app = new Elysia()
  .use(cors())
  .onError(({ error, set }) => {
    console.error('Error in search service:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'An unexpected error occurred in the search service',
    };
  });

// Health check endpoint
app.get('/health', () => {
  return {
    status: 'ok',
    service: 'search',
    timestamp: new Date().toISOString(),
  };
});

// Search endpoint
app.get('/search', async ({ query, set }) => {
  try {
    const q = query.q as string;
    const userId = query.userId as string;
    
    if (!q) {
      set.status = 400;
      return {
        success: false,
        error: 'Query parameter "q" is required',
      };
    }
    
    const filters = userId ? `userId:${userId}` : '';
    const results = await searchDocuments(q, filters);
    
    return {
      success: true,
      results,
    };
    
  } catch (error) {
    console.error('Search error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Search failed',
    };
  }
});

// Manual index document endpoint
app.post('/index', async ({ body, set }) => {
  try {
    if (!body || !body.documentId || !body.text) {
      set.status = 400;
      return {
        success: false,
        error: 'Missing required fields: documentId, text',
      };
    }
    
    const typesenseId = await updateDocument({
      id: body.documentId,
      userId: body.userId,
      title: body.title,
      content: body.text,
      metadata: body.metadata || {},
    });
    
    return {
      success: true,
      typesenseId,
    };
    
  } catch (error) {
    console.error('Indexing error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Document indexing failed',
    };
  }
});

// Delete document from index
app.delete('/documents/:id', async ({ params, set }) => {
  try {
    await deleteDocument(params.id);
    
    return {
      success: true,
      message: `Document ${params.id} removed from search index`,
    };
    
  } catch (error) {
    console.error('Delete document error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Failed to delete document from search index',
    };
  }
});

// Initialize service
async function initialize() {
  try {
    // Initialize Typesense
    await initializeTypesense();
    
    // Connect to Kafka
    await consumer.connect();
    
    // Subscribe to document processing topics
    await consumer.subscribe({ 
      topics: ['document-processed', 'document-updated', 'document-deleted'],
      fromBeginning: false 
    });
    
    // Process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageValue = message.value?.toString();
          if (!messageValue) return;
          
          const data = JSON.parse(messageValue);
          
          switch (topic) {
            case 'document-processed':
              // Index the document in Typesense
              const typesenseId = await updateDocument({
                id: data.id || data.documentId,
                userId: data.userId,
                title: data.title,
                content: data.text,
                metadata: data.metadata || {},
              });
              
              console.log(`Indexed document ${data.id || data.documentId} with Typesense ID ${typesenseId}`);
              break;
              
            case 'document-updated':
              // Update the document in the index
              await updateDocument({
                id: data.id,
                userId: data.userId,
                title: data.title,
                content: data.text,
                metadata: data.metadata || {},
              });
              
              console.log(`Updated document ${data.id} in search index`);
              break;
              
            case 'document-deleted':
              // Remove the document from the index
              await deleteDocument(data.id);
              console.log(`Removed document ${data.id} from search index`);
              break;
              
            default:
              console.log(`Unknown topic: ${topic}`);
          }
          
        } catch (error) {
          console.error(`Error processing Kafka message from topic ${topic}:`, error);
        }
      },
    });
    
  } catch (error) {
    console.error('Failed to initialize search service:', error);
    process.exit(1);
  }
}

// Start the server
if (import.meta.main) {
  // Start the server and initialize services
  app.listen(SERVER_PORT, HOST, () => {
    console.log(`🚀 Search Service running at http://${HOST}:${SERVER_PORT}`);
    initialize().catch(error => {
      console.error('Initialization failed:', error);
      process.exit(1);
    });
  });
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing connections');
  await consumer.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing connections');
  await consumer.disconnect();
  process.exit(0);
});

export default app;
