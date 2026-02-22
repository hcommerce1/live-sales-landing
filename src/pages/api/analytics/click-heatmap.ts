/**
 * GET /api/analytics/click-heatmap?days=30
 * GET /api/analytics/click-heatmap?days=30&slug=blog/xxx
 *
 * Returns click heatmap data for the dashboard.
 * Without slug: list of pages with total click counts.
 * With slug: individual click positions for heatmap overlay.
 */

import type { APIRoute } from 'astro';
import { isAuthenticated } from '@lib/analytics/auth';
import { getClickHeatmapPages, getClickHeatmapData } from '@lib/analytics/aggregation';

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
  const slug = url.searchParams.get('slug');

  if (slug) {
    const clicks = await getClickHeatmapData(days, slug);
    return new Response(JSON.stringify({ clicks }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const pages = await getClickHeatmapPages(days);
  return new Response(JSON.stringify({ pages }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
