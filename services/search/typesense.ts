import Typesense from 'typesense';
import {
  TYPESENSE_HOST,
  TYPESENSE_PORT,
  TYPESENSE_PROTOCOL,
  TYPESENSE_API_KEY
} from '../../config';

// Initialize Typesense client
const client = new Typesense.Client({
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: TYPESENSE_PORT,
      protocol: TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10,
});

// Define the documents collection schema
const documentsSchema = {
  name: 'documents',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'userId', type: 'int32' },
    { name: 'title', type: 'string' },
    { name: 'content', type: 'string' },
    { name: 'createdAt', type: 'int64' },
    { name: 'updatedAt', type: 'int64' },
    // Additional metadata fields
    { name: 'author', type: 'string', optional: true },
    { name: 'keywords', type: 'string[]', optional: true },
  ],
  default_sorting_field: 'updatedAt',
};

/**
 * Initialize Typesense with the required collections
 */
export async function initializeTypesense() {
  try {
    // Check if collection exists
    const collections = await client.collections().retrieve();
    const exists = collections.some(collection => collection.name === documentsSchema.name);
    
    if (!exists) {
      // Create the collection if it doesn't exist
      await client.collections().create(documentsSchema);
      console.log('Created documents collection in Typesense');
    } else {
      console.log('Documents collection already exists in Typesense');
    }
    
  } catch (error) {
    console.error('Typesense initialization error:', error);
    throw new Error(`Failed to initialize Typesense: ${error.message}`);
  }
}

/**
 * Create or update the document index in Typesense
 * 
 * @param document Document data to index
 * @returns Typesense document ID
 */
export async function updateDocument(document: {
  id: string | number;
  userId: string | number;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}) {
  try {
    const now = Date.now();
    
    // Extract keywords from metadata if available
    const keywords = document.metadata?.keywords || [];
    
    // Prepare document for Typesense
    const typesenseDocument = {
      id: document.id.toString(),
      userId: parseInt(document.userId.toString()),
      title: document.title,
      content: document.content,
      createdAt: now,
      updatedAt: now,
      author: document.metadata?.Author || '',
      keywords,
    };
    
    // Upsert the document (create or update)
    const result = await client.collections('documents').documents().upsert(typesenseDocument);
    
    return result.id;
    
  } catch (error) {
    console.error('Error updating document in Typesense:', error);
    throw new Error(`Failed to update document in search index: ${error.message}`);
  }
}

/**
 * Search for documents in Typesense
 * 
 * @param query Search query
 * @param filters Optional filters (e.g., userId:123)
 * @param page Page number
 * @param limit Results per page
 * @returns Search results
 */
export async function searchDocuments(
  query: string,
  filters: string = '',
  page: number = 1,
  limit: number = 10
) {
  try {
    const searchParameters = {
      q: query,
      query_by: 'title,content',
      filter_by: filters,
      sort_by: 'updatedAt:desc',
      page,
      per_page: limit,
      highlight_full_fields: 'content,title',
      highlight_affix_num_tokens: 20,
    };
    
    const results = await client.collections('documents').documents().search(searchParameters);
    
    return {
      hits: results.hits.map(hit => ({
        id: hit.document.id,
        userId: hit.document.userId,
        title: hit.document.title,
        highlight: hit.highlights[0]?.snippet || hit.document.content.substring(0, 200),
        score: hit.text_match,
        metadata: {
          author: hit.document.author,
          keywords: hit.document.keywords,
        },
      })),
      page: results.page,
      totalHits: results.found,
      totalPages: Math.ceil(results.found / limit),
    };
    
  } catch (error) {
    console.error('Typesense search error:', error);
    throw new Error(`Search failed: ${error.message}`);
  }
}

/**
 * Delete a document from the Typesense index
 * 
 * @param documentId ID of the document to delete
 */
export async function deleteDocument(documentId: string | number) {
  try {
    await client.collections('documents').documents(documentId.toString()).delete();
  } catch (error) {
    console.error('Error deleting document from Typesense:', error);
    throw new Error(`Failed to delete document from search index: ${error.message}`);
  }
}

/**
 * Create a new document index (not typically needed as updateDocument performs upserts)
 * This is mainly for direct API use
 * 
 * @param document Document data
 * @returns Typesense document ID
 */
export async function createDocumentIndex(document: {
  id: string | number;
  userId: string | number;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}) {
  return updateDocument(document);
}
