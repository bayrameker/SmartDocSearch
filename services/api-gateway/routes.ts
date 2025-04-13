import { Elysia } from 'elysia';
import { createProxy } from '@elysiajs/fn';
import { registerAuthRoutes } from './auth';
import {
  DOCUMENT_PROCESSING_URL,
  SEARCH_SERVICE_URL,
  STORAGE_SERVICE_URL,
  VECTOR_SERVICE_URL,
  QUERY_ENGINE_URL
} from '../../config';

// Create proxy handlers for each service
const documentProcessingProxy = createProxy(DOCUMENT_PROCESSING_URL);
const searchProxy = createProxy(SEARCH_SERVICE_URL);
const storageProxy = createProxy(STORAGE_SERVICE_URL);
const vectorProxy = createProxy(VECTOR_SERVICE_URL);
const queryEngineProxy = createProxy(QUERY_ENGINE_URL);

/**
 * Configure all API routes
 * 
 * @param app Elysia app instance
 */
export function configureRoutes(app: Elysia) {
  // Register authentication routes
  registerAuthRoutes(app);
  
  // Document processing routes
  app.group('/documents', app => {
    // Upload and process a document
    app.post('/process', async ({ body, user, request, set }) => {
      try {
        // Add user ID to request
        if (user) {
          body.userId = user.id;
        }
        
        // Forward request to document processing service
        const response = await documentProcessingProxy('/process', {
          method: 'POST',
          body,
          headers: request.headers,
        });
        
        const data = await response.json();
        set.status = response.status;
        return data;
        
      } catch (error) {
        console.error('Document processing proxy error:', error);
        set.status = 500;
        return {
          success: false,
          error: error.message || 'Document processing failed',
        };
      }
    });
  });
  
  // Storage routes
  app.group('/storage', app => {
    // Upload a document
    app.post('/documents', async ({ request, user, set }) => {
      try {
        // Forward request to storage service
        const response = await storageProxy('/documents', {
          method: 'POST',
          body: request.body,
          headers: request.headers,
        });
        
        const data = await response.json();
        set.status = response.status;
        return data;
        
      } catch (error) {
        console.error('Storage proxy error:', error);
        set.status = 500;
        return {
          success: false,
          error: error.message || 'Document upload failed',
        };
      }
    });
    
    // Get document
    app.get('/documents/:id', async ({ params, request, set }) => {
      try {
        const response = await storageProxy(`/documents/${params.id}`, {
          headers: request.headers,
        });
        
        const data = await response.json();
        set.status = response.status;
        return data;
        
      } catch (error) {
        console.error('Storage proxy error:', error);
        set.status = 500;
        return {
          success: false,
          error: error.message || 'Failed to get document',
        };
      }
    });
    
    // Download document
    app.get('/documents/:id/download', async ({ params, request, set }) => {
      try {
        const response = await storageProxy(`/documents/${params.id}/download`, {
          headers: request.headers,
        });
        
        // Set appropriate headers from the storage service response
        const headers = response.headers;
        if (headers.get('Content-Type')) {
          set.headers['Content-Type'] = headers.get('Content-Type')!;
        }
        
        if (headers.get('Content-Disposition')) {
          set.headers['Content-Disposition'] = headers.get('Content-Disposition')!;
        }
        
        set.status = response.status;
        
        // Return the file stream
        return await response.blob();
        
      } catch (error) {
        console.error('Storage proxy error:', error);
        set.status = 500;
        return {
          success: false,
          error: error.message || 'Document download failed',
        };
      }
    });
    
    // List documents
    app.get('/documents', async ({ query, user, request, set }) => {
      try {
        // Add user ID to query if not present
        let url = '/documents';
        if (user && !query.userId) {
          url += `?userId=${user.id}`;
          if (query.page) url += `&page=${query.page}`;
          if (query.limit) url += `&limit=${query.limit}`;
        } else {
          if (query.userId) url += `?userId=${query.userId}`;
          if (query.page) url += `${url.includes('?') ? '&' : '?'}page=${query.page}`;
          if (query.limit) url += `${url.includes('?') ? '&' : '?'}limit=${query.limit}`;
        }
        
        const response = await storageProxy(url, {
          headers: request.headers,
        });
        
        const data = await response.json();
        set.status = response.status;
        return data;
        
      } catch (error) {
        console.error('Storage proxy error:', error);
        set.status = 500;
        return {
          success: false,
          error: error.message || 'Failed to list documents',
        };
      }
    });
    
    // Delete document
    app.delete('/documents/:id', async ({ params, request, set }) => {
      try {
        const response = await storageProxy(`/documents/${params.id}`, {
          method: 'DELETE',
          headers: request.headers,
        });
        
        const data = await response.json();
        set.status = response.status;
        return data;
        
      } catch (error) {
        console.error('Storage proxy error:', error);
        set.status = 500;
        return {
          success: false,
          error: error.message || 'Failed to delete document',
        };
      }
    });
  });
  
  // Search routes
  app.group('/search', app => {
    // Search documents
    app.get('/', async ({ query, user, request, set }) => {
      try {
        let url = '/search?q=' + encodeURIComponent(query.q as string);
        
        // Add user ID if available
        if (user && !query.userId) {
          url += `&userId=${user.id}`;
        } else if (query.userId) {
          url += `&userId=${query.userId}`;
        }
        
        const response = await searchProxy(url, {
          headers: request.headers,
        });
        
        const data = await response.json();
        set.status = response.status;
        return data;
        
      } catch (error) {
        console.error('Search proxy error:', error);
        set.status = 500;
        return {
          success: false,
          error: error.message || 'Search failed',
        };
      }
    });
  });
  
  // Vector search routes
  app.group('/vector', app => {
    // Semantic search
    app.post('/search', async ({ body, user, request, set }) => {
      try {
        // Add user ID to filter if not present
        if (user && body && !body.filter) {
          body.filter = {
            must: [
              {
                key: 'payload.metadata.userId',
                match: {
                  value: user.id.toString(),
                },
              },
            ],
          };
        }
        
        const response = await vectorProxy('/search', {
          method: 'POST',
          body,
          headers: request.headers,
        });
        
        const data = await response.json();
        set.status = response.status;
        return data;
        
      } catch (error) {
        console.error('Vector search proxy error:', error);
        set.status = 500;
        return {
          success: false,
          error: error.message || 'Vector search failed',
        };
      }
    });
  });
  
  // Query engine routes
  app.group('/query', app => {
    // Query documents
    app.post('/', async ({ body, user, request, set }) => {
      try {
        // Add user ID if available
        if (user && body) {
          body.userId = user.id;
        }
        
        const response = await queryEngineProxy('/query', {
          method: 'POST',
          body,
          headers: request.headers,
        });
        
        const data = await response.json();
        set.status = response.status;
        return data;
        
      } catch (error) {
        console.error('Query engine proxy error:', error);
        set.status = 500;
        return {
          success: false,
          error: error.message || 'Query failed',
        };
      }
    });
    
    // Get query history
    app.get('/history', async ({ user, query, request, set }) => {
      try {
        let url = '/query/history';
        
        // Add user ID if available
        if (user) {
          url += `?userId=${user.id}`;
          if (query.limit) url += `&limit=${query.limit}`;
        } else if (query.userId) {
          url += `?userId=${query.userId}`;
          if (query.limit) url += `&limit=${query.limit}`;
        }
        
        const response = await queryEngineProxy(url, {
          headers: request.headers,
        });
        
        const data = await response.json();
        set.status = response.status;
        return data;
        
      } catch (error) {
        console.error('Query history proxy error:', error);
        set.status = 500;
        return {
          success: false,
          error: error.message || 'Failed to get query history',
        };
      }
    });
  });
}
