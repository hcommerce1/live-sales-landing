/**
 * POST /api/analytics/blog-improvements
 *
 * Generates AI-powered content improvement suggestions for a specific blog post
 * based on its analytics data (Ctrl+F searches, copy events, quit depth, etc.)
 */

import type { APIRoute } from 'astro';
import { isAuthenticated } from '@lib/analytics/auth';
import { getBlogAnalyticsForAI } from '@lib/analytics/aggregation';
import { generateBlogImprovementSuggestions } from '@lib/openai';

export const prerender = false;

// Simple in-memory cache (1h TTL)
const cache = new Map<string, { data: unknown; expires: number }>();

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { slug?: string; days?: number };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug, days = 30 } = body;

  if (!slug || typeof slug !== 'string') {
    return new Response(JSON.stringify({ error: 'Parametr slug jest wymagany' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check cache
  const cacheKey = `${slug}:${days}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return new Response(JSON.stringify(cached.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const data = await getBlogAnalyticsForAI(days, slug);

  if (!data) {
    return new Response(JSON.stringify({ suggestions: [], message: 'Brak danych analitycznych.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check minimum data thresholds
  const hasEnoughData =
    (data.findInPage?.length >= 3) ||
    (data.copyLog?.length >= 3) ||
    (data.overview?.pageviews >= 20);

  if (!hasEnoughData) {
    const response = {
      suggestions: [],
      message: `Za mało danych do analizy tego artykułu. Zebrano ${data.overview?.pageviews || 0} pageviews, ${data.findInPage?.length || 0} wyszukiwań Ctrl+F, ${data.copyLog?.length || 0} kopiowań.`,
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const suggestions = await generateBlogImprovementSuggestions(data);
    const response = { suggestions };

    // Cache for 1 hour
    cache.set(cacheKey, { data: response, expires: Date.now() + 3600000 });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[BlogImprovements] AI generation error:', err);
    return new Response(JSON.stringify({ error: 'Błąd generowania sugestii: ' + (err.message || 'Unknown error') }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
