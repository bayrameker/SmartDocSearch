import fastify from 'fastify';
import { VECTOR_SERVICE_URL, OPENAI_API_KEY } from '../../config';
import { initializeQdrant } from './qdrant';
import { generateEmbeddings } from './embeddings';

const server = fastify({
  logger: true
});

// Extract the port from the URL
const url = new URL(VECTOR_SERVICE_URL);
const port = parseInt(url.port, 10) || 8004;

// Check if OpenAI API key is set
if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set! Vector embeddings will not work.');
}

// Initialize Qdrant
initializeQdrant().catch(err => {
  server.log.error('Failed to initialize Qdrant:', err);
  process.exit(1);
});

// Define routes
server.post('/embed', async (request, reply) => {
  try {
    const { documentId, chunks } = request.body as any;
    
    if (!documentId || !chunks || !Array.isArray(chunks)) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required fields'
      });
    }
    
    // Generate embeddings for chunks
    const results = await generateEmbeddings(documentId, chunks);
    
    return reply.code(200).send({
      success: true,
      documentId,
      chunks: results
    });
  } catch (error) {
    server.log.error('Error generating embeddings', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

server.post('/search', async (request, reply) => {
  try {
    const { query, limit, filter } = request.body as any;
    
    if (!query) {
      return reply.code(400).send({
        success: false,
        error: 'Missing query'
      });
    }
    
    // TODO: Implement vector search
    
    return reply.code(200).send({
      success: true,
      results: []
    });
  } catch (error) {
    server.log.error('Error performing vector search', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'vector' };
});

// Start the server
const start = async () => {
  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Vector Service running on ${VECTOR_SERVICE_URL}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

export default server;