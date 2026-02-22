/**
 * GET /api/analytics/blog-detail?slug=<slug>&days=<7|30|90>
 *
 * Returns detailed analytics for a single blog post.
 * Protected by httpOnly cookie (same as dashboard).
 */

import type { APIRoute } from 'astro';
import { isAuthenticated } from '@lib/analytics/auth';
import {
  getPostOverviewStats,
  getPageviewsByDayForSlug,
  getScrollHeatmap,
  getCopyLogForSlug,
  getFindInPageForSlug,
  getQuitDepthDistribution,
} from '@lib/analytics/aggregation';

export const prerender = false;

export const GET: APIRoute = async ({ request, url }) => {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const slug = url.searchParams.get('slug');
  if (!slug || slug.trim() === '') {
    return new Response(JSON.stringify({ error: 'Parametr slug jest wymagany' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const daysParam = parseInt(url.searchParams.get('days') || '30');
  const days = [7, 30, 90].includes(daysParam) ? daysParam : 30;

  const [overview, pageviewsByDay, scrollHeatmap, copyLog, findInPage, quitDepth] =
    await Promise.allSettled([
      getPostOverviewStats(days, slug),
      getPageviewsByDayForSlug(days, slug),
      getScrollHeatmap(days, slug),
      getCopyLogForSlug(days, slug),
      getFindInPageForSlug(days, slug),
      getQuitDepthDistribution(days, slug),
    ]);

  return new Response(
    JSON.stringify({
      overview: overview.status === 'fulfilled' ? overview.value : null,
      pageviewsByDay: pageviewsByDay.status === 'fulfilled' ? pageviewsByDay.value : [],
      scrollHeatmap: scrollHeatmap.status === 'fulfilled' ? scrollHeatmap.value : [],
      copyLog: copyLog.status === 'fulfilled' ? copyLog.value : [],
      findInPage: findInPage.status === 'fulfilled' ? findInPage.value : [],
      quitDepth: quitDepth.status === 'fulfilled' ? quitDepth.value : [],
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
