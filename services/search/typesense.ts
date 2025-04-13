import Typesense from 'typesense';
import { TYPESENSE_HOST, TYPESENSE_PORT, TYPESENSE_PROTOCOL, TYPESENSE_API_KEY } from '../../config';

// Create Typesense client
const typesenseClient = new Typesense.Client({
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: TYPESENSE_PORT,
      protocol: TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10,
  retryIntervalSeconds: 0.1,
});

/**
 * Initialize Typesense connection and create necessary collections
 */
export async function initializeTypesense() {
  try {
    console.log('Connecting to Typesense...');
    
    // Check if the documents collection exists, if not create it
    try {
      await typesenseClient.collections('documents').retrieve();
      console.log('Documents collection already exists in Typesense');
    } catch (err) {
      console.log('Creating documents collection in Typesense');
      
      // Create documents collection schema
      const documentsSchema = {
        name: 'documents',
        fields: [
          { name: 'id', type: 'int32' },
          { name: 'user_id', type: 'int32' },
          { name: 'title', type: 'string' },
          { name: 'text_content', type: 'string' },
          { name: 'filename', type: 'string' },
          { name: 'mime_type', type: 'string' },
          { name: 'created_at', type: 'int64' },
          { name: 'author', type: 'string', optional: true },
          { name: 'page_count', type: 'int32', optional: true },
          { name: 'language', type: 'string', optional: true },
        ],
        default_sorting_field: 'created_at',
      };
      
      await typesenseClient.collections().create(documentsSchema);
      console.log('Documents collection created in Typesense');
    }
    
    console.log('Connected to Typesense successfully');
    return typesenseClient;
  } catch (error) {
    console.error('Failed to initialize Typesense:', error);
    throw error;
  }
}

/**
 * Index a document in Typesense
 * 
 * @param document The document to index
 * @returns The indexed document
 */
export async function indexDocument(document: any) {
  try {
    return await typesenseClient.collections('documents').documents().create(document);
  } catch (error) {
    console.error('Error indexing document in Typesense:', error);
    throw error;
  }
}

/**
 * Search for documents in Typesense
 * 
 * @param searchParameters The search parameters
 * @returns Search results
 */
export async function searchDocuments(searchParameters: any) {
  try {
    return await typesenseClient.collections('documents').documents().search(searchParameters);
  } catch (error) {
    console.error('Error searching documents in Typesense:', error);
    throw error;
  }
}

/**
 * Delete a document from Typesense
 * 
 * @param documentId The ID of the document to delete
 * @returns Result of the deletion operation
 */
export async function deleteDocument(documentId: string) {
  try {
    return await typesenseClient.collections('documents').documents(documentId).delete();
  } catch (error) {
    console.error(`Error deleting document ${documentId} from Typesense:`, error);
    throw error;
  }
}

export default typesenseClient;