/**
 * Analytics Ingestion Endpoint
 *
 * POST /api/analytics
 *
 * Receives batched tracking events from the client-side AnalyticsTracker.
 * Compatible with navigator.sendBeacon (fires on page unload).
 *
 * Security:
 * - Rate limited (100 req/min per IP)
 * - Visitor hash computed server-side (SHA-256 of IP + UA + daily salt)
 * - Strict payload validation (whitelist event types, max sizes)
 * - No PII stored
 */

import type { APIRoute } from 'astro';
import { insertEventsBatch } from '@lib/analytics/events';
import { initSchema } from '@lib/analytics/schema';
import { VALID_EVENT_TYPES, type EventType, type TrackingPayload } from '@lib/analytics/types';
import { db } from '@lib/analytics/db';

export const prerender = false;

// --- Schema init (once per cold start) ---
let schemaReady = false;
async function ensureSchema() {
  if (schemaReady || !db) return;
  await initSchema();
  schemaReady = true;
}

// --- Rate Limiter ---
interface RateLimitEntry { count: number; resetAt: number }
const RATE_WINDOW = 60_000;
const RATE_MAX = 100;
const rateLimits = new Map<string, RateLimitEntry>();
let gcCounter = 0;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  if (++gcCounter % 200 === 0) {
    for (const [k, v] of rateLimits) {
      if (now > v.resetAt) rateLimits.delete(k);
    }
  }
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

// --- Helpers ---
function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

async function computeVisitorHash(ip: string, ua: string): Promise<string> {
  // Daily salt so the same user gets a different hash each day (privacy)
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const data = new TextEncoder().encode(ip + ua + today);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

const SLUG_RE = /^[a-z0-9\-_/]{1,200}$/i;
const MAX_SESSION_ID = 64;
const MAX_METADATA_TEXT = 2000;
const MAX_EVENTS = 50;
const MAX_BODY_SIZE = 65_536; // 64KB

function sanitizeMetadata(meta: Record<string, unknown> | undefined): string | null {
  if (!meta) return null;

  // Strip HTML from text fields (copy tracking)
  if (typeof meta.text === 'string') {
    meta.text = meta.text.replace(/<[^>]*>/g, '').slice(0, MAX_METADATA_TEXT);
  }

  const json = JSON.stringify(meta);
  if (json.length > MAX_BODY_SIZE) return null;
  return json;
}

// --- Route Handler ---
export const POST: APIRoute = async ({ request }) => {
  if (!db) {
    console.error('[Analytics API] db is null — TURSO_DATABASE_URL missing');
    return new Response(null, { status: 503 });
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return new Response(null, { status: 429 });
  }

  // Parse body
  let body: TrackingPayload;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_SIZE) {
      return new Response(null, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return new Response(null, { status: 400 });
  }

  // Validate structure
  if (!body.events || !Array.isArray(body.events) || body.events.length === 0 || body.events.length > MAX_EVENTS) {
    return new Response(null, { status: 400 });
  }
  if (!body.sid || typeof body.sid !== 'string' || body.sid.length > MAX_SESSION_ID) {
    return new Response(null, { status: 400 });
  }

  // Compute visitor hash server-side
  const ua = request.headers.get('user-agent') || 'unknown';
  const visitorHash = await computeVisitorHash(ip, ua);

  // Ensure schema
  try {
    await ensureSchema();
  } catch (err) {
    console.error('[Analytics API] Schema init error:', err);
    return new Response(null, { status: 500 });
  }

  // Filter and validate events
  const validEvents = body.events
    .filter(e =>
      e.type && VALID_EVENT_TYPES.has(e.type) &&
      e.slug && typeof e.slug === 'string' && SLUG_RE.test(e.slug)
    )
    .map(e => ({
      visitorHash,
      sessionId: body.sid,
      eventType: e.type as EventType,
      slug: e.slug,
      lang: (e.lang === 'en' ? 'en' : 'pl'),
      metadata: sanitizeMetadata(e.meta),
    }));

  if (validEvents.length > 0) {
    try {
      await insertEventsBatch(validEvents);
    } catch (err) {
      console.error('[Analytics API] Insert error:', err);
      return new Response(null, { status: 500 });
    }
  }

  return new Response(null, { status: 204 });
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
