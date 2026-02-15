/**
 * Analytics System Type Definitions
 */

export type EventType =
  | 'pageview'
  | 'copy'
  | 'scroll_dwell'
  | 'quit'
  | 'search'
  | 'search_click'
  | 'search_overlay'
  | 'cta_click'
  | 'return_visit'
  | 'interaction'
  | 'subscribe';

export const VALID_EVENT_TYPES: ReadonlySet<string> = new Set<EventType>([
  'pageview', 'copy', 'scroll_dwell', 'quit', 'search',
  'search_click', 'search_overlay', 'cta_click', 'return_visit',
  'interaction', 'subscribe',
]);

export interface AnalyticsEvent {
  visitorHash: string;
  sessionId: string;
  eventType: EventType;
  slug: string;
  lang: string;
  metadata?: string | null; // JSON string
}

/** Payload sent from client tracker via sendBeacon */
export interface TrackingPayload {
  events: Array<{
    type: string;
    slug: string;
    lang?: string;
    meta?: Record<string, unknown>;
    ts?: number;
  }>;
  sid: string; // session ID
}

export interface DailyStats {
  date: string;
  slug: string;
  lang: string;
  pageviews: number;
  uniqueVisitors: number;
  avgReadTimeSeconds: number;
  avgScrollDepth: number;
  bounceCount: number;
  ctaClicks: number;
  searchImpressions: number;
  interactions: number;
}

export interface SearchQueryLog {
  query: string;
  language: string;
  resultsCount: number;
  clickedSlug?: string | null;
}

export interface Subscriber {
  id: number;
  email: string;
  lang: string;
  sourceSlug: string;
  confirmed: boolean;
  unsubscribed: boolean;
  confirmToken: string | null;
  createdAt: string;
}

export interface AudioCacheEntry {
  id: number;
  slug: string;
  lang: string;
  audioUrl: string;
  contentHash: string;
  durationSeconds: number;
  createdAt: string;
}
