/**
 * OpenAI API Integration
 *
 * Provides embeddings generation for semantic search.
 * Uses text-embedding-3-small model for cost-effectiveness.
 *
 * Cost: ~$0.02 per 1M tokens
 */

import OpenAI from 'openai';

// Initialize OpenAI client with config
// Support both import.meta.env (Astro/Vite) and process.env (Node.js)
const apiKey = typeof import.meta !== 'undefined' && import.meta.env?.OPENAI_API_KEY
  ? import.meta.env.OPENAI_API_KEY
  : process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey,
  timeout: 30000, // 30 seconds
  maxRetries: 2,
});

/**
 * Generate embedding vector for given text
 *
 * @param text - Text to generate embedding for
 * @returns Array of 1536 numbers representing the embedding vector
 * @throws Error if API call fails
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error: any) {
    // Handle specific error cases
    if (error?.status === 401) {
      throw new Error('Invalid OpenAI API key. Check OPENAI_API_KEY in .env');
    }

    if (error?.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    }

    if (error?.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to OpenAI API. Check your internet connection.');
    }

    // Generic error
    console.error('[OpenAI Error]', error);
    throw new Error(`OpenAI embedding generation failed: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * More efficient than calling generateEmbedding() in a loop
 *
 * @param texts - Array of texts to generate embeddings for
 * @returns Array of embedding vectors
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map(item => item.embedding);
  } catch (error: any) {
    console.error('[OpenAI Batch Error]', error);
    throw new Error(`OpenAI batch embedding generation failed: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Generate contextual search summaries using GPT-4o-mini
 *
 * For each search result, generates a 1-sentence description
 * explaining why the article is relevant to the user's query.
 */
export async function generateSearchSummaries(
  query: string,
  results: Array<{ postTitle: string; sectionTitle?: string; content: string }>
): Promise<string[]> {
  if (results.length === 0) return [];

  const articles = results.map((r, i) =>
    `[${i + 1}] "${r.postTitle}"${r.sectionTitle ? ` (sekcja: ${r.sectionTitle})` : ''}\nTreść: ${r.content.slice(0, 300)}`
  ).join('\n\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 200,
      messages: [{
        role: 'system',
        content: 'Jesteś asystentem wyszukiwarki blogów. Dla każdego artykułu napisz JEDNO krótkie zdanie (max 15 słów) wyjaśniające co czytelnik znajdzie w artykule w kontekście zapytania. Odpowiedz w formacie: 1. zdanie\n2. zdanie\nitd. Pisz po polsku, zachęcająco.'
      }, {
        role: 'user',
        content: `Zapytanie: "${query}"\n\nArtykuły:\n${articles}`
      }],
    });

    const text = response.choices[0]?.message?.content || '';
    const lines = text.split('\n').filter(l => l.trim());

    return results.map((_, i) => {
      const line = lines.find(l => l.startsWith(`${i + 1}.`));
      return line ? line.replace(/^\d+\.\s*/, '').trim() : '';
    });
  } catch (error) {
    console.error('[OpenAI] Summary generation failed:', error);
    return results.map(() => '');
  }
}

/**
 * Get estimated token count for text
 * Rough approximation: 1 token ≈ 4 characters
 *
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate cost for embedding generation
 *
 * @param tokenCount - Number of tokens
 * @returns Cost in USD
 */
export function calculateEmbeddingCost(tokenCount: number): number {
  const costPerMillionTokens = 0.02; // $0.02 per 1M tokens
  return (tokenCount / 1_000_000) * costPerMillionTokens;
}
