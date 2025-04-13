import OpenAI from 'openai';
import { OPENAI_API_KEY, OPENAI_EMBEDDING_MODEL } from '../../config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Generate embeddings for text inputs
 * 
 * @param inputs Array of text inputs
 * @returns Array of embeddings (vectors)
 */
export async function generateEmbeddings(inputs: string[]): Promise<number[][]> {
  try {
    if (inputs.length === 0) {
      return [];
    }
    
    // Filter out empty inputs
    const validInputs = inputs.filter(input => input.trim().length > 0);
    
    if (validInputs.length === 0) {
      return [];
    }
    
    // Generate embeddings using OpenAI
    const response = await openai.embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: validInputs,
    });
    
    // Extract and return embeddings
    return response.data.map(item => item.embedding);
    
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw new Error(`Failed to generate embeddings: ${error.message}`);
  }
}
