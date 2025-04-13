import fetch from 'node-fetch';
import { DOCUMENT_PROCESSING_URL } from '../../config';
import { ProcessDocumentRequest } from '../../shared/types';

/**
 * Send a document to the document processing service
 * 
 * @param params Document processing parameters
 */
export async function sendToDocumentProcessing(params: ProcessDocumentRequest): Promise<void> {
  try {
    const response = await fetch(`${DOCUMENT_PROCESSING_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Document processing service returned error: ${errorData.error || response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Document ${params.documentId} sent to processing service:`, data);
  } catch (error) {
    console.error(`Error sending document ${params.documentId} to processing service:`, error);
    throw error;
  }
}