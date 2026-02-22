/**
 * GET /api/analytics/subscriber-profiles?days=30
 *
 * Returns subscriber reading patterns and pre-subscribe journey data
 * for the Subskrybenci dashboard tab.
 */

import type { APIRoute } from 'astro';
import { isAuthenticated } from '@lib/analytics/auth';
import { getSubscriberReadingPatterns, getSubscriberJourneyPatterns } from '@lib/analytics/aggregation';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const daysParam = parseInt(url.searchParams.get('days') || '30');
  const days = [7, 30, 90].includes(daysParam) ? daysParam : 30;

  const [readingPatterns, journeyPatterns] = await Promise.allSettled([
    getSubscriberReadingPatterns(days),
    getSubscriberJourneyPatterns(days),
  ]);

  return new Response(
    JSON.stringify({
      readingPatterns: readingPatterns.status === 'fulfilled' ? readingPatterns.value : [],
      journeyPatterns: journeyPatterns.status === 'fulfilled' ? journeyPatterns.value : [],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
