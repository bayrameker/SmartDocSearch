import { FastifyInstance } from 'fastify';
import fetch from 'node-fetch';
import { verifyToken } from './auth';
import {
  DOCUMENT_PROCESSING_URL,
  SEARCH_SERVICE_URL,
  STORAGE_SERVICE_URL,
  VECTOR_SERVICE_URL,
  QUERY_ENGINE_URL
} from '../../config';

/**
 * Configure all API routes
 * 
 * @param app Fastify app instance
 */
export function configureRoutes(app: FastifyInstance) {
  // Document upload endpoint
  app.post('/documents/upload', async (request, reply) => {
    try {
      // Validate auth token
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({
          success: false,
          error: 'Unauthorized'
        });
      }
      
      const token = authHeader.substring(7);
      let userId;
      
      try {
        const decoded = verifyToken(token);
        userId = decoded.sub;
      } catch (err) {
        return reply.code(401).send({
          success: false,
          error: 'Invalid token'
        });
      }
      
      // Forward to storage service
      const response = await fetch(`${STORAGE_SERVICE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request.body,
          userId
        }),
      });
      
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (error) {
      app.log.error('Error uploading document:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });
  
  // Document status endpoint
  app.get('/documents/:id/status', async (request, reply) => {
    try {
      const { id } = request.params as any;
      
      // Forward to document processing service
      const response = await fetch(`${DOCUMENT_PROCESSING_URL}/status/${id}`);
      
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (error) {
      app.log.error('Error checking document status:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });
  
  // Document download endpoint
  app.get('/documents/:key/download', async (request, reply) => {
    try {
      const { key } = request.params as any;
      
      // Forward to storage service
      const response = await fetch(`${STORAGE_SERVICE_URL}/download/${key}`);
      
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (error) {
      app.log.error('Error downloading document:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });
  
  // Search endpoint
  app.post('/search', async (request, reply) => {
    try {
      // Forward to search service
      const response = await fetch(`${SEARCH_SERVICE_URL}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.body),
      });
      
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (error) {
      app.log.error('Error searching documents:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });
  
  // Query endpoint
  app.post('/query', async (request, reply) => {
    try {
      // Forward to query engine service
      const response = await fetch(`${QUERY_ENGINE_URL}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request.body),
      });
      
      const data = await response.json();
      return reply.code(response.status).send(data);
    } catch (error) {
      app.log.error('Error querying documents:', error);
      return reply.code(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  });
}