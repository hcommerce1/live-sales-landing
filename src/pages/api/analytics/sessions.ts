/**
 * Sessions API
 *
 * GET /api/analytics/sessions          — list recent sessions
 * GET /api/analytics/sessions?id=UUID  — single session detail
 *
 * Protected by httpOnly cookie (same as dashboard).
 */

import type { APIRoute } from 'astro';
import { getRecentSessions, getSessionDetail } from '@lib/analytics/aggregation';

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

  const sessionId = url.searchParams.get('id');

  if (sessionId) {
    const detail = await getSessionDetail(sessionId);
    if (!detail) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(detail), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0'), 0);
  const data = await getRecentSessions(limit, offset);

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
