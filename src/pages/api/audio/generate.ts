/**
 * Audio Generation Endpoint
 *
 * POST /api/audio/generate
 *
 * Generates TTS audio for a blog post using ElevenLabs.
 * Caches results in Turso to avoid re-generation.
 *
 * Security:
 * - Rate limited (3 req/min per IP)
 * - Slug validation (must exist in content collection)
 * - Max article length (50,000 chars)
 * - Content hash for cache invalidation
 */

import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { db } from '@lib/analytics/db';
import { initSchema } from '@lib/analytics/schema';
import { prepareTextForTTS, chunkText, contentHash } from '@lib/audio/textPrep';
import { generateSpeechChunked, estimateDuration } from '@lib/audio/elevenlabs';

export const prerender = false;

// --- Schema init ---
let schemaReady = false;
async function ensureSchema() {
  if (schemaReady || !db) return;
  await initSchema();
  schemaReady = true;
}

// --- Rate limiter ---
interface RateLimitEntry { count: number; resetAt: number }
const RATE_WINDOW = 60_000;
const RATE_MAX = 3;
const rateLimits = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

const MAX_CONTENT_LENGTH = 50_000;

function jsonResponse(data: object, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  if (isRateLimited(ip)) {
    return jsonResponse({ error: 'Zbyt wiele żądań. Spróbuj za chwilę.' }, 429);
  }

  let body: { slug?: string; lang?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request' }, 400);
  }

  const slug = body.slug;
  const lang = body.lang === 'en' ? 'en' : 'pl';

  if (!slug || typeof slug !== 'string' || slug.length > 200) {
    return jsonResponse({ error: 'Invalid slug' }, 400);
  }

  // Find the blog post
  const allPosts = await getCollection('blog');
  const post = allPosts.find(p => p.slug === slug);

  if (!post) {
    return jsonResponse({ error: 'Post not found' }, 404);
  }

  const rawContent = post.body || '';
  if (rawContent.length > MAX_CONTENT_LENGTH) {
    return jsonResponse({ error: 'Article too long for audio generation' }, 413);
  }

  // Prepare text
  const cleanText = prepareTextForTTS(rawContent);
  const hash = await contentHash(cleanText);
  const duration = estimateDuration(cleanText);

  await ensureSchema();

  // Check cache
  if (db) {
    const cached = await db.execute({
      sql: 'SELECT audio_url, duration_seconds, content_hash FROM audio_cache WHERE slug = ? AND lang = ?',
      args: [slug, lang],
    });

    if (cached.rows.length > 0) {
      const row = cached.rows[0];
      if (row.content_hash === hash) {
        return jsonResponse({
          audioUrl: row.audio_url,
          duration: row.duration_seconds,
          cached: true,
        }, 200);
      }
      // Content changed — will regenerate below
    }
  }

  // Generate audio
  try {
    const chunks = chunkText(cleanText);
    const audioBuffer = await generateSpeechChunked(chunks);

    // Convert to base64 data URI (for simplicity; production could upload to Vercel Blob)
    const base64 = btoa(
      Array.from(new Uint8Array(audioBuffer))
        .map(b => String.fromCharCode(b))
        .join('')
    );
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    // Cache in DB
    if (db) {
      await db.execute({
        sql: `INSERT INTO audio_cache (slug, lang, audio_url, content_hash, duration_seconds)
              VALUES (?, ?, ?, ?, ?)
              ON CONFLICT(slug, lang) DO UPDATE SET
                audio_url = excluded.audio_url,
                content_hash = excluded.content_hash,
                duration_seconds = excluded.duration_seconds,
                created_at = datetime('now')`,
        args: [slug, lang, audioUrl, hash, duration],
      });
    }

    return jsonResponse({
      audioUrl,
      duration,
      cached: false,
    }, 200);
  } catch (err: any) {
    console.error('[Audio Generate] Error:', err?.message);
    return jsonResponse({ error: 'Nie udało się wygenerować audio. Spróbuj później.' }, 500);
  }
};
