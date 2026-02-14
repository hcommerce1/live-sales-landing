#!/usr/bin/env tsx

/**
 * Generate Embeddings CLI Tool
 *
 * Generates embeddings for all blog posts and stores them in Redis.
 *
 * Usage:
 *   npm run generate-embeddings
 *   npx tsx scripts/generate-embeddings.ts
 *
 * Options:
 *   --estimate    Show cost estimation without generating
 */

// Load environment variables from .env.local FIRST
import { config } from 'dotenv';
import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  config({ path: envPath });
}

// Now dynamically import modules that need env vars
const { generateEmbedding } = await import('../src/lib/openai.js');
const { storeEmbedding, getRedisStats } = await import('../src/lib/redis.js');
import matter from 'gray-matter';
import { createHash } from 'crypto';

// Parse command line arguments
const args = process.argv.slice(2);
const isEstimateOnly = args.includes('--estimate');

interface BlogPost {
  slug: string;
  lang: 'pl' | 'en';
  title: string;
  description: string;
  content: string;
  draft: boolean;
}

/**
 * Read all blog posts from content directory
 */
function getAllBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
  const contentDir = join(process.cwd(), 'src', 'content', 'blog');

  // Read both pl and en directories
  for (const lang of ['pl', 'en']) {
    const langDir = join(contentDir, lang);

    try {
      const files = readdirSync(langDir).filter(file => file.endsWith('.mdx'));

      for (const file of files) {
        const filePath = join(langDir, file);
        const fileContent = readFileSync(filePath, 'utf-8');
        const { data, content } = matter(fileContent);

        posts.push({
          slug: file.replace('.mdx', ''),
          lang: lang as 'pl' | 'en',
          title: data.title,
          description: data.description,
          content,
          draft: data.draft || false,
        });
      }
    } catch (error) {
      // Ignore if directory doesn't exist
    }
  }

  return posts;
}

/**
 * Split content into chunks by H2 headings
 */
function chunkContent(content: string): Array<{ content: string; sectionTitle?: string }> {
  const h2Regex = /^##\s+(.+)$/gm;
  const matches = [...content.matchAll(h2Regex)];

  if (matches.length === 0) {
    return [{ content: content.trim() }];
  }

  const chunks: Array<{ content: string; sectionTitle?: string }> = [];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const sectionTitle = match[1];
    const startIndex = match.index! + match[0].length;
    const endIndex = i < matches.length - 1 ? matches[i + 1].index! : content.length;

    const sectionContent = content.slice(startIndex, endIndex).trim();

    if (sectionContent.length > 50) {
      chunks.push({
        content: sectionContent,
        sectionTitle,
      });
    }
  }

  if (chunks.length === 0) {
    return [{ content: content.trim() }];
  }

  return chunks;
}

/**
 * Generate content hash
 */
function generateContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Generate embeddings for all posts
 */
async function generateAllEmbeddings() {
  const startTime = Date.now();

  console.log('[Generator] Starting embedding generation...\n');

  const posts = getAllBlogPosts().filter(p => !p.draft);

  console.log(`[Generator] Found ${posts.length} published posts\n`);

  let totalGenerated = 0;
  let totalSkipped = 0;

  for (const post of posts) {
    const chunks = chunkContent(post.content);

    console.log(`[Generator] Processing ${post.slug} (${chunks.length} chunks)`);

    for (const chunk of chunks) {
      // Create enriched text
      const embeddingText = [
        post.title,
        post.title,
        post.description,
        chunk.sectionTitle || '',
        chunk.content,
      ].join(' ').trim();

      const contentHash = generateContentHash(embeddingText);

      // Generate embedding
      try {
        const embedding = await generateEmbedding(embeddingText);

        // Create record
        const record: any = {
          slug: post.slug,
          lang: post.lang,
          postTitle: post.title,
          description: post.description,
          sectionTitle: chunk.sectionTitle,
          content: chunk.content,
          embedding,
          contentHash,
          url: `/${post.lang}/blog/${post.slug}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Store in Redis
        const success = await storeEmbedding(record);

        if (success) {
          console.log(`  ✓ Generated: ${chunk.sectionTitle || 'intro'}`);
          totalGenerated++;
        } else {
          console.error(`  ✗ Failed to store: ${chunk.sectionTitle || 'intro'}`);
        }
      } catch (error: any) {
        console.error(`  ✗ Error: ${error.message}`);
      }

      // Delay to avoid rate limits (20s for OpenAI Tier 1: 3 requests/minute)
      // Must be OUTSIDE try-catch to execute even on errors
      await new Promise(resolve => setTimeout(resolve, 20000));
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n[Generator] ✓ Complete!');
  console.log(`  Total posts: ${posts.length}`);
  console.log(`  Generated: ${totalGenerated}`);
  console.log(`  Skipped: ${totalSkipped}`);
  console.log(`  Duration: ${duration}s`);

  return {
    total: posts.length,
    generated: totalGenerated,
    skipped: totalSkipped,
    failed: 0,
  };
}

/**
 * Estimate cost
 */
async function estimateCost() {
  const posts = getAllBlogPosts().filter(p => !p.draft);

  let totalChunks = 0;
  let totalTokens = 0;

  for (const post of posts) {
    const chunks = chunkContent(post.content);
    totalChunks += chunks.length;

    for (const chunk of chunks) {
      const embeddingText = [
        post.title,
        post.title,
        post.description,
        chunk.sectionTitle || '',
        chunk.content,
      ].join(' ').trim();

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

async function main() {
  console.log('━'.repeat(60));
  console.log('🤖 LiveSales Blog Embeddings Generator');
  console.log('━'.repeat(60));
  console.log();

  try {
    // Check environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ Error: OPENAI_API_KEY not found in environment variables');
      console.error('   Please add it to your .env.local file');
      process.exit(1);
    }

    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      console.error('❌ Error: Upstash Redis credentials not found');
      console.error('   Please add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env.local');
      process.exit(1);
    }

    // Show cost estimation if requested
    if (isEstimateOnly) {
      console.log('📊 Cost Estimation\n');

      const estimation = await estimateCost();

      console.log(`  Posts: ${estimation.posts}`);
      console.log(`  Estimated chunks: ${estimation.estimatedChunks}`);
      console.log(`  Estimated tokens: ${estimation.estimatedTokens.toLocaleString()}`);
      console.log(`  Estimated cost: $${estimation.estimatedCost}`);
      console.log();
      console.log('💡 Run without --estimate flag to generate embeddings');
      process.exit(0);
    }

    // Show current Redis stats
    console.log('📊 Current Redis Stats\n');
    const stats = await getRedisStats();
    console.log(`  Total embeddings: ${stats.totalEmbeddings}`);
    console.log(`  Polish (PL): ${stats.embeddingsByLang.pl}`);
    console.log(`  English (EN): ${stats.embeddingsByLang.en}`);
    console.log();

    // Generate embeddings
    console.log('🚀 Generating embeddings...\n');

    const result = await generateAllEmbeddings();

    // Show final stats
    console.log('\n━'.repeat(60));
    console.log('✅ Embeddings Generated Successfully!');
    console.log('━'.repeat(60));
    console.log();
    console.log(`  Total posts: ${result.total}`);
    console.log(`  ✓ Generated: ${result.generated}`);
    console.log();

    // Show updated Redis stats
    const updatedStats = await getRedisStats();
    console.log('📊 Updated Redis Stats\n');
    console.log(`  Total embeddings: ${updatedStats.totalEmbeddings}`);
    console.log(`  Polish (PL): ${updatedStats.embeddingsByLang.pl}`);
    console.log(`  English (EN): ${updatedStats.embeddingsByLang.en}`);
    console.log();

    console.log('🎉 All embeddings generated successfully!');
    console.log('   Your blog search is now powered by AI.');
    process.exit(0);
  } catch (error: any) {
    console.error('\n━'.repeat(60));
    console.error('❌ Error generating embeddings');
    console.error('━'.repeat(60));
    console.error();
    console.error('  Error:', error?.message || 'Unknown error');
    console.error();
    process.exit(1);
  }
}

// Run main function
main();
