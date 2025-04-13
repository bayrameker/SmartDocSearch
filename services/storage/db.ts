import { db } from '../../server/db';
import { documents, type InsertDocument } from '../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Create a new document record in the database
 * 
 * @param documentData Document data to insert
 * @returns Created document
 */
export async function createDocument(documentData: InsertDocument) {
  try {
    const [newDocument] = await db.insert(documents)
      .values(documentData)
      .returning();
    
    return newDocument;
  } catch (error) {
    console.error('Error creating document record:', error);
    throw error;
  }
}

/**
 * Get document by ID
 * 
 * @param documentId Document ID
 * @returns Document or undefined if not found
 */
export async function getDocumentById(documentId: number) {
  try {
    const [document] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId));
    
    return document;
  } catch (error) {
    console.error('Error getting document by ID:', error);
    throw error;
  }
}

/**
 * Get documents by user ID
 * 
 * @param userId User ID
 * @param limit Result limit
 * @param offset Result offset
 * @returns Documents belonging to the user
 */
export async function getDocumentsByUserId(userId: number, limit = 10, offset = 0) {
  try {
    const results = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, userId))
      .limit(limit)
      .offset(offset)
      .orderBy(documents.createdAt);
    
    return results;
  } catch (error) {
    console.error('Error getting documents by user ID:', error);
    throw error;
  }
}

/**
 * Update document status
 * 
 * @param documentId Document ID
 * @param status New status
 * @returns Updated document
 */
export async function updateDocumentStatus(documentId: number, status: string) {
  try {
    const [updatedDocument] = await db
      .update(documents)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(documents.id, documentId))
      .returning();
    
    return updatedDocument;
  } catch (error) {
    console.error('Error updating document status:', error);
    throw error;
  }
}

/**
 * Update document metadata
 * 
 * @param documentId Document ID
 * @param metadata Document metadata
 * @returns Updated document
 */
export async function updateDocumentMetadata(documentId: number, metadata: any) {
  try {
    const [updatedDocument] = await db
      .update(documents)
      .set({ 
        metadata,
        updatedAt: new Date()
      })
      .where(eq(documents.id, documentId))
      .returning();
    
    return updatedDocument;
  } catch (error) {
    console.error('Error updating document metadata:', error);
    throw error;
  }
}

/**
 * Delete document by ID
 * 
 * @param documentId Document ID
 * @returns Whether the document was deleted
 */
export async function deleteDocumentById(documentId: number) {
  try {
    const [deletedDocument] = await db
      .delete(documents)
      .where(eq(documents.id, documentId))
      .returning();
    
    return !!deletedDocument;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}