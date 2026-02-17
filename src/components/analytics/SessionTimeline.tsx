/**
 * Session Timeline
 *
 * Vertical visual timeline of a user's journey through the site.
 * Shows entry source, each page visited with scroll depth + time, and exit.
 */

import type { SessionPageVisit } from '@lib/analytics/types';

interface Props {
  referrer: string;
  pageVisits: SessionPageVisit[];
  sessionStart: string;
  sessionEnd: string;
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return iso;
  }
}

function formatReferrer(ref: string): string {
  if (!ref || ref === '(direct)') return '(direct)';
  try {
    return new URL(ref).hostname;
  } catch {
    return ref;
  }
}

function eventBadges(events: SessionPageVisit['events']): Array<{ label: string; color: string }> {
  const badges: Array<{ label: string; color: string }> = [];
  const copies = events.filter(e => e.eventType === 'copy').length;
  const ctaClicks = events.filter(e => e.eventType === 'cta_click').length;
  const searches = events.filter(e => e.eventType === 'search_overlay').length;

  if (copies > 0) badges.push({ label: `${copies} copy`, color: 'bg-purple-100 text-purple-700' });
  if (ctaClicks > 0) badges.push({ label: `${ctaClicks} CTA`, color: 'bg-orange-100 text-orange-700' });
  if (searches > 0) badges.push({ label: `${searches} search`, color: 'bg-cyan-100 text-cyan-700' });

  return badges;
}

export default function SessionTimeline({ referrer, pageVisits, sessionStart, sessionEnd }: Props) {
  const totalSeconds = Math.round(
    (new Date(sessionEnd).getTime() - new Date(sessionStart).getTime()) / 1000,
  );

  return (
    <div className="relative pl-8">
      {/* Vertical connecting line */}
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Entry node */}
      <div className="relative mb-6">
        <div className="absolute -left-5 w-6 h-6 rounded-full bg-green-500 border-2 border-white shadow-sm flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Wejście</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{formatReferrer(referrer)}</p>
          <p className="text-xs text-gray-500 mt-0.5">{formatTimestamp(sessionStart)}</p>
        </div>
      </div>

      {/* Page visit nodes */}
      {pageVisits.map((page, i) => {
        const badges = eventBadges(page.events);
        return (
          <div key={i} className="relative mb-6">
            <div className="absolute -left-5 w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-sm flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">{i + 1}</span>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-900 break-all">
                /{page.slug}
              </p>
              <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  {page.scrollDepth}%
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatTime(page.timeSpent)}
                </span>
                <span>{formatTimestamp(page.enteredAt)}</span>
              </div>
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {badges.map((b, j) => (
                    <span key={j} className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${b.color}`}>
                      {b.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Exit node */}
      <div className="relative">
        <div className="absolute -left-5 w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-sm flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-xs font-medium text-red-700 uppercase tracking-wider">Wyjście</p>
          <p className="text-sm text-gray-600 mt-0.5">
            Sesja: {formatTime(totalSeconds)} · {pageVisits.length} {pageVisits.length === 1 ? 'strona' : 'stron'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{formatTimestamp(sessionEnd)}</p>
        </div>
      </div>
    </div>
  );
}
