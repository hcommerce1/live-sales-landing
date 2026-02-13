/**
 * Embedding Generator
 *
 * Generates embeddings for blog posts with:
 * - Hierarchical chunking by H2 sections
 * - Content hash-based change detection
 * - Metadata enrichment
 * - Batch processing with delay to avoid rate limits
 *
 * Usage:
 * - Build-time: npm run generate-embeddings
 * - Programmatic: import { generateAllEmbeddings } from '@lib/embeddings/generator'
 */

import { createHash } from 'crypto';
import { getCollection, type CollectionEntry } from 'astro:content';
import { generateEmbedding } from '../openai';
import {
  storeEmbedding,
  getExistingEmbedding,
  deleteOldEmbeddings,
  type EmbeddingRecord,
} from '../redis';

/**
 * Content chunk from blog post
 */
interface ContentChunk {
  content: string;
  sectionTitle?: string;
}

/**
 * Generate SHA-256 hash of content
 *
 * @param content - Content to hash
 * @returns Hex-encoded hash string
 */
export function generateContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Split blog post content into chunks by H2 sections
 *
 * @param content - MDX/Markdown content
 * @returns Array of content chunks
 */
export function chunkContent(content: string): ContentChunk[] {
  // Split by H2 headings (## Title)
  const h2Regex = /^##\s+(.+)$/gm;
  const matches = [...content.matchAll(h2Regex)];

  if (matches.length === 0) {
    // No H2 headings, return full content as single chunk
    return [{ content: content.trim() }];
  }

  const chunks: ContentChunk[] = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const sectionTitle = match[1];
    const startIndex = match.index! + match[0].length;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;

    const sectionContent = content.slice(startIndex, endIndex).trim();

    if (sectionContent.length > 50) {
      // Only include meaningful chunks (>50 chars)
      chunks.push({
        content: sectionContent,
        sectionTitle,
      });
    }
  }

  // If no chunks were created (all sections too short), use full content
  if (chunks.length === 0) {
    return [{ content: content.trim() }];
  }

  return chunks;
}

/**
 * Create enriched text for embedding generation
 * Combines title, description, section title, and content
 *
 * @param post - Blog post entry
 * @param chunk - Content chunk
 * @returns Enriched text string
 */
function createEmbeddingText(
  post: CollectionEntry<'blog'>,
  chunk: ContentChunk
): string {
  const parts = [
    // Title appears twice for emphasis (important for search relevance)
    post.data.title,
    post.data.title,
    post.data.description,
  ];

  if (chunk.sectionTitle) {
    parts.push(chunk.sectionTitle);
  }

  parts.push(chunk.content);

  return parts.join(' ').trim();
}

/**
 * Generate embeddings for a single blog post
 *
 * @param post - Blog post entry from Content Collections
 * @returns Number of embeddings generated
 */
export async function generatePostEmbeddings(
  post: CollectionEntry<'blog'>
): Promise<number> {
  let generatedCount = 0;

  try {
    const chunks = chunkContent(post.body);

    console.log(`[Generator] Processing ${post.slug} (${chunks.length} chunks)`);

    for (const chunk of chunks) {
      // Create enriched text for embedding
      const embeddingText = createEmbeddingText(post, chunk);
      const contentHash = generateContentHash(embeddingText);

      // Check if embedding already exists with same hash (unchanged content)
      const existing = await getExistingEmbedding(
        post.slug,
        post.data.lang,
        contentHash
      );

      if (existing) {
        console.log(`  ✓ Skipped (unchanged): ${chunk.sectionTitle || 'intro'}`);
        continue;
      }

      // Generate embedding
      const embedding = await generateEmbedding(embeddingText);

      // Create record
      const record: EmbeddingRecord = {
        slug: post.slug,
        lang: post.data.lang,
        postTitle: post.data.title,
        description: post.data.description,
        sectionTitle: chunk.sectionTitle,
        content: chunk.content,
        embedding,
        contentHash,
        url: `/${post.data.lang}/blog/${post.slug}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in Redis
      const success = await storeEmbedding(record);

      if (success) {
        console.log(`  ✓ Generated: ${chunk.sectionTitle || 'intro'}`);
        generatedCount++;

        // Delete old versions for this slug
        await deleteOldEmbeddings(post.slug, post.data.lang, contentHash);
      } else {
        console.error(`  ✗ Failed to store: ${chunk.sectionTitle || 'intro'}`);
      }

      // Add delay to avoid rate limits (100ms between requests)
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return generatedCount;
  } catch (error) {
    console.error(`[Generator] Failed to process ${post.slug}:`, error);
    return generatedCount;
  }
}

/**
 * Generate embeddings for all blog posts
 *
 * @returns Statistics object
 */
export async function generateAllEmbeddings(): Promise<{
  total: number;
  generated: number;
  skipped: number;
  failed: number;
}> {
  const startTime = Date.now();

  console.log('[Generator] Starting embedding generation...\n');

  try {
    // Get all published blog posts
    const posts = await getCollection('blog', ({ data }) => {
      return !data.draft;
    });

    console.log(`[Generator] Found ${posts.length} published posts\n`);

    let totalGenerated = 0;
    let totalSkipped = 0;
    let totalFailed = 0;

    for (const post of posts) {
      const chunks = chunkContent(post.body);
      const generated = await generatePostEmbeddings(post);

      totalGenerated += generated;
      totalSkipped += chunks.length - generated;

      if (generated === 0 && chunks.length > 0) {
        totalFailed++;
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n[Generator] ✓ Complete!');
    console.log(`  Total posts: ${posts.length}`);
    console.log(`  Generated: ${totalGenerated}`);
    console.log(`  Skipped (unchanged): ${totalSkipped}`);
    console.log(`  Failed: ${totalFailed}`);
    console.log(`  Duration: ${duration}s`);

    return {
      total: posts.length,
      generated: totalGenerated,
      skipped: totalSkipped,
      failed: totalFailed,
    };
  } catch (error) {
    console.error('[Generator] Fatal error:', error);
    throw error;
  }
}

/**
 * Estimate cost for generating embeddings for all posts
 *
 * @returns Cost estimation object
 */
export async function estimateCost(): Promise<{
  posts: number;
  estimatedChunks: number;
  estimatedTokens: number;
  estimatedCost: number;
}> {
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  let totalChunks = 0;
  let totalTokens = 0;

  for (const post of posts) {
    const chunks = chunkContent(post.body);
    totalChunks += chunks.length;

    for (const chunk of chunks) {
      const embeddingText = createEmbeddingText(post, chunk);
      // Rough approximation: 1 token ≈ 4 characters
      totalTokens += Math.ceil(embeddingText.length / 4);
    }
  }

  const costPerMillionTokens = 0.02;
  const estimatedCost = (totalTokens / 1_000_000) * costPerMillionTokens;

  return {
    posts: posts.length,
    estimatedChunks: totalChunks,
    estimatedTokens: totalTokens,
    estimatedCost: Number(estimatedCost.toFixed(4)),
  };
}
