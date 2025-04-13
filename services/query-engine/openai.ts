import { fetch } from 'undici';
import OpenAI from 'openai';
import { OPENAI_API_KEY, VECTOR_SERVICE_URL } from '../../config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Query using OpenAI with context from user's documents
 * 
 * @param query User query
 * @param userId User ID for filtering
 * @returns Answer and sources
 */
export async function queryWithOpenAI(query: string, userId?: number) {
  try {
    // Step 1: Retrieve some relevant document chunks for context
    const collectionName = userId ? `user_${userId}_docs` : 'all_docs';
    
    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query,
    });
    
    const queryVector = embeddingResponse.data[0].embedding;
    
    // Search vector database
    const vectorResponse = await fetch(`${VECTOR_SERVICE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        collection: collectionName,
        query,
        vector: queryVector,
        limit: 3, // Fewer chunks for general questions
        filter: userId ? {
          must: [
            {
              key: 'payload.metadata.userId',
              match: {
                value: userId.toString(),
              },
            },
          ],
        } : undefined,
      }),
    });
    
    // Handle case where vector search fails (e.g., collection doesn't exist)
    let context = '';
    let sources = [];
    
    if (vectorResponse.ok) {
      const vectorResults = await vectorResponse.json();
      if (vectorResults.results && vectorResults.results.length > 0) {
        const contextChunks = vectorResults.results.map((hit: any) => hit.payload.text);
        context = contextChunks.join('\n\n');
        
        // Prepare sources
        sources = vectorResults.results.map((hit: any) => ({
          documentId: hit.payload.documentId,
          text: hit.payload.text.substring(0, 200) + '...',
          score: hit.score,
        }));
      }
    }
    
    // Step 2: Generate answer using OpenAI with or without context
    const messages = [
      {
        role: "system",
        content: "You are an expert AI assistant that helps users with their documents and answers questions. Use your knowledge and the context provided (if any) to provide helpful, accurate responses."
      }
    ];
    
    if (context) {
      messages.push({
        role: "user",
        content: `I have some documents with the following information:\n${context}\n\nBased on this context and your knowledge, please answer: ${query}`
      });
    } else {
      messages.push({
        role: "user",
        content: query
      });
    }
    
    const completionResponse = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages,
      temperature: 0.5,
    });
    
    const answer = completionResponse.choices[0].message.content;
    
    return {
      answer,
      sources,
    };
    
  } catch (error) {
    console.error('OpenAI query error:', error);
    throw error;
  }
}
