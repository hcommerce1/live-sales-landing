/**
 * Search API Endpoint
 *
 * POST /api/search
 *
 * Protected by:
 * - In-memory response cache (5 min TTL) — avoids duplicate OpenAI calls
 * - Rate limiting (30 req/min per IP)
 * - Input validation (3-500 chars)
 */

import type { APIRoute } from 'astro';
import { searchWithFallback } from '@lib/embeddings/search';

export const prerender = false;

// --- Response Cache ---
interface CachedResponse {
  data: string;
  timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const responseCache = new Map<string, CachedResponse>();

function getCacheKey(query: string, language: string, limit: number): string {
  return `${query.toLowerCase().trim()}:${language}:${limit}`;
}

// --- Rate Limiter ---
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute
const rateLimitMap = new Map<string, RateLimitEntry>();
let gcCounter = 0;

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Garbage collect every 100 requests
  if (++gcCounter % 100 === 0) {
    for (const [key, entry] of rateLimitMap) {
      if (now > entry.resetAt) rateLimitMap.delete(key);
    }
    for (const [key, entry] of responseCache) {
      if (now - entry.timestamp > CACHE_TTL) responseCache.delete(key);
    }
  }

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// --- Helpers ---
function sanitizeQuery(query: string): string {
  return query.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

function validateRequest(body: any): {
  valid: boolean;
  error?: string;
  data?: { query: string; language: 'pl' | 'en' | 'all'; limit: number };
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  if (!body.query || typeof body.query !== 'string') {
    return { valid: false, error: 'Query is required and must be a string' };
  }

  const sanitizedQuery = sanitizeQuery(body.query);

  if (sanitizedQuery.length < 3) {
    return { valid: false, error: 'Query must be at least 3 characters' };
  }

  if (sanitizedQuery.length > 500) {
    return { valid: false, error: 'Query is too long (maximum 500 characters)' };
  }

  const language = body.language || 'all';
  if (!['pl', 'en', 'all'].includes(language)) {
    return { valid: false, error: 'Language must be "pl", "en", or "all"' };
  }

  const limit = parseInt(body.limit) || 5;
  if (limit < 1 || limit > 20) {
    return { valid: false, error: 'Limit must be between 1 and 20' };
  }

  return { valid: true, data: { query: sanitizedQuery, language, limit } };
}

function jsonResponse(data: object, status: number, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

// --- Route Handlers ---

export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();

  // Rate limit check
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  if (isRateLimited(ip)) {
    return jsonResponse(
      { error: 'Too many requests. Please try again later.' },
      429,
      { 'Retry-After': '60' }
    );
  }

  // Parse body
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON in request body' }, 400);
  }

  // Validate
  const validation = validateRequest(body);
  if (!validation.valid) {
    return jsonResponse({ error: validation.error }, 400);
  }

  const { query, language, limit } = validation.data!;

  // Check cache first
  const cacheKey = getCacheKey(query, language, limit);
  const cached = responseCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new Response(cached.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'HIT',
      },
    });
  }

  // Perform search
  try {
    const { results, method } = await searchWithFallback({ query, language, limit });
    const latency = Date.now() - startTime;

    const responseData = JSON.stringify({ results, method, count: results.length, latency });

    // Store in cache
    responseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return new Response(responseData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error: any) {
    console.error('[API Search] Error', { message: error?.message, latency: `${Date.now() - startTime}ms` });

    if (error?.message?.includes('OpenAI')) {
      return jsonResponse(
        { error: 'Search service temporarily unavailable' },
        503,
        { 'Retry-After': '60' }
      );
    }

    return jsonResponse({ error: 'Internal server error' }, 500);
  }
};

export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
