import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { swagger } from '@elysiajs/swagger';
import { configureRoutes } from './routes';
import { verifyToken } from './auth';
import { HOST, SERVER_PORT } from '../../config';

// Create an instance of the Elysia server
const app = new Elysia()
  .use(cors())
  .use(swagger({
    path: '/docs',
    documentation: {
      info: {
        title: 'Document Search and Query API',
        version: '1.0.0',
      },
    },
  }))
  .onError(({ error, set }) => {
    console.error('API Gateway error:', error);
    set.status = error.status || 500;
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  });

// Middleware to check authentication for protected routes
app.derive(({ request, path }) => {
  // Skip authentication for public paths
  const publicPaths = [
    '/health',
    '/docs',
    '/auth/login',
    '/auth/register',
  ];
  
  if (publicPaths.some(p => path.startsWith(p))) {
    return {};
  }
  
  // Verify token for protected routes
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: Missing or invalid token');
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const user = verifyToken(token);
    return { user };
  } catch (error) {
    throw new Error('Unauthorized: Invalid token');
  }
});

// Health check endpoint
app.get('/health', () => {
  return {
    status: 'ok',
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
  };
});

// Configure all routes
configureRoutes(app);

// Start the server
if (import.meta.main) {
  app.listen(SERVER_PORT, HOST, () => {
    console.log(`🚀 API Gateway running at http://${HOST}:${SERVER_PORT}`);
  });
}

export default app;
