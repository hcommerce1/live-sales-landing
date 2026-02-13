/**
 * Semantic Search Implementation
 *
 * Performs AI-powered semantic search using cosine similarity
 * on OpenAI embeddings stored in Redis.
 *
 * Features:
 * - Cosine similarity matching
 * - Keyword fallback for zero results
 * - Multilingual support (PL/EN)
 * - Configurable similarity threshold
 */

import { generateEmbedding } from '../openai';
import { getAllEmbeddings, type SearchResult, type EmbeddingRecord } from '../redis';

/**
 * Search options
 */
export interface SearchOptions {
  query: string;
  language?: 'pl' | 'en' | 'all';
  limit?: number;
  minSimilarity?: number;
}

/**
 * Calculate cosine similarity between two vectors
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Similarity score (0-1, where 1 is identical)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}

/**
 * Perform semantic search using embeddings
 *
 * @param options - Search configuration
 * @returns Array of search results sorted by similarity
 */
export async function semanticSearch(options: SearchOptions): Promise<SearchResult[]> {
  const {
    query,
    language = 'all',
    limit = 5,
    minSimilarity = 0.65,
  } = options;

  try {
    // Generate embedding for search query
    const queryEmbedding = await generateEmbedding(query);

    // Get all embeddings from Redis
    const allEmbeddings = await getAllEmbeddings(language);

    if (allEmbeddings.length === 0) {
      console.warn('[Search] No embeddings found in Redis');
      return [];
    }

    // Calculate similarity scores for all embeddings
    const results = allEmbeddings.map((record) => {
      const similarity = cosineSimilarity(queryEmbedding, record.embedding);

      return {
        slug: record.slug,
        lang: record.lang,
        postTitle: record.postTitle,
        description: record.description,
        sectionTitle: record.sectionTitle,
        url: record.url,
        similarity,
        excerpt: record.content.slice(0, 200) + '...',
      } as SearchResult;
    });

    // Sort by similarity (highest first)
    results.sort((a, b) => b.similarity - a.similarity);

    // Filter by minimum similarity threshold
    const filteredResults = results.filter((r) => r.similarity >= minSimilarity);

    // Return top N results
    return filteredResults.slice(0, limit);
  } catch (error) {
    console.error('[Search] Semantic search failed:', error);
    throw error;
  }
}

/**
 * Keyword-based fallback search
 * Used when semantic search returns no results
 *
 * @param query - Search query
 * @param language - Language filter
 * @returns Array of search results
 */
export async function keywordSearch(
  query: string,
  language: 'pl' | 'en' | 'all' = 'all'
): Promise<SearchResult[]> {
  try {
    const allEmbeddings = await getAllEmbeddings(language);
    const queryLower = query.toLowerCase();
    const keywords = queryLower.split(/\s+/);

    // Score each embedding based on keyword matches
    const results = allEmbeddings.map((record) => {
      const searchText = `${record.postTitle} ${record.description} ${record.content}`.toLowerCase();

      // Count keyword matches
      let matchCount = 0;
      for (const keyword of keywords) {
        if (searchText.includes(keyword)) {
          matchCount++;
        }
      }

      // Calculate pseudo-similarity score (0-1)
      const similarity = keywords.length > 0 ? matchCount / keywords.length : 0;

      return {
        slug: record.slug,
        lang: record.lang,
        postTitle: record.postTitle,
        description: record.description,
        sectionTitle: record.sectionTitle,
        url: record.url,
        similarity,
        excerpt: record.content.slice(0, 200) + '...',
      } as SearchResult;
    });

    // Filter and sort
    const filteredResults = results
      .filter((r) => r.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);

    return filteredResults.slice(0, 5);
  } catch (error) {
    console.error('[Search] Keyword search failed:', error);
    return [];
  }
}

/**
 * Search with automatic fallback
 * Tries semantic search first, falls back to keyword search if needed
 *
 * @param options - Search configuration
 * @returns Array of search results
 */
export async function searchWithFallback(options: SearchOptions): Promise<{
  results: SearchResult[];
  method: 'semantic' | 'keyword' | 'none';
}> {
  try {
    // Try semantic search first
    const semanticResults = await semanticSearch(options);

    if (semanticResults.length > 0) {
      return {
        results: semanticResults,
        method: 'semantic',
      };
    }

    // Fall back to keyword search
    console.log('[Search] Semantic search returned no results, trying keyword search');
    const keywordResults = await keywordSearch(options.query, options.language);

    if (keywordResults.length > 0) {
      return {
        results: keywordResults,
        method: 'keyword',
      };
    }

    // No results found
    return {
      results: [],
      method: 'none',
    };
  } catch (error) {
    console.error('[Search] Search with fallback failed:', error);

    // Last resort: try keyword search
    try {
      const keywordResults = await keywordSearch(options.query, options.language);
      return {
        results: keywordResults,
        method: 'keyword',
      };
    } catch {
      return {
        results: [],
        method: 'none',
      };
    }
  }
}

/**
 * Generate cache key for search results
 *
 * @param query - Search query
 * @param language - Language filter
 * @param limit - Result limit
 * @returns Cache key string
 */
export function generateCacheKey(
  query: string,
  language: string,
  limit: number
): string {
  const normalized = query.toLowerCase().trim();
  return `search:${language}:${limit}:${normalized}`;
}
