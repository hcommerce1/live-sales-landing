/**
 * Dashboard Data API
 *
 * GET /api/analytics/dashboard
 *
 * Returns aggregated analytics data for the dashboard.
 * Protected by httpOnly cookie set via login flow.
 */

import type { APIRoute } from 'astro';
import {
  getOverviewStats,
  getPageviewsByDay,
  getPostRankings,
  getScrollHeatmap,
  getCopyLog,
  getQuitDepthDistribution,
  getTopSearchQueries,
  getReturnVisitStats,
  getSubscriptionStats,
} from '@lib/analytics/aggregation';

export const prerender = false;

function getAdminToken(): string {
  return (
    (typeof import.meta !== 'undefined' && import.meta.env?.ANALYTICS_ADMIN_TOKEN) ||
    process.env.ANALYTICS_ADMIN_TOKEN ||
    ''
  );
}

function isAuthenticated(request: Request): boolean {
  const cookies = request.headers.get('cookie') || '';
  const match = cookies.match(/ls_admin_token=([^;]+)/);
  return match?.[1] === getAdminToken();
}

export const GET: APIRoute = async ({ request, url }) => {
  if (!isAuthenticated(request)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const days = parseInt(url.searchParams.get('days') || '30');
  const slug = url.searchParams.get('slug') || undefined;

  const [
    overview,
    pageviewsByDay,
    postRankings,
    scrollHeatmap,
    copyLog,
    quitDepth,
    searchQueries,
    returnVisits,
    subscriptions,
  ] = await Promise.all([
    getOverviewStats(days),
    getPageviewsByDay(days),
    getPostRankings(days),
    getScrollHeatmap(days, slug),
    getCopyLog(days),
    getQuitDepthDistribution(days, slug),
    getTopSearchQueries(days),
    getReturnVisitStats(days),
    getSubscriptionStats(days),
  ]);

  return new Response(
    JSON.stringify({
      overview,
      pageviewsByDay,
      postRankings,
      scrollHeatmap,
      copyLog,
      quitDepth,
      searchQueries,
      returnVisits,
      subscriptions,
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
};

// POST: Login (set auth cookie)
export const POST: APIRoute = async ({ request }) => {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request' }), { status: 400 });
  }

  if (!body.token || body.token !== getAdminToken()) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `ls_admin_token=${body.token}; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/`,
    },
  });
};
