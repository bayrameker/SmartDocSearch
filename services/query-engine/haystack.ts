import { fetch } from 'undici';
import OpenAI from 'openai';
import { OPENAI_API_KEY, VECTOR_SERVICE_URL } from '../../config';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

/**
 * Extract query intent and entities using OpenAI
 * 
 * @param query User query
 * @returns Intent and entities
 */
export async function extractQueryIntentAndEntities(query: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: 
            "You are an expert AI assistant that analyzes queries. " +
            "Determine the intent of the query (choose one: fact_extraction, summary, explanation, comparison, opinion) " +
            "and extract relevant entities (people, places, organizations, dates, concepts). " +
            "Return your analysis as JSON with 'intent' and 'entities' fields."
        },
        {
          role: "user",
          content: query
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });
    
    const analysisText = response.choices[0].message.content;
    const analysis = JSON.parse(analysisText);
    
    return {
      intent: analysis.intent || 'fact_extraction',
      entities: analysis.entities || [],
    };
    
  } catch (error) {
    console.error('Error extracting query intent:', error);
    // Default to fact extraction if error
    return {
      intent: 'fact_extraction',
      entities: [],
    };
  }
}

/**
 * Query documents using RAG approach
 * 
 * @param query User query
 * @param userId User ID for filtering
 * @returns Answer and sources
 */
export async function queryWithRAG(query: string, userId?: number) {
  try {
    // Step 1: Retrieve relevant document chunks from vector database
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
        limit: 5,
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
    
    if (!vectorResponse.ok) {
      throw new Error(`Vector search failed: ${vectorResponse.statusText}`);
    }
    
    const vectorResults = await vectorResponse.json();
    const contextChunks = vectorResults.results.map((hit: any) => hit.payload.text);
    
    // Step 2: Generate answer using OpenAI with context
    const context = contextChunks.join('\n\n');
    
    const completionResponse = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: 
            "You are an expert AI assistant. Use ONLY the following context to answer the user's question. " +
            "If the answer is not contained within the context, say 'I don't have enough information to answer this question.' " +
            "Do not use any prior knowledge. Provide detailed answers based solely on the context provided."
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion: ${query}`
        }
      ],
      temperature: 0.3,
    });
    
    const answer = completionResponse.choices[0].message.content;
    
    // Prepare sources
    const sources = vectorResults.results.map((hit: any) => ({
      documentId: hit.payload.documentId,
      text: hit.payload.text.substring(0, 200) + '...',
      score: hit.score,
    }));
    
    return {
      answer,
      sources,
    };
    
  } catch (error) {
    console.error('RAG query error:', error);
    throw error;
  }
}
