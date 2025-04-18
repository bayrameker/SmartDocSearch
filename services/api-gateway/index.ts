const fastify = require('fastify');
const cors = require('@fastify/cors');
const config = require('../../config');
const routes = require('./routes');
const auth = require('./auth');

// Destructure config variables
const { API_GATEWAY_URL, FRONTEND_PORT } = config;

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
auth.registerAuthRoutes(server);

// API routes
routes.configureRoutes(server);

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