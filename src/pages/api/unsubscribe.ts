/**
 * Unsubscribe Endpoint
 *
 * GET  /api/unsubscribe?email=xxx — shows confirmation page (safe from link prefetch)
 * POST /api/unsubscribe         — actually unsubscribes
 */

import type { APIRoute } from 'astro';
import { db } from '@lib/analytics/db';

export const prerender = false;

// GET: Show confirmation page (does NOT unsubscribe — prevents email scanner/prefetch issues)
export const GET: APIRoute = async ({ url }) => {
  const email = url.searchParams.get('email');

  if (!email) {
    return new Response('Missing email parameter', { status: 400 });
  }

  return new Response(
    `<!DOCTYPE html>
    <html lang="pl">
    <head><meta charset="utf-8"><title>Wypisanie z subskrypcji</title></head>
    <body style="font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
      <div style="text-align:center;max-width:400px;">
        <h1>Wypisanie z subskrypcji</h1>
        <p>Czy na pewno chcesz się wypisać z powiadomień bloga LiveSales?</p>
        <form method="POST" action="/api/unsubscribe">
          <input type="hidden" name="email" value="${email.replace(/"/g, '&quot;')}" />
          <button type="submit"
            style="padding:12px 32px;background:#dc2626;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:16px;">
            Potwierdź wypisanie
          </button>
        </form>
        <p style="margin-top:16px;"><a href="/blog" style="color:#2563eb;">Wróć do bloga</a></p>
      </div>
    </body>
    </html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
};

// POST: Actually unsubscribe
export const POST: APIRoute = async ({ request }) => {
  if (!db) {
    return new Response('Service unavailable', { status: 503 });
  }

  let email: string | null = null;

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    const formData = await request.formData();
    email = formData.get('email') as string;
  } else {
    try {
      const body = await request.json();
      email = body.email;
    } catch {
      return new Response('Invalid request', { status: 400 });
    }
  }

  if (!email || typeof email !== 'string') {
    return new Response('Missing email', { status: 400 });
  }

  await db.execute({
    sql: 'UPDATE subscribers SET unsubscribed = 1 WHERE email = ?',
    args: [email.toLowerCase().trim()],
  });

  return new Response(
    `<!DOCTYPE html>
    <html lang="pl">
    <head><meta charset="utf-8"><title>Wypisano</title></head>
    <body style="font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
      <div style="text-align:center;">
        <h1>Wypisano pomyślnie</h1>
        <p>Nie będziesz już otrzymywać powiadomień.</p>
        <a href="/blog" style="color:#2563eb;">Wróć do bloga</a>
      </div>
    </body>
    </html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
  );
};
