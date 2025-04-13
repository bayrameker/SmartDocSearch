import fetch from 'node-fetch';
import { QDRANT_URL, QDRANT_API_KEY } from '../../config';

/**
 * Initialize Qdrant connection and create necessary collections
 */
export async function initializeQdrant() {
  try {
    console.log('Connecting to Qdrant...');
    
    // Check if documents collection exists, if not create it
    const collectionsResponse = await fetch(`${QDRANT_URL}/collections`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(QDRANT_API_KEY && { 'api-key': QDRANT_API_KEY }),
      },
    });
    
    if (!collectionsResponse.ok) {
      throw new Error(`Failed to fetch collections: ${collectionsResponse.statusText}`);
    }
    
    const collections = await collectionsResponse.json();
    const documentsCollectionExists = collections.result?.collections?.some(
      (collection: any) => collection.name === 'documents'
    );
    
    if (!documentsCollectionExists) {
      console.log('Creating documents collection in Qdrant');
      
      // Create documents collection
      const createResponse = await fetch(`${QDRANT_URL}/collections/documents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(QDRANT_API_KEY && { 'api-key': QDRANT_API_KEY }),
        },
        body: JSON.stringify({
          vectors: {
            size: 1536, // Size of OpenAI embeddings
            distance: 'Cosine',
          },
          optimizers_config: {
            default_segment_number: 2,
          },
        }),
      });
      
      if (!createResponse.ok) {
        throw new Error(`Failed to create collection: ${createResponse.statusText}`);
      }
      
      console.log('Documents collection created in Qdrant');
    } else {
      console.log('Documents collection already exists in Qdrant');
    }
    
    console.log('Connected to Qdrant successfully');
  } catch (error) {
    console.error('Failed to initialize Qdrant:', error);
    throw error;
  }
}

/**
 * Store embeddings in Qdrant
 * 
 * @param documentId Document ID
 * @param chunkId Chunk ID
 * @param embedding Embedding vector
 * @param metadata Additional metadata
 * @returns ID of the stored vector
 */
export async function storeEmbedding(documentId: number, chunkId: number, embedding: number[], metadata: any = {}) {
  try {
    const pointId = `${documentId}-${chunkId}`;
    
    const response = await fetch(`${QDRANT_URL}/collections/documents/points`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(QDRANT_API_KEY && { 'api-key': QDRANT_API_KEY }),
      },
      body: JSON.stringify({
        points: [
          {
            id: pointId,
            vector: embedding,
            payload: {
              document_id: documentId,
              chunk_id: chunkId,
              ...metadata,
            },
          },
        ],
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to store embedding: ${response.statusText}`);
    }
    
    return pointId;
  } catch (error) {
    console.error(`Error storing embedding for document ${documentId}, chunk ${chunkId}:`, error);
    throw error;
  }
}

/**
 * Search for similar vectors in Qdrant
 * 
 * @param embedding Query embedding vector
 * @param limit Maximum number of results to return
 * @param filter Optional filter criteria
 * @returns Search results
 */
export async function searchSimilar(embedding: number[], limit: number = 5, filter: any = null) {
  try {
    const searchBody: any = {
      vector: embedding,
      limit,
    };
    
    if (filter) {
      searchBody.filter = filter;
    }
    
    const response = await fetch(`${QDRANT_URL}/collections/documents/points/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(QDRANT_API_KEY && { 'api-key': QDRANT_API_KEY }),
      },
      body: JSON.stringify(searchBody),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to search similar vectors: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.result;
  } catch (error) {
    console.error('Error searching similar vectors:', error);
    throw error;
  }
}