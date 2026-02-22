/**
 * Subscriber CRUD Operations
 */

import { db } from './db';
import type { Subscriber } from './types';

export async function findByEmail(email: string): Promise<Subscriber | null> {
  if (!db) return null;

  const result = await db.execute({
    sql: 'SELECT * FROM subscribers WHERE email = ?',
    args: [email.toLowerCase().trim()],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id as number,
    email: row.email as string,
    lang: row.lang as string,
    sourceSlug: row.source_slug as string,
    confirmed: Boolean(row.confirmed),
    unsubscribed: Boolean(row.unsubscribed),
    confirmToken: row.confirm_token as string | null,
    createdAt: row.created_at as string,
  };
}

export async function findByToken(token: string): Promise<Subscriber | null> {
  if (!db) return null;

  const result = await db.execute({
    sql: 'SELECT * FROM subscribers WHERE confirm_token = ?',
    args: [token],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    id: row.id as number,
    email: row.email as string,
    lang: row.lang as string,
    sourceSlug: row.source_slug as string,
    confirmed: Boolean(row.confirmed),
    unsubscribed: Boolean(row.unsubscribed),
    confirmToken: row.confirm_token as string | null,
    createdAt: row.created_at as string,
  };
}

export async function createSubscriber(
  email: string,
  lang: string,
  sourceSlug: string,
  confirmToken: string,
): Promise<void> {
  if (!db) return;

  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(); // 48h

  await db.execute({
    sql: `INSERT INTO subscribers (email, lang, source_slug, confirm_token, token_expires_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            confirm_token = excluded.confirm_token,
            token_expires_at = excluded.token_expires_at,
            source_slug = excluded.source_slug,
            unsubscribed = 0`,
    args: [email.toLowerCase().trim(), lang, sourceSlug, confirmToken, expiresAt],
  });
}

export async function confirmSubscriber(token: string): Promise<boolean> {
  if (!db) return false;

  const subscriber = await findByToken(token);
  if (!subscriber) return false;

  // Check token expiry
  if (subscriber.confirmToken) {
    const result = await db.execute({
      sql: `SELECT token_expires_at FROM subscribers WHERE confirm_token = ?`,
      args: [token],
    });
    const expiresAt = result.rows[0]?.token_expires_at as string | undefined;
    if (expiresAt && new Date(expiresAt) < new Date()) {
      return false; // Token expired
    }
  }

  await db.execute({
    sql: `UPDATE subscribers SET confirmed = 1, confirm_token = NULL, token_expires_at = NULL WHERE confirm_token = ?`,
    args: [token],
  });

  return true;
}

export async function unsubscribe(token: string): Promise<boolean> {
  if (!db) return false;

  // We use a separate unsubscribe token stored temporarily
  const result = await db.execute({
    sql: `UPDATE subscribers SET unsubscribed = 1 WHERE id = (
      SELECT id FROM subscribers WHERE confirm_token = ? OR email = ?
    )`,
    args: [token, token], // token can be email for direct unsubscribe
  });

  return (result.rowsAffected ?? 0) > 0;
}

/**
 * Link a subscriber to their visitor_hash via session ID.
 * Called during subscription to enable subscriber behavior tracking.
 */
export async function linkSubscriberToVisitor(email: string, sessionId: string): Promise<void> {
  if (!db || !sessionId) return;

  // Find subscriber
  const subscriber = await findByEmail(email);
  if (!subscriber) return;

  // Find visitor_hash from this session's analytics events
  const result = await db.execute({
    sql: `SELECT DISTINCT visitor_hash FROM analytics_events
          WHERE session_id = ? LIMIT 1`,
    args: [sessionId],
  });

  if (result.rows.length === 0) return;

  const visitorHash = result.rows[0].visitor_hash as string;

  await db.execute({
    sql: `INSERT OR IGNORE INTO subscriber_visitors (subscriber_id, visitor_hash)
          VALUES (?, ?)`,
    args: [subscriber.id, visitorHash],
  });
}
