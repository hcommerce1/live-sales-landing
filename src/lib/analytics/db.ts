/**
 * Turso (LibSQL) Database Client
 *
 * Follows the same env-var pattern as src/lib/openai.ts
 * Supports both import.meta.env (Astro/Vite) and process.env (Node.js scripts).
 */

import { createClient, type Client } from '@libsql/client';

const url =
  typeof import.meta !== 'undefined' && import.meta.env?.TURSO_DATABASE_URL
    ? import.meta.env.TURSO_DATABASE_URL
    : process.env.TURSO_DATABASE_URL;

const authToken =
  typeof import.meta !== 'undefined' && import.meta.env?.TURSO_AUTH_TOKEN
    ? import.meta.env.TURSO_AUTH_TOKEN
    : process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.warn('[Analytics DB] TURSO_DATABASE_URL not set — analytics disabled');
}

export const db: Client | null = url
  ? createClient({ url, authToken: authToken || undefined })
  : null;
