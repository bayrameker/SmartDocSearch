import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { Kafka } from 'kafkajs';
import { 
  createCollection, 
  getCollection,
  addVectors, 
  searchVectors,
  deleteVectors,
  initializeQdrant
} from './qdrant';
import { generateEmbeddings } from './embeddings';
import { KAFKA_BROKERS, HOST, SERVER_PORT } from '../../config';

// Initialize Kafka client
const kafka = new Kafka({
  clientId: 'vector-service',
  brokers: KAFKA_BROKERS,
});

const consumer = kafka.consumer({ groupId: 'vector-service-group' });

// Create an instance of the Elysia server
const app = new Elysia()
  .use(cors())
  .onError(({ error, set }) => {
    console.error('Error in vector service:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'An unexpected error occurred in the vector service',
    };
  });

// Health check endpoint
app.get('/health', () => {
  return {
    status: 'ok',
    service: 'vector',
    timestamp: new Date().toISOString(),
  };
});

// Create collection endpoint
app.post('/collections', async ({ body, set }) => {
  try {
    if (!body || !body.name || !body.dimension) {
      set.status = 400;
      return {
        success: false,
        error: 'Missing required fields: name, dimension',
      };
    }
    
    await createCollection({
      name: body.name,
      dimension: body.dimension,
    });
    
    return {
      success: true,
      message: `Collection ${body.name} created successfully`,
    };
    
  } catch (error) {
    console.error('Create collection error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Failed to create collection',
    };
  }
});

// Add vectors endpoint
app.post('/vectors', async ({ body, set }) => {
  try {
    if (!body || !body.collection || !body.documents) {
      set.status = 400;
      return {
        success: false,
        error: 'Missing required fields: collection, documents',
      };
    }
    
    const { collection, documents } = body;
    
    // Check if collection exists, create if not
    const collExists = await getCollection(collection);
    if (!collExists) {
      await createCollection({
        name: collection,
        dimension: 1536, // OpenAI embedding dimension
      });
    }
    
    // Generate embeddings for documents
    const embeddings = await generateEmbeddings(
      documents.map((doc: any) => doc.text)
    );
    
    // Prepare points for Qdrant
    const points = documents.map((doc: any, index: number) => ({
      id: doc.id.toString(),
      vector: embeddings[index],
      payload: {
        documentId: doc.id,
        chunkIndex: doc.chunkIndex || 0,
        text: doc.text,
        metadata: doc.metadata || {},
      },
    }));
    
    // Add vectors to Qdrant
    await addVectors(collection, points);
    
    return {
      success: true,
      message: `${points.length} vectors added to collection ${collection}`,
    };
    
  } catch (error) {
    console.error('Add vectors error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Failed to add vectors',
    };
  }
});

// Search vectors endpoint
app.post('/search', async ({ body, set }) => {
  try {
    if (!body || !body.collection || !body.query) {
      set.status = 400;
      return {
        success: false,
        error: 'Missing required fields: collection, query',
      };
    }
    
    const { collection, query, limit = 5, filter } = body;
    
    // Generate embedding for the query
    const [queryEmbedding] = await generateEmbeddings([query]);
    
    // Search vectors
    const results = await searchVectors(collection, queryEmbedding, limit, filter);
    
    return {
      success: true,
      results,
    };
    
  } catch (error) {
    console.error('Search vectors error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Failed to search vectors',
    };
  }
});

// Delete vectors endpoint
app.delete('/vectors/:collection/:id', async ({ params, set }) => {
  try {
    const { collection, id } = params;
    
    await deleteVectors(collection, [id]);
    
    return {
      success: true,
      message: `Vector ${id} deleted from collection ${collection}`,
    };
    
  } catch (error) {
    console.error('Delete vectors error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Failed to delete vectors',
    };
  }
});

// Initialize service
async function initialize() {
  try {
    // Initialize Qdrant
    await initializeQdrant();
    
    // Connect to Kafka
    await consumer.connect();
    
    // Subscribe to document processing topics
    await consumer.subscribe({ 
      topics: ['document-processed'],
      fromBeginning: false 
    });
    
    // Process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageValue = message.value?.toString();
          if (!messageValue) return;
          
          const data = JSON.parse(messageValue);
          
          if (topic === 'document-processed') {
            const { id, text, userId } = data;
            
            if (!id || !text) {
              console.error('Invalid document data received');
              return;
            }
            
            // Create collection name based on user ID
            const collectionName = `user_${userId}_docs`;
            
            // Check if collection exists, create if not
            const collExists = await getCollection(collectionName);
            if (!collExists) {
              await createCollection({
                name: collectionName,
                dimension: 1536, // OpenAI embedding dimension
              });
            }
            
            // Split text into chunks (simple approach)
            const chunkSize = 1000;
            const chunks = [];
            
            for (let i = 0; i < text.length; i += chunkSize) {
              chunks.push(text.slice(i, i + chunkSize));
            }
            
            // Generate embeddings for chunks
            const embeddings = await generateEmbeddings(chunks);
            
            // Prepare points for Qdrant
            const points = chunks.map((chunk, index) => ({
              id: `${id}_${index}`,
              vector: embeddings[index],
              payload: {
                documentId: id,
                chunkIndex: index,
                text: chunk,
                metadata: data.metadata || {},
              },
            }));
            
            // Add vectors to Qdrant
            await addVectors(collectionName, points);
            
            console.log(`Indexed ${chunks.length} chunks for document ${id} in collection ${collectionName}`);
          }
          
        } catch (error) {
          console.error(`Error processing Kafka message from topic ${topic}:`, error);
        }
      },
    });
    
  } catch (error) {
    console.error('Failed to initialize vector service:', error);
    process.exit(1);
  }
}

// Start the server
if (import.meta.main) {
  app.listen(SERVER_PORT, HOST, () => {
    console.log(`🚀 Vector Service running at http://${HOST}:${SERVER_PORT}`);
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
