/**
 * Analytics Event Operations
 *
 * Insert / query analytics events in Turso.
 */

import { db } from './db';
import type { AnalyticsEvent, SearchQueryLog } from './types';

/**
 * Insert a single analytics event.
 */
export async function insertEvent(event: AnalyticsEvent): Promise<void> {
  if (!db) return;

  await db.execute({
    sql: `INSERT INTO analytics_events (visitor_hash, session_id, event_type, slug, lang, metadata)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      event.visitorHash,
      event.sessionId,
      event.eventType,
      event.slug,
      event.lang,
      event.metadata ?? null,
    ],
  });
}

/**
 * Insert multiple analytics events in a single transaction.
 * More efficient for batched tracker payloads.
 */
export async function insertEventsBatch(events: AnalyticsEvent[]): Promise<void> {
  if (!db || events.length === 0) return;

  await db.batch(
    events.map((e) => ({
      sql: `INSERT INTO analytics_events (visitor_hash, session_id, event_type, slug, lang, metadata)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        e.visitorHash,
        e.sessionId,
        e.eventType,
        e.slug,
        e.lang,
        e.metadata ?? null,
      ],
    })),
  );
}

/**
 * Log a search query (fire-and-forget from /api/search).
 */
export async function logSearchQuery(log: SearchQueryLog): Promise<void> {
  if (!db) return;

  await db.execute({
    sql: `INSERT INTO search_queries (query, language, results_count, clicked_slug)
          VALUES (?, ?, ?, ?)`,
    args: [
      log.query,
      log.language,
      log.resultsCount,
      log.clickedSlug ?? null,
    ],
  });
}
