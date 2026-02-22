/**
 * Blog Email Subscription Endpoint
 *
 * POST /api/subscribe — subscribe with email
 * GET  /api/subscribe?confirm=TOKEN — confirm subscription
 *
 * Security:
 * - Rate limited (5 req/min per IP)
 * - Email validation
 * - Double opt-in (confirmation email via Resend)
 * - Crypto-secure confirmation tokens (48h expiry)
 */

import type { APIRoute } from 'astro';
import { Resend } from 'resend';
import { createSubscriber, confirmSubscriber, findByEmail, linkSubscriberToVisitor } from '@lib/analytics/subscribers';
import { initSchema } from '@lib/analytics/schema';
import { db } from '@lib/analytics/db';

export const prerender = false;

const resend = new Resend(
  typeof import.meta !== 'undefined' && import.meta.env?.RESEND_API_KEY
    ? import.meta.env.RESEND_API_KEY
    : process.env.RESEND_API_KEY,
);

// --- Schema init ---
let schemaReady = false;
async function ensureSchema() {
  if (schemaReady || !db) return;
  await initSchema();
  schemaReady = true;
}

// --- Rate Limiter ---
interface RateLimitEntry { count: number; resetAt: number }
const RATE_WINDOW = 60_000;
const RATE_MAX = 5;
const rateLimits = new Map<string, RateLimitEntry>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimits.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimits.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_MAX;
}

// --- Email validation ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function jsonResponse(data: object, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// --- GET: Confirm subscription ---
export const GET: APIRoute = async ({ url }) => {
  const token = url.searchParams.get('confirm');
  if (!token) {
    return jsonResponse({ error: 'Missing confirmation token' }, 400);
  }

  await ensureSchema();
  const confirmed = await confirmSubscriber(token);

  if (!confirmed) {
    return new Response(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Błąd</title></head>
       <body style="font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
       <div style="text-align:center;"><h1>Link wygasł lub jest nieprawidłowy</h1>
       <p>Spróbuj zasubskrybować ponownie.</p></div></body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
    );
  }

  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Potwierdzone!</title></head>
     <body style="font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
     <div style="text-align:center;"><h1>Subskrypcja potwierdzona!</h1>
     <p>Będziesz otrzymywać powiadomienia o nowych artykułach.</p>
     <a href="/blog" style="color:#2563eb;">Wróć do bloga</a></div></body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
};

// --- POST: Subscribe ---
export const POST: APIRoute = async ({ request }) => {
  if (!db) {
    return jsonResponse({ error: 'Service unavailable' }, 503);
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';

  if (isRateLimited(ip)) {
    return jsonResponse({ error: 'Zbyt wiele prób. Spróbuj za chwilę.' }, 429);
  }

  let body: { email?: string; lang?: string; slug?: string; sid?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid request' }, 400);
  }

  const email = body.email?.trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return jsonResponse({ error: 'Podaj prawidłowy adres email.' }, 400);
  }

  const lang = body.lang === 'en' ? 'en' : 'pl';
  const sourceSlug = body.slug || 'unknown';

  await ensureSchema();

  // Check if already confirmed
  const existing = await findByEmail(email);
  if (existing?.confirmed && !existing.unsubscribed) {
    return jsonResponse({ message: 'Już jesteś zasubskrybowany!' }, 200);
  }

  // Generate crypto-secure token
  const token = crypto.randomUUID();

  await createSubscriber(email, lang, sourceSlug, token);

  // Link subscriber to visitor hash (non-blocking)
  if (body.sid) {
    linkSubscriberToVisitor(email, body.sid).catch(err => {
      console.error('[Subscribe] Visitor linking error:', err);
    });
  }

  // Send confirmation email
  const siteUrl = typeof import.meta !== 'undefined' && import.meta.env?.SITE_URL
    ? import.meta.env.SITE_URL
    : process.env.SITE_URL || 'https://live-sales.pl';

  const confirmUrl = `${siteUrl}/api/subscribe?confirm=${token}`;

  try {
    await resend.emails.send({
      from: typeof import.meta !== 'undefined' && import.meta.env?.EMAIL_FROM
        ? import.meta.env.EMAIL_FROM
        : process.env.EMAIL_FROM || 'LiveSales Blog <blog@live-sales.pl>',
      to: email,
      subject: 'Potwierdź subskrypcję bloga LiveSales',
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2>Cześć!</h2>
          <p>Kliknij poniższy przycisk, aby potwierdzić subskrypcję bloga LiveSales.</p>
          <a href="${confirmUrl}"
             style="display:inline-block;padding:12px 32px;background:#2563eb;color:white;text-decoration:none;border-radius:8px;font-weight:600;margin:16px 0;">
            Potwierdź subskrypcję
          </a>
          <p style="color:#6b7280;font-size:14px;">
            Jeśli nie prosiłeś o subskrypcję, zignoruj ten email.
          </p>
          <p style="color:#9ca3af;font-size:12px;">Link ważny 48 godzin.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Subscribe] Email send error:', err);
    return jsonResponse({ error: 'Nie udało się wysłać emaila. Spróbuj później.' }, 500);
  }

  return jsonResponse({
    message: 'Sprawdź swoją skrzynkę email i potwierdź subskrypcję.',
  }, 200);
};
