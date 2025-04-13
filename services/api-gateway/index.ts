import fastify from 'fastify';
import cors from '@fastify/cors';
import { API_GATEWAY_URL, FRONTEND_PORT } from '../../config';
import { configureRoutes } from './routes';
import { registerAuthRoutes } from './auth';

const server = fastify({
  logger: true
});

// CORS yapılandırması
server.register(cors, {
  origin: (origin, cb) => {
    // Geliştirme ortamında tüm originlere izin ver
    cb(null, true);
    
    // Üretim ortamında daha kısıtlayıcı olabilir
    // const allowedOrigins = [`http://localhost:${FRONTEND_PORT}`, 'https://yourproductiondomain.com'];
    // const allowed = !origin || allowedOrigins.includes(origin);
    // cb(allowed ? null : new Error('Not allowed by CORS'), allowed);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Extract the port from the URL
const url = new URL(API_GATEWAY_URL);
const port = parseInt(url.port, 10) || 8000;

// Health check endpoint
server.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'api-gateway' };
});

// Authentication routes
registerAuthRoutes(server);

// API routes
configureRoutes(server);

// Start the server
const start = async () => {
  try {
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`API Gateway running on ${API_GATEWAY_URL}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

export default server;