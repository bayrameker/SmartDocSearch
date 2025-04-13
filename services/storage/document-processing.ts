import { ProcessDocumentRequest } from '../../shared/types';
import { DOCUMENT_PROCESSING_URL } from '../../config';

/**
 * Send document to processing service
 * 
 * @param data Document processing request data
 * @returns Processing response
 */
export async function sendToDocumentProcessing(data: ProcessDocumentRequest): Promise<any> {
  try {
    const response = await fetch(`${DOCUMENT_PROCESSING_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to send document for processing: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error sending document to processing service:', error);
    throw error;
  }
}

/**
 * Check document processing status
 * 
 * @param documentId Document ID
 * @returns Processing status
 */
export async function checkProcessingStatus(documentId: number): Promise<any> {
  try {
    const response = await fetch(`${DOCUMENT_PROCESSING_URL}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to check document processing status: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error checking document processing status:', error);
    throw error;
  }
}