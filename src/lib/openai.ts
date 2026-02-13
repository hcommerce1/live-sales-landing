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
