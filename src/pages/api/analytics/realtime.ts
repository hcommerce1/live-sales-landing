/**
 * Realtime Traffic API
 *
 * GET /api/analytics/realtime?hours=24|48
 *
 * Returns pageview counts in 5-minute intervals.
 * Protected by httpOnly cookie (same as dashboard).
 */

import type { APIRoute } from 'astro';
import { getRealtimeTraffic } from '@lib/analytics/aggregation';

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

  const hours = url.searchParams.get('hours') === '48' ? 48 : 24;
  const data = await getRealtimeTraffic(hours);

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
