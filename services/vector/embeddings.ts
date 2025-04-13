import OpenAI from 'openai';
import { OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL } from '../../config';
import { storeEmbedding } from './qdrant';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Generate embeddings for a list of document chunks
 * 
 * @param chunks List of document chunks with content
 * @returns List of chunks with vector IDs
 */
export async function generateEmbeddings(documentId: number, chunks: { chunkId: number; content: string }[]) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    
    console.log(`Generating embeddings for document ${documentId} with ${chunks.length} chunks`);
    
    // Process chunks in batches of 10 to avoid rate limiting
    const batchSize = 10;
    const results = [];
    
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      
      // Generate embeddings for batch
      const embeddingResponse = await openai.embeddings.create({
        model: OPENAI_EMBEDDING_MODEL,
        input: batch.map(chunk => chunk.content),
      });
      
      // Process and store results
      for (let j = 0; j < batch.length; j++) {
        const chunk = batch[j];
        const embedding = embeddingResponse.data[j].embedding;
        
        // Store in Qdrant
        const vectorId = await storeEmbedding(documentId, chunk.chunkId, embedding, {
          content: chunk.content,
          document_id: documentId,
        });
        
        results.push({
          chunkId: chunk.chunkId,
          vectorId,
        });
      }
    }
    
    console.log(`Generated embeddings for ${results.length} chunks of document ${documentId}`);
    return results;
  } catch (error) {
    console.error(`Error generating embeddings for document ${documentId}:`, error);
    throw error;
  }
}

/**
 * Generate embedding for a single query
 * 
 * @param query The query text
 * @returns Embedding vector
 */
export async function generateQueryEmbedding(query: string) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    
    const embeddingResponse = await openai.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: query,
    });
    
    return embeddingResponse.data[0].embedding;
  } catch (error) {
    console.error('Error generating query embedding:', error);
    throw error;
  }
}