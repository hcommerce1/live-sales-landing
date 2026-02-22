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
  `CREATE INDEX IF NOT EXISTS idx_events_slug_type_created ON analytics_events (slug, event_type, created_at)`,

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

  // Click heatmap index
  `CREATE INDEX IF NOT EXISTS idx_events_click ON analytics_events (event_type, slug, created_at) WHERE event_type = 'click'`,

  // Subscriber-visitor linking
  `CREATE TABLE IF NOT EXISTS subscriber_visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subscriber_id INTEGER NOT NULL,
    visitor_hash TEXT NOT NULL,
    linked_at TEXT DEFAULT (datetime('now')),
    UNIQUE(subscriber_id, visitor_hash)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_sub_vis_subscriber ON subscriber_visitors (subscriber_id)`,
  `CREATE INDEX IF NOT EXISTS idx_sub_vis_visitor ON subscriber_visitors (visitor_hash)`,

  // Subscriber groups (for aggregate profiling)
  `CREATE TABLE IF NOT EXISTS subscriber_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    criteria TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  // Group membership
  `CREATE TABLE IF NOT EXISTS subscriber_group_members (
    subscriber_id INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    added_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (subscriber_id, group_id)
  )`,

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
