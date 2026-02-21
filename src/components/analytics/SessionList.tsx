/**
 * Session List
 *
 * Table of recent user sessions with clickable rows.
 * Fetches from /api/analytics/sessions and supports pagination.
 */

import { useState, useEffect } from 'react';
import type { SessionSummary } from '@lib/analytics/types';

interface Props {
  onSelectSession: (sessionId: string) => void;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'teraz';
  if (mins < 60) return `${mins} min temu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h temu`;
  const days = Math.floor(hours / 24);
  return `${days}d temu`;
}

function formatReferrer(ref: string): string {
  if (!ref || ref === '(direct)') return 'direct';
  try {
    return new URL(ref).hostname.replace('www.', '');
  } catch {
    return ref.slice(0, 30);
  }
}

export default function SessionList({ onSelectSession }: Props) {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const LIMIT = 30;

  useEffect(() => {
    setLoading(true);
    fetch(`/api/analytics/sessions?limit=${LIMIT}&offset=${offset}`)
      .then(r => r.json())
      .then(data => {
        if (offset === 0) {
          setSessions(data.sessions);
        } else {
          setSessions(prev => [...prev, ...data.sessions]);
        }
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [offset]);

  if (loading && sessions.length === 0) {
    return (
      <div className="space-y-2 animate-pulse">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-12 bg-gray-100 rounded-lg" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p className="text-sm">Brak sesji za ostatnie 7 dni</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2 font-medium">Visitor</th>
              <th className="pb-2 font-medium">Kiedy</th>
              <th className="pb-2 font-medium text-right pr-4">Strony</th>
              <th className="pb-2 font-medium pl-2">Landing</th>
              <th className="pb-2 font-medium">Źródło</th>
              <th className="pb-2 font-medium text-right">Czas</th>
              <th className="pb-2 font-medium text-right">Scroll</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr
                key={s.sessionId}
                onClick={() => onSelectSession(s.sessionId)}
                className="border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors"
              >
                <td className="py-2">
                  <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                    {s.visitorHash}
                  </span>
                </td>
                <td className="py-2 text-gray-500 whitespace-nowrap">{timeAgo(s.sessionStart)}</td>
                <td className="py-2 text-right pr-4">
                  <span className={`font-medium ${s.pageCount > 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {s.pageCount}
                  </span>
                </td>
                <td className="py-2 pl-2 text-gray-700 max-w-[200px] truncate">{s.landingPage}</td>
                <td className="py-2 text-gray-500 max-w-[150px] truncate">{formatReferrer(s.referrer)}</td>
                <td className="py-2 text-right text-gray-700 whitespace-nowrap">{formatDuration(s.totalTime)}</td>
                <td className="py-2 text-right">
                  <span className={`font-medium ${
                    s.avgDepth >= 75 ? 'text-green-600' :
                    s.avgDepth >= 40 ? 'text-yellow-600' : 'text-gray-400'
                  }`}>
                    {s.avgDepth}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sessions.length < total && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setOffset(prev => prev + LIMIT)}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Ładowanie...' : `Załaduj więcej (${sessions.length}/${total})`}
          </button>
        </div>
      )}
    </div>
  );
}
