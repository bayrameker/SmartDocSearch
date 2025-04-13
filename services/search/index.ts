import fastify from 'fastify';
import { SEARCH_SERVICE_URL } from '../../config';
import { initializeTypesense } from './typesense';

const server = fastify({
  logger: true
});

// Extract the port from the URL
const url = new URL(SEARCH_SERVICE_URL);
const port = parseInt(url.port, 10) || 8002;

// Initialize Typesense connection
initializeTypesense().catch(err => {
  server.log.error('Failed to initialize Typesense connection', err);
  process.exit(1);
});

// Define routes
server.post('/search', async (request, reply) => {
  try {
    const { query, userId, page, limit, filters } = request.body as any;
    
    if (!query) {
      return reply.code(400).send({
        success: false,
        error: 'Missing required fields'
      });
    }

    const pageNum = page || 1;
    const limitNum = limit || 10;
    
    // TODO: Implement actual search with Typesense
    // For now, return mock data
    const results = {
      query,
      results: [
        {
          id: 1,
          title: 'Sample Document',
          snippet: 'This is a sample document that matches your query.',
          score: 0.95,
          createdAt: new Date().toISOString(),
          metadata: {
            author: 'Test Author',
            pageCount: 10
          }
        }
      ],
      total: 1,
      page: pageNum,
      limit: limitNum,
      success: true
    };

    return reply.code(200).send(results);
  } catch (error) {
    server.log.error('Error performing search', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'search' };
});

// Start the server
const start = async () => {
  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Search Service running on ${SEARCH_SERVICE_URL}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

export default server;