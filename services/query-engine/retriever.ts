import fetch from 'node-fetch';
import { VECTOR_SERVICE_URL } from '../../config';
import { generateQueryEmbedding } from '../vector/embeddings';
import { QuerySource } from '../../shared/types';

/**
 * Retrieve relevant documents for a query using vector search
 * 
 * @param query The user query
 * @param filter Optional filter criteria
 * @returns List of relevant document sources
 */
export async function retrieveRelevantDocuments(query: string, filter: any = null): Promise<QuerySource[]> {
  try {
    // Generate embedding for the query
    const embedding = await generateQueryEmbedding(query);
    
    // Search for similar documents in the vector database
    const searchResponse = await fetch(`${VECTOR_SERVICE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        embedding,
        limit: 5,
        filter,
      }),
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Vector search failed: ${searchResponse.statusText}`);
    }
    
    const searchResults = await searchResponse.json();
    
    // Map results to QuerySource format
    const sources: QuerySource[] = searchResults.results.map((result: any) => ({
      documentId: result.payload.document_id,
      title: `Belge ${result.payload.document_id}`, // This would be fetched from the document metadata in a full implementation
      content: result.payload.content,
      score: result.score,
      metadata: result.payload.metadata || {},
    }));
    
    return sources;
  } catch (error) {
    console.error('Error retrieving relevant documents:', error);
    // Return empty sources on error
    return [];
  }
}