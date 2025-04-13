import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, desc } from 'drizzle-orm';
import ws from 'ws';
import { 
  queryWithRAG, 
  extractQueryIntentAndEntities
} from './haystack';
import { queryWithOpenAI } from './openai';
import * as schema from '../../shared/schema';
import { HOST, SERVER_PORT, DATABASE_URL } from '../../config';

// Configuration for Neon serverless Postgres
const neonConfig = {
  webSocketConstructor: ws,
};

// Create database pool and connection
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

// Create an instance of the Elysia server
const app = new Elysia()
  .use(cors())
  .onError(({ error, set }) => {
    console.error('Error in query engine service:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'An unexpected error occurred in the query engine',
    };
  });

// Health check endpoint
app.get('/health', () => {
  return {
    status: 'ok',
    service: 'query-engine',
    timestamp: new Date().toISOString(),
  };
});

// Query endpoint
app.post('/query', async ({ body, set }) => {
  try {
    if (!body || !body.query) {
      set.status = 400;
      return {
        success: false,
        error: 'Missing required field: query',
      };
    }
    
    const { query, userId } = body;
    
    // Extract intent and entities from the query
    const { intent, entities } = await extractQueryIntentAndEntities(query);
    
    // Choose the appropriate method based on intent
    let response = '';
    let sources = [];
    
    if (intent === 'fact_extraction' || intent === 'summary') {
      // Use Haystack for fact extraction or summary
      const ragResult = await queryWithRAG(query, userId);
      response = ragResult.answer;
      sources = ragResult.sources;
    } else {
      // Use OpenAI for general QA
      const openAIResult = await queryWithOpenAI(query, userId);
      response = openAIResult.answer;
      sources = openAIResult.sources;
    }
    
    // Store query in database
    if (userId) {
      await db.insert(schema.queries).values({
        userId,
        query,
        response,
        createdAt: new Date(),
      });
    }
    
    return {
      success: true,
      answer: response,
      sources,
      intent,
      entities,
    };
    
  } catch (error) {
    console.error('Query error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Query processing failed',
    };
  }
});

// Get query history
app.get('/query/history', async ({ query, set }) => {
  try {
    if (!query.userId) {
      set.status = 400;
      return {
        success: false,
        error: 'Missing required query parameter: userId',
      };
    }
    
    const userId = parseInt(query.userId as string);
    const limit = query.limit ? parseInt(query.limit as string) : 10;
    
    const history = await db
      .select()
      .from(schema.queries)
      .where(eq(schema.queries.userId, userId))
      .orderBy(desc(schema.queries.createdAt))
      .limit(limit);
    
    return {
      success: true,
      history,
    };
    
  } catch (error) {
    console.error('Query history error:', error);
    set.status = 500;
    return {
      success: false,
      error: error.message || 'Failed to get query history',
    };
  }
});

// Start the server
if (import.meta.main) {
  app.listen(SERVER_PORT, HOST, () => {
    console.log(`🚀 Query Engine running at http://${HOST}:${SERVER_PORT}`);
  });
}

export default app;
