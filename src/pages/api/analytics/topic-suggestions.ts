/**
 * POST /api/analytics/topic-suggestions
 * Body: { days: number }
 *
 * Generates AI blog topic suggestions using GPT-4o based on analytics data.
 * Protected by httpOnly cookie.
 */

import type { APIRoute } from 'astro';
import { isAuthenticated } from '@lib/analytics/auth';
import { getAnalyticsDataForTopicGeneration } from '@lib/analytics/aggregation';
import { generateBlogTopicSuggestions } from '@lib/openai';

export const prerender = false;

const MIN_PAGEVIEWS = 50;

export const POST: APIRoute = async ({ request }) => {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { days?: number };
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const daysParam = Number(body.days) || 30;
  const days = [7, 30, 90].includes(daysParam) ? daysParam : 30;

  const analyticsData = await getAnalyticsDataForTopicGeneration(days);

  if (!analyticsData || analyticsData.totalPageviews < MIN_PAGEVIEWS) {
    return new Response(
      JSON.stringify({
        suggestions: [],
        message: `Za mało danych do generowania sugestii. Zebrano ${analyticsData?.totalPageviews ?? 0} z wymaganych ${MIN_PAGEVIEWS} pageviews.`,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } },
    );
  }

  try {
    const suggestions = await generateBlogTopicSuggestions(analyticsData);
    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[topic-suggestions]', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Błąd generowania sugestii' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
