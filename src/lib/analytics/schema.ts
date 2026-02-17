/**
 * Database Schema — run once to initialise tables.
 *
 * Usage:
 *   import { initSchema } from './schema';
 *   await initSchema();
 *
 * Safe to call multiple times (IF NOT EXISTS).
 */

import { db } from './db';

const TABLES = [
  // Raw analytics events
  `CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_hash TEXT NOT NULL,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    slug TEXT NOT NULL,
    lang TEXT DEFAULT 'pl',
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_events_slug_type ON analytics_events (slug, event_type)`,
  `CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events (created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_events_visitor ON analytics_events (visitor_hash)`,
  `CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events (session_id)`,
  `CREATE INDEX IF NOT EXISTS idx_events_session_created ON analytics_events (session_id, created_at)`,

  // Subscribers
  `CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    lang TEXT DEFAULT 'pl',
    source_slug TEXT,
    confirmed INTEGER DEFAULT 0,
    unsubscribed INTEGER DEFAULT 0,
    confirm_token TEXT,
    token_expires_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers (email)`,
  `CREATE INDEX IF NOT EXISTS idx_subscribers_token ON subscribers (confirm_token)`,

  // Search query logs
  `CREATE TABLE IF NOT EXISTS search_queries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query TEXT NOT NULL,
    language TEXT DEFAULT 'all',
    results_count INTEGER DEFAULT 0,
    clicked_slug TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE INDEX IF NOT EXISTS idx_search_created ON search_queries (created_at)`,

  // Audio cache
  `CREATE TABLE IF NOT EXISTS audio_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    lang TEXT DEFAULT 'pl',
    audio_url TEXT NOT NULL,
    content_hash TEXT NOT NULL,
    duration_seconds REAL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(slug, lang)
  )`,
];

export async function initSchema(): Promise<void> {
  if (!db) {
    console.warn('[Schema] DB not configured — skipping schema init');
    return;
  }

  for (const sql of TABLES) {
    await db.execute(sql);
  }

  console.log('[Schema] All tables initialised');
}
