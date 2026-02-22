#!/usr/bin/env tsx

/**
 * Generate Facebook Posts
 *
 * Reads blog MDX files, calls OpenAI GPT-4o-mini, saves JSON to src/data/fb-posts/.
 *
 * Usage:
 *   npm run generate:fb-posts           # wszystkie posty
 *   npm run generate:fb-posts:pl        # tylko polskie
 *   npm run generate:fb-posts:en        # tylko angielskie
 *
 *   tsx scripts/generate-fb-posts.ts --all
 *   tsx scripts/generate-fb-posts.ts --lang pl
 *   tsx scripts/generate-fb-posts.ts --lang en
 *   tsx scripts/generate-fb-posts.ts --slug kluczowe-metryki-ecommerce-v2
 *   tsx scripts/generate-fb-posts.ts --slug kluczowe-metryki-ecommerce-v2 --lang pl
 */

import { config } from 'dotenv';
import { existsSync, readFileSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import OpenAI from 'openai';
import {
  generateFbPost,
  saveFbPost,
  buildOutputPath,
  type BlogPostInput,
} from '../src/lib/fbPostGenerator.js';

// ---- env setup ----
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  config({ path: envPath });
}

// ---- arg parsing ----
interface CliArgs {
  all: boolean;
  lang: 'pl' | 'en' | null;
  slug: string | null;
  force: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = { all: false, lang: null, slug: null, force: false };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--all') {
      args.all = true;
    } else if (arg === '--force') {
      args.force = true;
    } else if (arg === '--lang') {
      const val = argv[i + 1];
      if (val === 'pl' || val === 'en') {
        args.lang = val;
        i++;
      } else {
        console.error('[FB Posts] --lang requires "pl" or "en"');
        process.exit(1);
      }
    } else if (arg === '--slug') {
      args.slug = argv[i + 1] ?? null;
      if (!args.slug) {
        console.error('[FB Posts] --slug requires a value');
        process.exit(1);
      }
      i++;
    }
  }

  // If neither --all, --lang, nor --slug — default to --all
  if (!args.all && !args.lang && !args.slug) {
    args.all = true;
  }

  return args;
}

// ---- blog post reading ----
function readBlogPosts(
  langFilter: 'pl' | 'en' | null,
  slugFilter: string | null
): BlogPostInput[] {
  const posts: BlogPostInput[] = [];
  const contentDir = join(process.cwd(), 'src', 'content', 'blog');
  const langs: Array<'pl' | 'en'> = langFilter ? [langFilter] : ['pl', 'en'];

  for (const lang of langs) {
    const langDir = join(contentDir, lang);
    let files: string[];

    try {
      files = readdirSync(langDir).filter(f => f.endsWith('.mdx'));
    } catch {
      // Directory doesn't exist — skip
      continue;
    }

    for (const file of files) {
      const slug = file.replace('.mdx', '');

      // Apply slug filter
      if (slugFilter && slug !== slugFilter) continue;

      const raw = readFileSync(join(langDir, file), 'utf-8');
      const { data, content } = matter(raw);

      // Skip drafts
      if (data.draft === true) {
        console.log(`[FB Posts] Skipping draft: ${slug} (${lang})`);
        continue;
      }

      posts.push({
        slug,
        lang,
        title: data.title ?? slug,
        description: data.description ?? '',
        tags: data.tags ?? [],
        category: data.category ?? 'guide',
        content,
      });
    }
  }

  return posts;
}

// ---- main ----
async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));

  if (!process.env.OPENAI_API_KEY) {
    console.error('[FB Posts] OPENAI_API_KEY not set. Aborting.');
    process.exit(1);
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60_000,
    maxRetries: 3,
  });

  // Ensure output directory exists
  const outputDir = join(process.cwd(), 'src', 'data', 'fb-posts');
  mkdirSync(outputDir, { recursive: true });

  const posts = readBlogPosts(args.lang, args.slug);

  if (posts.length === 0) {
    console.log('[FB Posts] No posts found matching criteria. Exiting.');
    return;
  }

  console.log(`[FB Posts] Processing ${posts.length} post(s)...`);

  let successCount = 0;
  let errorCount = 0;

  for (const post of posts) {
    // Skip already-generated posts unless --force
    if (!args.force && existsSync(buildOutputPath(post.slug))) {
      console.log(`[FB Posts] Skipping (exists): ${post.slug} — use --force to regenerate`);
      successCount++;
      continue;
    }

    try {
      console.log(`[FB Posts] Generating: ${post.slug} (${post.lang})...`);
      const record = await generateFbPost(openai, post);
      saveFbPost(post.slug, record);
      console.log(`[FB Posts] Saved: ${post.slug} (reach: ${record.estimatedReach}/100, ${record.wordCount} słów)`);
      successCount++;

      // 500ms delay to respect rate limits
      if (posts.indexOf(post) < posts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[FB Posts] Failed for ${post.slug}: ${message}`);
      errorCount++;
    }
  }

  console.log(`\n[FB Posts] Done. ${successCount} succeeded, ${errorCount} failed.`);

  if (errorCount > 0) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[FB Posts] Fatal:', err instanceof Error ? err.message : err);
  process.exit(1);
});
