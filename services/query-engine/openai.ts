import OpenAI from 'openai';
import { OPENAI_API_KEY, OPENAI_COMPLETION_MODEL } from '../../config';
import { QuerySource } from '../../shared/types';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

/**
 * Generate answer using OpenAI given a query and relevant documents
 * 
 * @param query The user query
 * @param sources The relevant document sources
 * @returns Generated answer
 */
export async function generateAnswer(query: string, sources: QuerySource[]): Promise<string> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    
    // Prepare context from sources
    const context = sources.map(source => {
      return `Document: ${source.title}
Content: ${source.content}
---`;
    }).join('\n');
    
    // Prepare prompt
    const systemPrompt = `Sen bir Türkçe dil destekli belge sorgu motorusun. 
Belgelerdeki bilgiye dayanarak kullanıcının sorularını doğru ve açık bir şekilde yanıtla.
Yanıtın aşağıdaki belgelerde bulunan bilgilere dayanmalıdır.
Belge içeriğinde bulunan bilgilere dayanarak yanıt ver. 
Eğer yanıt belgelerde bulunmuyorsa, "Bu sorunun yanıtı mevcut belgelerde bulunmuyor" diye belirt.
Yanıtları biçimlendirmek için Markdown kullanabilirsin.`;

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: OPENAI_COMPLETION_MODEL, // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Sorgu: ${query}\n\nKaynaklar:\n${context}` }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });
    
    return response.choices[0].message.content || 'Yanıt üretilirken bir hata oluştu.';
  } catch (error) {
    console.error('Error generating answer:', error);
    return 'Üzgünüm, yanıt üretilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
  }
}