#!/usr/bin/env tsx

/**
 * Generate Embeddings to JSON
 *
 * Reads all blog posts, generates OpenAI embeddings, and saves to
 * src/data/embeddings.json for use by the search API at runtime.
 *
 * Runs during build: tsx scripts/generate-embeddings-json.ts && astro build
 *
 * If OPENAI_API_KEY is not set, outputs empty array (search won't work
 * but build won't fail).
 */

import { config } from 'dotenv';
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import OpenAI from 'openai';

// Load .env.local if available (for local dev)
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  config({ path: envPath });
}

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

interface BlogPost {
  slug: string;
  lang: 'pl' | 'en';
  title: string;
  description: string;
  content: string;
  draft: boolean;
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
      chunks.push({ content: sectionContent, sectionTitle });
    }
  }

  return chunks.length === 0 ? [{ content: content.trim() }] : chunks;
}

/**
 * Read all blog posts from content directory
 */
function getAllBlogPosts(): BlogPost[] {
  const posts: BlogPost[] = [];
  const contentDir = join(process.cwd(), 'src', 'content', 'blog');

  for (const lang of ['pl', 'en']) {
    const langDir = join(contentDir, lang);
    try {
      const files = readdirSync(langDir).filter(f => f.endsWith('.mdx'));
      for (const file of files) {
        const raw = readFileSync(join(langDir, file), 'utf-8');
        const { data, content } = matter(raw);
        posts.push({
          slug: file.replace('.mdx', ''),
          lang: lang as 'pl' | 'en',
          title: data.title,
          description: data.description,
          content,
          draft: data.draft || false,
        });
      }
    } catch {
      // Directory doesn't exist — skip
    }
  }

  return posts;
}

async function main() {
  const outputDir = join(process.cwd(), 'src', 'data');
  const outputPath = join(outputDir, 'embeddings.json');

  // Ensure output directory exists
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  // Check for API key
  if (!process.env.OPENAI_API_KEY) {
    console.log('[Embeddings] OPENAI_API_KEY not set — skipping generation');
    writeFileSync(outputPath, '[]');
    return;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000,
    maxRetries: 3,
  });

  const posts = getAllBlogPosts().filter(p => !p.draft);
  console.log(`[Embeddings] Found ${posts.length} published posts`);

  // Build all chunks with metadata
  const allChunks: Array<{ text: string; meta: Omit<EmbeddingRecord, 'embedding'> }> = [];

  for (const post of posts) {
    const chunks = chunkContent(post.content);
    for (const chunk of chunks) {
      const text = [post.title, post.title, post.description, chunk.sectionTitle || '', chunk.content].join(' ').trim();
      allChunks.push({
        text,
        meta: {
          slug: post.slug,
          lang: post.lang,
          postTitle: post.title,
          description: post.description,
          sectionTitle: chunk.sectionTitle,
          content: chunk.content,
          url: `/${post.lang}/blog/${post.slug}`,
        },
      });
    }
  }

  console.log(`[Embeddings] Generating embeddings for ${allChunks.length} chunks (batch)...`);

  // Single batch API call for all chunks
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: allChunks.map(c => c.text),
    encoding_format: 'float',
  });

  const records: EmbeddingRecord[] = allChunks.map((chunk, i) => ({
    ...chunk.meta,
    embedding: response.data[i].embedding,
  }));

  writeFileSync(outputPath, JSON.stringify(records));
  console.log(`[Embeddings] Saved ${records.length} embeddings to src/data/embeddings.json`);
}

main().catch(err => {
  console.error('[Embeddings] Error:', err.message);
  // Don't fail the build — write empty array
  const outputPath = join(process.cwd(), 'src', 'data', 'embeddings.json');
  writeFileSync(outputPath, '[]');
  console.log('[Embeddings] Wrote empty embeddings.json (search will not work)');
});
