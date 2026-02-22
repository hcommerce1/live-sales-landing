/**
 * Generate FB Post API
 *
 * POST /api/generate-fb-post
 * Body: { slug: string, lang: 'pl' | 'en' }
 *
 * Protected by ls_admin_token cookie (same as analytics API).
 * Reads MDX file, calls OpenAI, saves JSON, returns FbPostRecord.
 */

import type { APIRoute } from 'astro';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import OpenAI from 'openai';
import { isAuthenticated } from '@lib/analytics/auth';
import {
  generateFbPost,
  saveFbPost,
  type BlogPostInput,
} from '@lib/fbPostGenerator';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { slug?: string; lang?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug, lang } = body;

  if (!slug || !lang || !['pl', 'en'].includes(lang)) {
    return new Response(
      JSON.stringify({ error: 'slug i lang (pl|en) są wymagane' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const mdxPath = join(process.cwd(), 'src', 'content', 'blog', lang, `${slug}.mdx`);
  if (!existsSync(mdxPath)) {
    return new Response(
      JSON.stringify({ error: `Post nie znaleziony: ${slug} (${lang})` }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const raw = readFileSync(mdxPath, 'utf-8');
  const { data, content } = matter(raw);

  const postInput: BlogPostInput = {
    slug,
    lang: lang as 'pl' | 'en',
    title: data.title ?? slug,
    description: data.description ?? '',
    tags: data.tags ?? [],
    category: data.category ?? 'guide',
    content,
  };

  // Dual-env OpenAI key — works in both SSR (import.meta.env) and Node (process.env)
  const apiKey =
    (typeof import.meta !== 'undefined' ? import.meta.env?.OPENAI_API_KEY : undefined) ??
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY nie skonfigurowany' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const openai = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 2 });

  try {
    const record = await generateFbPost(openai, postInput);
    saveFbPost(slug, record);
    return new Response(JSON.stringify(record), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[API generate-fb-post] Error:', message);
    return new Response(
      JSON.stringify({ error: 'Generowanie nie powiodło się', detail: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
