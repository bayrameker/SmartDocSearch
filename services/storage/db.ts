import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, sql } from 'drizzle-orm';
import ws from 'ws';
import { DATABASE_URL } from '../../config';
import * as schema from '../../shared/schema';

// Configuration for Neon serverless Postgres
const neonConfig = {
  webSocketConstructor: ws,
};

// Create database pool and connection
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle(pool, { schema });

/**
 * Initialize the database connection and ensure tables exist
 */
export async function initializeDatabase() {
  try {
    // Check connection by running a simple query
    const result = await pool.query('SELECT 1');
    
    if (result.rows[0]['?column?'] === 1) {
      console.log('Database connection successful');
    }
    
    // Note: In a production environment, you would use proper migrations
    // instead of this simple check. For this example, we're assuming
    // the schema already exists or will be created externally.
    
  } catch (error) {
    console.error('Database initialization error:', error);
    throw new Error(`Failed to initialize database: ${error.message}`);
  }
}

/**
 * Save document metadata to database
 * 
 * @param documentData Document metadata to save
 * @returns Saved document
 */
export async function saveDocumentMetadata(documentData: {
  userId: number;
  title: string;
  filename: string;
  mimeType: string;
  storageKey: string;
}) {
  try {
    const [document] = await db
      .insert(schema.documents)
      .values({
        userId: documentData.userId,
        title: documentData.title,
        filename: documentData.filename,
        mimeType: documentData.mimeType,
        storageKey: documentData.storageKey,
        status: 'processing',
      })
      .returning();
    
    return document;
    
  } catch (error) {
    console.error('Error saving document metadata:', error);
    throw new Error(`Failed to save document metadata: ${error.message}`);
  }
}

/**
 * Get document by ID
 * 
 * @param id Document ID
 * @returns Document or undefined if not found
 */
export async function getDocument(id: number) {
  try {
    const [document] = await db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, id));
    
    return document;
    
  } catch (error) {
    console.error('Error getting document:', error);
    throw new Error(`Failed to get document: ${error.message}`);
  }
}

/**
 * List documents with pagination
 * 
 * @param userId Optional user ID to filter by
 * @param page Page number
 * @param limit Results per page
 * @returns List of documents and total count
 */
export async function listDocuments(
  userId?: number,
  page: number = 1,
  limit: number = 10
) {
  try {
    const offset = (page - 1) * limit;
    
    let query = db.select().from(schema.documents);
    
    if (userId) {
      query = query.where(eq(schema.documents.userId, userId));
    }
    
    const documents = await query
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${schema.documents.createdAt} desc`);
    
    // Count total documents
    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(schema.documents)
      .where(userId ? eq(schema.documents.userId, userId) : undefined);
    
    return {
      documents,
      total: count,
    };
    
  } catch (error) {
    console.error('Error listing documents:', error);
    throw new Error(`Failed to list documents: ${error.message}`);
  }
}

/**
 * Update document status
 * 
 * @param id Document ID
 * @param status New status
 * @returns Updated document or undefined if not found
 */
export async function updateDocumentStatus(id: number, status: string) {
  try {
    const [document] = await db
      .update(schema.documents)
      .set({ 
        status,
        updatedAt: new Date(),
      })
      .where(eq(schema.documents.id, id))
      .returning();
    
    return document;
    
  } catch (error) {
    console.error('Error updating document status:', error);
    throw new Error(`Failed to update document status: ${error.message}`);
  }
}

/**
 * Delete document from database
 * 
 * @param id Document ID
 */
export async function deleteDocument(id: number) {
  try {
    await db
      .delete(schema.documents)
      .where(eq(schema.documents.id, id));
    
  } catch (error) {
    console.error('Error deleting document:', error);
    throw new Error(`Failed to delete document: ${error.message}`);
  }
}
