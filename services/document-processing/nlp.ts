import * as spacy from 'spacy';
import { OPENAI_API_KEY } from '../../config';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

let nlp: any = null;

/**
 * Initialize spaCy model
 */
async function initializeSpacy() {
  if (!nlp) {
    try {
      // Load the English model
      nlp = await spacy.load('en_core_web_sm');
    } catch (error) {
      console.error('Failed to load spaCy model:', error);
      throw new Error('NLP initialization failed');
    }
  }
  return nlp;
}

/**
 * Extract entities and other NLP features from text
 * 
 * @param text Document text to analyze
 * @returns NLP analysis results
 */
export async function extractEntities(text: string) {
  try {
    // Use spaCy for basic NLP processing
    const nlp = await initializeSpacy();
    const doc = await nlp(text.substring(0, 100000)); // Limit text length for performance
    
    // Extract entities
    const entities = [];
    for (const ent of doc.ents) {
      entities.push({
        text: ent.text,
        label: ent.label_,
        start: ent.start_char,
        end: ent.end_char
      });
    }
    
    // Generate a summary using OpenAI
    let summary = '';
    try {
      // Extract a smaller portion for summarization
      const textToSummarize = text.length > 8000 ? text.substring(0, 8000) : text;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert document summarizer. Provide a concise summary of the following document."
          },
          {
            role: "user",
            content: textToSummarize
          }
        ],
        max_tokens: 500,
      });
      
      summary = response.choices[0].message.content;
    } catch (error) {
      console.error('Failed to generate summary with OpenAI:', error);
      summary = 'Summary generation failed';
    }
    
    // Extract keywords (using noun chunks as a simple approach)
    const keywords = Array.from(doc.noun_chunks).map(chunk => chunk.text).slice(0, 20);
    
    return {
      entities,
      summary,
      keywords,
      // Other NLP features can be added here
    };
    
  } catch (error) {
    console.error('Error in NLP processing:', error);
    throw new Error('NLP processing failed: ' + error.message);
  }
}
