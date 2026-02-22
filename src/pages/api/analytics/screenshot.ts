/**
 * POST /api/analytics/screenshot — capture a new screenshot
 * GET  /api/analytics/screenshot?slug=xxx — get stored screenshot
 *
 * Generates and stores page screenshots for the click heatmap overlay.
 */

import type { APIRoute } from 'astro';
import { isAuthenticated } from '@lib/analytics/auth';
import {
  capturePageScreenshot,
  saveScreenshot,
  getScreenshot,
  listScreenshots,
} from '@lib/analytics/screenshots';

export const prerender = false;

const SITE_URL = import.meta.env.SITE || 'https://livesales.pl';

export const GET: APIRoute = async ({ request, url }) => {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const slug = url.searchParams.get('slug');

  // List all screenshots if no slug
  if (!slug) {
    const screenshots = await listScreenshots();
    return new Response(JSON.stringify({ screenshots }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const screenshot = await getScreenshot(slug);
  if (!screenshot) {
    return new Response(JSON.stringify({ error: 'Brak screenshota. Użyj POST aby wygenerować.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(screenshot), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { slug?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { slug } = body;
  if (!slug || typeof slug !== 'string') {
    return new Response(JSON.stringify({ error: 'Parametr slug jest wymagany' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const result = await capturePageScreenshot(SITE_URL, slug);
  if (!result) {
    return new Response(JSON.stringify({ error: 'Nie udało się zrobić screenshota' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  await saveScreenshot(slug, result.b64, result.pageHeight);

  return new Response(
    JSON.stringify({
      success: true,
      pageHeight: result.pageHeight,
      size: Math.round(result.b64.length / 1024) + 'KB',
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
