/**
 * Semantic Search Implementation
 *
 * Performs AI-powered semantic search using cosine similarity
 * on OpenAI embeddings stored in a JSON file (generated at build time).
 *
 * Features:
 * - Cosine similarity matching
 * - Keyword fallback for zero results
 * - Multilingual support (PL/EN)
 * - Configurable similarity threshold
 */

import { generateEmbedding, generateSearchSummaries } from '../openai';
import embeddingsData from '../../data/embeddings.json';

/**
 * Polish stop words — common words that match everything and add noise to keyword search.
 */
const PL_STOP_WORDS = new Set([
  'i', 'w', 'na', 'z', 'do', 'o', 'się', 'nie', 'to', 'jak', 'co', 'jest',
  'za', 'że', 'od', 'po', 'ale', 'czy', 'lub', 'tak', 'te', 'ten', 'ta',
  'tym', 'tego', 'tej', 'tych', 'który', 'która', 'które', 'już', 'tylko',
  'przez', 'przy', 'dla', 'ze', 'ich', 'go', 'być', 'ma', 'są', 'może',
  'będzie', 'został', 'aby', 'też', 'więc', 'jako', 'przed', 'nad', 'pod',
  'między', 'bardzo', 'bez', 'tu', 'tam', 'gdy', 'gdzie', 'kiedy', 'a',
]);

interface EmbeddingRecord {
  slug: string;
  lang: 'pl' | 'en';
  postTitle: string;
  description: string;
  sectionTitle?: string;
  content: string;
  url: string;
  embedding: number[];
}

export interface SearchResult {
  slug: string;
  lang: 'pl' | 'en';
  postTitle: string;
  description: string;
  sectionTitle?: string;
  url: string;
  similarity: number;
  excerpt?: string;
}

export interface SearchOptions {
  query: string;
  language?: 'pl' | 'en' | 'all';
  limit?: number;
  minSimilarity?: number;
}

/**
 * Get all embeddings, optionally filtered by language
 */
function getAllEmbeddings(language: 'pl' | 'en' | 'all' = 'all'): EmbeddingRecord[] {
  const data = embeddingsData as EmbeddingRecord[];
  if (language === 'all') return data;
  return data.filter(r => r.lang === language);
}

/**
 * Calculate cosine similarity between two vectors
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
  return magnitude === 0 ? 0 : dotProduct / magnitude;
}

/**
 * Perform semantic search using embeddings
 */
export async function semanticSearch(options: SearchOptions): Promise<SearchResult[]> {
  const {
    query,
    language = 'all',
    limit = 5,
    minSimilarity = 0.72,
  } = options;

  const allEmbeddings = getAllEmbeddings(language);

  if (allEmbeddings.length === 0) {
    console.warn('[Search] No embeddings found');
    return [];
  }

  // Generate embedding for search query
  const queryEmbedding = await generateEmbedding(query);

  const results = allEmbeddings.map((record) => ({
    slug: record.slug,
    lang: record.lang,
    postTitle: record.postTitle,
    description: record.description,
    sectionTitle: record.sectionTitle,
    url: record.url,
    similarity: cosineSimilarity(queryEmbedding, record.embedding),
    excerpt: record.content.slice(0, 200) + '...',
  }));

  results.sort((a, b) => b.similarity - a.similarity);

  // Deduplicate: keep only the best-matching chunk per post
  const seen = new Set<string>();
  const unique = results.filter(r => {
    const key = `${r.lang}:${r.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.filter(r => r.similarity >= minSimilarity).slice(0, limit);
}

/**
 * Keyword-based fallback search
 */
export async function keywordSearch(
  query: string,
  language: 'pl' | 'en' | 'all' = 'all'
): Promise<SearchResult[]> {
  const allEmbeddings = getAllEmbeddings(language);
  const queryLower = query.toLowerCase();

  // Filter out stop words and very short tokens — they match everything
  const keywords = queryLower
    .split(/\s+/)
    .filter(k => k.length >= 3 && !PL_STOP_WORDS.has(k));

  // If all keywords were stop words, skip keyword search entirely
  if (keywords.length === 0) return [];

  const results = allEmbeddings.map((record) => {
    const searchText = `${record.postTitle} ${record.description} ${record.content}`.toLowerCase();
    let matchCount = 0;
    for (const keyword of keywords) {
      if (searchText.includes(keyword)) matchCount++;
    }
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
    };
  });

  // Require at least 40% of meaningful keywords to match
  const MIN_KEYWORD_MATCH = 0.4;

  const sorted = results
    .filter(r => r.similarity >= MIN_KEYWORD_MATCH)
    .sort((a, b) => b.similarity - a.similarity);

  // Deduplicate: keep only the best-matching chunk per post
  const seen = new Set<string>();
  const unique = sorted.filter(r => {
    const key = `${r.lang}:${r.slug}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, 5);
}

/**
 * Enrich results with GPT-generated contextual summaries
 */
async function enrichWithSummaries(query: string, results: SearchResult[]): Promise<SearchResult[]> {
  if (results.length === 0) return results;

  // Get content for each result from embeddings data — match by sectionTitle to get the right chunk
  const allData = embeddingsData as EmbeddingRecord[];
  const resultsWithContent = results.map(r => {
    const match = r.sectionTitle
      ? allData.find(d => d.slug === r.slug && d.lang === r.lang && d.sectionTitle === r.sectionTitle)
      : allData.find(d => d.slug === r.slug && d.lang === r.lang && !d.sectionTitle);
    const finalMatch = match || allData.find(d => d.slug === r.slug && d.lang === r.lang);
    return {
      postTitle: r.postTitle,
      sectionTitle: r.sectionTitle,
      content: finalMatch?.content || r.excerpt || '',
    };
  });

  const summaries = await generateSearchSummaries(query, resultsWithContent);

  return results.map((r, i) => ({
    ...r,
    excerpt: summaries[i] || r.description,
  }));
}

/**
 * Search with automatic fallback
 */
export async function searchWithFallback(options: SearchOptions): Promise<{
  results: SearchResult[];
  method: 'semantic' | 'keyword' | 'none';
}> {
  try {
    const semanticResults = await semanticSearch(options);
    if (semanticResults.length > 0) {
      const enriched = await enrichWithSummaries(options.query, semanticResults);
      return { results: enriched, method: 'semantic' };
    }

    console.log('[Search] Semantic search returned no results, trying keyword search');
    const keywordResults = await keywordSearch(options.query, options.language);
    if (keywordResults.length > 0) {
      const enriched = await enrichWithSummaries(options.query, keywordResults);
      return { results: enriched, method: 'keyword' };
    }

    return { results: [], method: 'none' };
  } catch (error) {
    console.error('[Search] Search with fallback failed:', error);

    try {
      const keywordResults = await keywordSearch(options.query, options.language);
      return { results: keywordResults, method: 'keyword' };
    } catch {
      return { results: [], method: 'none' };
    }
  }
}
