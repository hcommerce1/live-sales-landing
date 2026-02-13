/**
 * Upstash Redis Integration
 *
 * Provides serverless-optimized Redis storage for embeddings and caching.
 * Uses Upstash REST API for edge compatibility.
 *
 * Free tier: 500K commands/month
 */

import { Redis } from '@upstash/redis';

// Initialize Redis client with REST API credentials
// Support both import.meta.env (Astro/Vite) and process.env (Node.js)
const redisUrl = typeof import.meta !== 'undefined' && import.meta.env?.UPSTASH_REDIS_REST_URL
  ? import.meta.env.UPSTASH_REDIS_REST_URL
  : process.env.UPSTASH_REDIS_REST_URL;

const redisToken = typeof import.meta !== 'undefined' && import.meta.env?.UPSTASH_REDIS_REST_TOKEN
  ? import.meta.env.UPSTASH_REDIS_REST_TOKEN
  : process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = new Redis({
  url: redisUrl,
  token: redisToken,
  automaticDeserialization: true,
});

/**
 * Blog post embedding record stored in Redis
 */
export interface EmbeddingRecord {
  slug: string;
  lang: 'pl' | 'en';
  postTitle: string;
  description: string;
  sectionTitle?: string;
  content: string;
  embedding: number[];
  contentHash: string; // SHA-256 hash for change detection
  url: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Search result with similarity score
 */
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

/**
 * Store embedding record in Redis
 *
 * @param record - Embedding record to store
 * @returns Success boolean
 */
export async function storeEmbedding(record: EmbeddingRecord): Promise<boolean> {
  try {
    const key = `embedding:${record.lang}:${record.slug}:${record.contentHash.slice(0, 8)}`;

    await redis.hset(key, record);

    // Add to language-specific index
    await redis.sadd(`index:${record.lang}`, key);

    // Add to global index
    await redis.sadd('index:all', key);

    return true;
  } catch (error) {
    console.error('[Redis] Store embedding failed:', error);
    return false;
  }
}

/**
 * Get all embedding records for a language
 *
 * @param lang - Language code ('pl', 'en', or 'all')
 * @returns Array of embedding records
 */
export async function getAllEmbeddings(lang: 'pl' | 'en' | 'all' = 'all'): Promise<EmbeddingRecord[]> {
  try {
    const indexKey = lang === 'all' ? 'index:all' : `index:${lang}`;
    const keys = await redis.smembers(indexKey);

    if (!keys || keys.length === 0) {
      return [];
    }

    // Fetch all records in parallel for better performance
    const records = await Promise.all(
      keys.map(async (key) => {
        const record = await redis.hgetall(key);
        return record as EmbeddingRecord | null;
      })
    );

    // Filter out null values
    return records.filter((record): record is EmbeddingRecord => record !== null);
  } catch (error) {
    console.error('[Redis] Get all embeddings failed:', error);
    throw new Error('Failed to fetch embeddings from Redis');
  }
}

/**
 * Check if embedding exists for given slug and content hash
 *
 * @param slug - Blog post slug
 * @param lang - Language code
 * @param contentHash - Content hash
 * @returns Existing record or null
 */
export async function getExistingEmbedding(
  slug: string,
  lang: string,
  contentHash: string
): Promise<EmbeddingRecord | null> {
  try {
    const key = `embedding:${lang}:${slug}:${contentHash.slice(0, 8)}`;
    const record = await redis.hgetall(key);

    if (!record || Object.keys(record).length === 0) {
      return null;
    }

    return record as EmbeddingRecord;
  } catch (error) {
    console.error('[Redis] Get existing embedding failed:', error);
    return null;
  }
}

/**
 * Delete old embeddings for a slug (when content updated)
 *
 * @param slug - Blog post slug
 * @param lang - Language code
 * @param keepHash - Hash to keep (current version)
 */
export async function deleteOldEmbeddings(
  slug: string,
  lang: string,
  keepHash: string
): Promise<void> {
  try {
    const pattern = `embedding:${lang}:${slug}:*`;
    const indexKey = `index:${lang}`;

    // Get all keys matching pattern
    const allKeys = await redis.smembers(indexKey);
    const matchingKeys = allKeys.filter((key) =>
      key.startsWith(`embedding:${lang}:${slug}:`) &&
      !key.includes(keepHash.slice(0, 8))
    );

    // Delete old versions
    for (const key of matchingKeys) {
      await redis.del(key);
      await redis.srem(indexKey, key);
      await redis.srem('index:all', key);
    }

    console.log(`[Redis] Deleted ${matchingKeys.length} old embeddings for ${slug}`);
  } catch (error) {
    console.error('[Redis] Delete old embeddings failed:', error);
  }
}

/**
 * Get Redis connection stats
 *
 * @returns Stats object
 */
export async function getRedisStats(): Promise<{
  totalEmbeddings: number;
  embeddingsByLang: { pl: number; en: number };
}> {
  try {
    const [plKeys, enKeys] = await Promise.all([
      redis.smembers('index:pl'),
      redis.smembers('index:en'),
    ]);

    return {
      totalEmbeddings: (plKeys?.length || 0) + (enKeys?.length || 0),
      embeddingsByLang: {
        pl: plKeys?.length || 0,
        en: enKeys?.length || 0,
      },
    };
  } catch (error) {
    console.error('[Redis] Get stats failed:', error);
    return {
      totalEmbeddings: 0,
      embeddingsByLang: { pl: 0, en: 0 },
    };
  }
}
