import { QdrantClient } from '@qdrant/js-client-rest';
import { QDRANT_URL, QDRANT_API_KEY } from '../../config';

// Initialize Qdrant client
const client = new QdrantClient({
  url: QDRANT_URL,
  apiKey: QDRANT_API_KEY || undefined,
});

/**
 * Initialize Qdrant connection
 */
export async function initializeQdrant() {
  try {
    // Check connection by retrieving collections
    await client.getCollections();
    console.log('Connected to Qdrant');
    
  } catch (error) {
    console.error('Qdrant connection error:', error);
    throw new Error(`Failed to connect to Qdrant: ${error.message}`);
  }
}

/**
 * Create a new collection
 * 
 * @param options Collection options
 */
export async function createCollection(options: {
  name: string;
  dimension: number;
}) {
  try {
    await client.createCollection(options.name, {
      vectors: {
        size: options.dimension,
        distance: 'Cosine',
      },
      optimizers_config: {
        default_segment_number: 2,
      },
      replication_factor: 1,
    });
    
    console.log(`Created collection ${options.name}`);
    
  } catch (error) {
    console.error(`Error creating collection ${options.name}:`, error);
    throw new Error(`Failed to create collection: ${error.message}`);
  }
}

/**
 * Check if collection exists
 * 
 * @param name Collection name
 * @returns Whether the collection exists
 */
export async function getCollection(name: string) {
  try {
    const collections = await client.getCollections();
    return collections.collections.some(c => c.name === name);
    
  } catch (error) {
    console.error(`Error checking collection ${name}:`, error);
    throw new Error(`Failed to check collection: ${error.message}`);
  }
}

/**
 * Add vectors to a collection
 * 
 * @param collection Collection name
 * @param points Points to add
 */
export async function addVectors(collection: string, points: any[]) {
  try {
    await client.upsert(collection, {
      wait: true,
      points,
    });
    
    console.log(`Added ${points.length} vectors to collection ${collection}`);
    
  } catch (error) {
    console.error(`Error adding vectors to collection ${collection}:`, error);
    throw new Error(`Failed to add vectors: ${error.message}`);
  }
}

/**
 * Search vectors in a collection
 * 
 * @param collection Collection name
 * @param vector Query vector
 * @param limit Maximum number of results
 * @param filter Optional filter
 * @returns Search results
 */
export async function searchVectors(
  collection: string,
  vector: number[],
  limit: number = 5,
  filter?: any
) {
  try {
    const searchParams: any = {
      vector,
      limit,
    };
    
    if (filter) {
      searchParams.filter = filter;
    }
    
    const results = await client.search(collection, searchParams);
    
    return results.map(result => ({
      id: result.id,
      score: result.score,
      payload: result.payload,
    }));
    
  } catch (error) {
    console.error(`Error searching vectors in collection ${collection}:`, error);
    throw new Error(`Failed to search vectors: ${error.message}`);
  }
}

/**
 * Delete vectors from a collection
 * 
 * @param collection Collection name
 * @param ids Vector IDs to delete
 */
export async function deleteVectors(collection: string, ids: string[]) {
  try {
    await client.delete(collection, {
      wait: true,
      points: ids,
    });
    
    console.log(`Deleted ${ids.length} vectors from collection ${collection}`);
    
  } catch (error) {
    console.error(`Error deleting vectors from collection ${collection}:`, error);
    throw new Error(`Failed to delete vectors: ${error.message}`);
  }
}
