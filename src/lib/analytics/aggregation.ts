/**
 * Analytics Aggregation Queries
 *
 * SQL queries for the dashboard — all read from Turso.
 */

import { db } from './db';
import type { SessionSummary, SessionDetail, SessionPageVisit, RealtimeDataPoint } from './types';

function sinceDate(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString();
}

// --- Overview Stats ---

export async function getOverviewStats(days: number) {
  if (!db) return null;

  const since = sinceDate(days);

  const [pageviews, uniqueVisitors, avgQuitDepth, bounces] = await Promise.all([
    db.execute({
      sql: `SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'pageview' AND created_at >= ?`,
      args: [since],
    }),
    db.execute({
      sql: `SELECT COUNT(DISTINCT visitor_hash) as count FROM analytics_events WHERE event_type = 'pageview' AND created_at >= ?`,
      args: [since],
    }),
    db.execute({
      sql: `SELECT AVG(json_extract(metadata, '$.depth')) as avg_depth FROM analytics_events WHERE event_type = 'quit' AND created_at >= ?`,
      args: [since],
    }),
    db.execute({
      sql: `SELECT COUNT(*) as count FROM analytics_events WHERE event_type = 'quit' AND json_extract(metadata, '$.timeSpent') < 10 AND json_extract(metadata, '$.depth') < 25 AND created_at >= ?`,
      args: [since],
    }),
  ]);

  const totalPageviews = pageviews.rows[0]?.count as number || 0;
  const bounceCount = bounces.rows[0]?.count as number || 0;

  return {
    pageviews: totalPageviews,
    uniqueVisitors: uniqueVisitors.rows[0]?.count as number || 0,
    avgScrollDepth: Math.round(avgQuitDepth.rows[0]?.avg_depth as number || 0),
    bounceRate: totalPageviews > 0 ? Math.round((bounceCount / totalPageviews) * 100) : 0,
  };
}

// --- Pageviews Over Time ---

export async function getPageviewsByDay(days: number) {
  if (!db) return [];

  const since = sinceDate(days);

  const result = await db.execute({
    sql: `SELECT date(created_at) as day, COUNT(*) as views, COUNT(DISTINCT visitor_hash) as unique_visitors
          FROM analytics_events
          WHERE event_type = 'pageview' AND created_at >= ?
          GROUP BY day ORDER BY day`,
    args: [since],
  });

  return result.rows.map(r => ({
    day: r.day as string,
    views: r.views as number,
    uniqueVisitors: r.unique_visitors as number,
  }));
}

// --- Post Rankings ---

export async function getPostRankings(days: number) {
  if (!db) return [];

  const since = sinceDate(days);

  const result = await db.execute({
    sql: `SELECT
            slug,
            COUNT(*) FILTER (WHERE event_type = 'pageview') as pageviews,
            COUNT(DISTINCT visitor_hash) FILTER (WHERE event_type = 'pageview') as unique_visitors,
            AVG(json_extract(metadata, '$.depth')) FILTER (WHERE event_type = 'quit') as avg_depth,
            AVG(json_extract(metadata, '$.timeSpent')) FILTER (WHERE event_type = 'quit') as avg_time,
            COUNT(*) FILTER (WHERE event_type = 'copy') as copies,
            COUNT(*) FILTER (WHERE event_type = 'interaction') as interactions,
            COUNT(*) FILTER (WHERE event_type = 'return_visit') as return_visits
          FROM analytics_events
          WHERE created_at >= ?
          GROUP BY slug
          ORDER BY pageviews DESC`,
    args: [since],
  });

  return result.rows.map(r => ({
    slug: r.slug as string,
    pageviews: r.pageviews as number || 0,
    uniqueVisitors: r.unique_visitors as number || 0,
    avgDepth: Math.round(r.avg_depth as number || 0),
    avgTime: Math.round(r.avg_time as number || 0),
    copies: r.copies as number || 0,
    interactions: r.interactions as number || 0,
    returnVisits: r.return_visits as number || 0,
  }));
}

// --- Scroll Heatmap ---

export async function getScrollHeatmap(days: number, slug?: string) {
  if (!db) return [];

  const since = sinceDate(days);

  const result = await db.execute({
    sql: `SELECT metadata FROM analytics_events
          WHERE event_type = 'scroll_dwell' AND created_at >= ?
          ${slug ? 'AND slug = ?' : ''}
          LIMIT 1000`,
    args: slug ? [since, slug] : [since],
  });

  // Aggregate all segment maps
  const totals = new Array(20).fill(0);
  let count = 0;

  for (const row of result.rows) {
    try {
      const meta = JSON.parse(row.metadata as string);
      if (meta.segments && Array.isArray(meta.segments)) {
        for (let i = 0; i < 20; i++) {
          totals[i] += meta.segments[i] || 0;
        }
        count++;
      }
    } catch { /* skip malformed */ }
  }

  if (count === 0) return [];

  return totals.map((total, i) => ({
    segment: `${i * 5}-${(i + 1) * 5}%`,
    position: i * 5 + 2.5, // midpoint
    avgDwellTime: Math.round(total / count),
  }));
}

// --- Copy Log ---

export async function getCopyLog(days: number, limit: number = 50) {
  if (!db) return [];

  const since = sinceDate(days);

  const result = await db.execute({
    sql: `SELECT slug, json_extract(metadata, '$.text') as copied_text, COUNT(*) as count, MAX(created_at) as last_copied
          FROM analytics_events
          WHERE event_type = 'copy' AND created_at >= ?
          GROUP BY slug, copied_text
          ORDER BY count DESC
          LIMIT ?`,
    args: [since, limit],
  });

  return result.rows.map(r => ({
    slug: r.slug as string,
    text: r.copied_text as string,
    count: r.count as number,
    lastCopied: r.last_copied as string,
  }));
}

// --- Find-in-Page Log ---

export async function getFindInPageLog(days: number, limit: number = 30) {
  if (!db) return [];

  const since = sinceDate(days);

  const result = await db.execute({
    sql: `SELECT
            json_extract(metadata, '$.query') as query,
            slug,
            COUNT(*) as count,
            AVG(json_extract(metadata, '$.matchCount')) as avg_matches,
            AVG(json_extract(metadata, '$.navigatedTo')) as avg_navigated,
            AVG(json_extract(metadata, '$.durationMs')) as avg_duration_ms,
            MAX(created_at) as last_searched
          FROM analytics_events
          WHERE event_type = 'find_in_page' AND created_at >= ?
          GROUP BY query, slug
          ORDER BY count DESC
          LIMIT ?`,
    args: [since, limit],
  });

  return result.rows.map(r => ({
    query: r.query as string,
    slug: r.slug as string,
    count: r.count as number,
    avgMatches: Math.round(r.avg_matches as number || 0),
    avgNavigated: Math.round((r.avg_navigated as number || 0) * 10) / 10,
    avgDurationMs: Math.round(r.avg_duration_ms as number || 0),
    lastSearched: r.last_searched as string,
  }));
}

// --- Quit Depth Distribution ---

export async function getQuitDepthDistribution(days: number, slug?: string) {
  if (!db) return [];

  const since = sinceDate(days);

  const result = await db.execute({
    sql: `SELECT
            CAST(json_extract(metadata, '$.depth') / 10 AS INTEGER) * 10 as depth_bucket,
            COUNT(*) as count
          FROM analytics_events
          WHERE event_type = 'quit' AND created_at >= ?
          ${slug ? 'AND slug = ?' : ''}
          GROUP BY depth_bucket
          ORDER BY depth_bucket`,
    args: slug ? [since, slug] : [since],
  });

  return result.rows.map(r => ({
    depthBucket: `${r.depth_bucket}%`,
    depthValue: r.depth_bucket as number,
    count: r.count as number,
  }));
}

// --- Search Insights ---

export async function getTopSearchQueries(days: number, limit: number = 20) {
  if (!db) return [];

  const since = sinceDate(days);

  const result = await db.execute({
    sql: `SELECT query, COUNT(*) as count,
          AVG(results_count) as avg_results,
          SUM(CASE WHEN clicked_slug IS NOT NULL THEN 1 ELSE 0 END) as clicks
          FROM search_queries
          WHERE created_at >= ?
          GROUP BY query ORDER BY count DESC LIMIT ?`,
    args: [since, limit],
  });

  return result.rows.map(r => ({
    query: r.query as string,
    count: r.count as number,
    avgResults: Math.round(r.avg_results as number || 0),
    clicks: r.clicks as number || 0,
    ctr: (r.count as number) > 0
      ? Math.round(((r.clicks as number || 0) / (r.count as number)) * 100)
      : 0,
  }));
}

// --- Return Visits ---

export async function getReturnVisitStats(days: number) {
  if (!db) return [];

  const since = sinceDate(days);

  const result = await db.execute({
    sql: `SELECT slug, COUNT(*) as return_count, AVG(json_extract(metadata, '$.visitCount')) as avg_visits
          FROM analytics_events
          WHERE event_type = 'return_visit' AND created_at >= ?
          GROUP BY slug
          ORDER BY return_count DESC`,
    args: [since],
  });

  return result.rows.map(r => ({
    slug: r.slug as string,
    returnCount: r.return_count as number,
    avgVisits: Math.round((r.avg_visits as number || 0) * 10) / 10,
  }));
}

// --- Subscription Stats ---

export async function getSubscriptionStats(days: number) {
  if (!db) return { total: 0, confirmed: 0, bySlug: [] };

  const since = sinceDate(days);

  const [totals, bySlug] = await Promise.all([
    db.execute({
      sql: `SELECT
              COUNT(*) as total,
              SUM(CASE WHEN confirmed = 1 THEN 1 ELSE 0 END) as confirmed,
              SUM(CASE WHEN unsubscribed = 1 THEN 1 ELSE 0 END) as unsubscribed
            FROM subscribers WHERE created_at >= ?`,
      args: [since],
    }),
    db.execute({
      sql: `SELECT source_slug, COUNT(*) as count
            FROM subscribers
            WHERE confirmed = 1 AND created_at >= ?
            GROUP BY source_slug ORDER BY count DESC`,
      args: [since],
    }),
  ]);

  return {
    total: totals.rows[0]?.total as number || 0,
    confirmed: totals.rows[0]?.confirmed as number || 0,
    unsubscribed: totals.rows[0]?.unsubscribed as number || 0,
    bySlug: bySlug.rows.map(r => ({
      slug: r.source_slug as string,
      count: r.count as number,
    })),
  };
}

// --- Realtime Traffic (5-min intervals) ---

export async function getRealtimeTraffic(hours: 24 | 48 = 24): Promise<RealtimeDataPoint[]> {
  if (!db) return [];

  const since = new Date(Date.now() - hours * 3600000).toISOString();

  const result = await db.execute({
    sql: `SELECT
            strftime('%Y-%m-%dT%H:', created_at) ||
              printf('%02d', (CAST(strftime('%M', created_at) AS INTEGER) / 5) * 5) as time_bucket,
            COUNT(*) as pageviews,
            COUNT(DISTINCT visitor_hash) as unique_visitors
          FROM analytics_events
          WHERE event_type = 'pageview'
            AND created_at >= ?
          GROUP BY time_bucket
          ORDER BY time_bucket ASC`,
    args: [since],
  });

  return result.rows.map(r => ({
    timeBucket: r.time_bucket as string,
    pageviews: r.pageviews as number,
    uniqueVisitors: r.unique_visitors as number,
  }));
}

// --- Recent Sessions ---

export async function getRecentSessions(limit: number = 50, offset: number = 0): Promise<{ sessions: SessionSummary[]; total: number }> {
  if (!db) return { sessions: [], total: 0 };

  const since = sinceDate(7);

  const countResult = await db.execute({
    sql: `SELECT COUNT(DISTINCT session_id) as total
          FROM analytics_events
          WHERE created_at >= ?`,
    args: [since],
  });
  const total = countResult.rows[0]?.total as number || 0;

  const result = await db.execute({
    sql: `SELECT
            session_id,
            MIN(created_at) as session_start,
            MAX(created_at) as session_end,
            COUNT(*) FILTER (WHERE event_type = 'pageview') as page_count,
            MIN(CASE WHEN event_type = 'pageview' THEN created_at END) as first_pv_time,
            MIN(CASE WHEN event_type = 'pageview' THEN slug END) as landing_page,
            MAX(CASE WHEN event_type = 'quit' THEN slug END) as exit_page,
            json_extract(
              MIN(CASE WHEN event_type = 'pageview' THEN metadata END),
              '$.referrer'
            ) as referrer,
            MAX(json_extract(metadata, '$.timeSpent')) FILTER (WHERE event_type = 'quit') as total_time,
            AVG(json_extract(metadata, '$.depth')) FILTER (WHERE event_type = 'quit') as avg_depth,
            visitor_hash
          FROM analytics_events
          WHERE created_at >= ?
          GROUP BY session_id
          HAVING page_count > 0
          ORDER BY session_start DESC
          LIMIT ? OFFSET ?`,
    args: [since, limit, offset],
  });

  return {
    total,
    sessions: result.rows.map(r => ({
      sessionId: r.session_id as string,
      sessionStart: r.session_start as string,
      sessionEnd: r.session_end as string,
      pageCount: r.page_count as number,
      landingPage: r.landing_page as string,
      exitPage: (r.exit_page as string) || (r.landing_page as string),
      referrer: (r.referrer as string) || '(direct)',
      totalTime: (r.total_time as number) || 0,
      avgDepth: Math.round((r.avg_depth as number) || 0),
      visitorHash: ((r.visitor_hash as string) || '').slice(0, 8),
    })),
  };
}

// --- Session Detail ---

export async function getSessionDetail(sessionId: string): Promise<SessionDetail | null> {
  if (!db) return null;

  const result = await db.execute({
    sql: `SELECT event_type, slug, metadata, created_at
          FROM analytics_events
          WHERE session_id = ?
          ORDER BY created_at ASC`,
    args: [sessionId],
  });

  if (result.rows.length === 0) return null;

  const events = result.rows.map(r => ({
    eventType: r.event_type as string,
    slug: r.slug as string,
    metadata: r.metadata ? JSON.parse(r.metadata as string) : null,
    createdAt: r.created_at as string,
  }));

  // Build page visit timeline
  const pageVisits: SessionPageVisit[] = [];
  let currentPage: SessionPageVisit | null = null;

  for (const event of events) {
    if (event.eventType === 'pageview') {
      if (currentPage) pageVisits.push(currentPage);
      currentPage = {
        slug: event.slug,
        enteredAt: event.createdAt,
        timeSpent: 0,
        scrollDepth: 0,
        events: [event],
      };
    } else if (currentPage) {
      currentPage.events.push(event);
      if (event.eventType === 'quit') {
        currentPage.timeSpent = event.metadata?.timeSpent as number || 0;
        currentPage.scrollDepth = event.metadata?.depth as number || 0;
      }
    }
  }
  if (currentPage) pageVisits.push(currentPage);

  const firstPageview = events.find(e => e.eventType === 'pageview');

  return {
    sessionId,
    referrer: (firstPageview?.metadata?.referrer as string) || '(direct)',
    landingPage: (firstPageview?.metadata?.path as string) || firstPageview?.slug || '',
    sessionStart: events[0].createdAt,
    sessionEnd: events[events.length - 1].createdAt,
    totalEvents: events.length,
    pageVisits,
  };
}
