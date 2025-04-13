import fastify from 'fastify';
import { QUERY_ENGINE_URL, OPENAI_API_KEY } from '../../config';
import { generateAnswer } from './openai';
import { retrieveRelevantDocuments } from './retriever';

const server = fastify({
  logger: true
});

// Extract the port from the URL
const url = new URL(QUERY_ENGINE_URL);
const port = parseInt(url.port, 10) || 8005;

// Check if OpenAI API key is set
if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set! Query engine will not work.');
}

// Define routes
server.post('/query', async (request, reply) => {
  try {
    const { query, userId, filter } = request.body as any;
    
    if (!query) {
      return reply.code(400).send({
        success: false,
        error: 'Missing query'
      });
    }
    
    if (!OPENAI_API_KEY) {
      return reply.code(503).send({
        success: false,
        error: 'OpenAI API key is not configured'
      });
    }
    
    // Retrieve relevant documents
    const sources = await retrieveRelevantDocuments(query, filter);
    
    // Generate answer using OpenAI
    const answer = await generateAnswer(query, sources);
    
    // Save query to database
    // TODO: Implement query saving
    
    return reply.code(200).send({
      query,
      answer,
      sources,
      success: true
    });
  } catch (error) {
    server.log.error('Error processing query', error);
    return reply.code(500).send({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'query-engine' };
});

// Start the server
const start = async () => {
  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Query Engine Service running on ${QUERY_ENGINE_URL}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

export default server;