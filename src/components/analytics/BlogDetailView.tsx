/**
 * BlogDetailView — detailed analytics for a single blog post.
 * Fetches from /api/analytics/blog-detail?slug=X&days=Y
 */

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { StatCard, Section, EmptyState, LoadingSkeleton } from './shared';
import BlogImprovements from './BlogImprovements';

interface BlogDetailData {
  overview: {
    pageviews: number;
    uniqueVisitors: number;
    avgScrollDepth: number;
    avgTime: number;
    copies: number;
    interactions: number;
    findInPageSearches: number;
    readRate: number;
    subscriptions: number;
  } | null;
  pageviewsByDay: Array<{ day: string; views: number; uniqueVisitors: number }>;
  scrollHeatmap: Array<{ segment: string; position: number; avgDwellTime: number }>;
  copyLog: Array<{ text: string; count: number; lastCopied: string }>;
  findInPage: Array<{
    query: string; count: number; avgMatches: number;
    avgNavigated: number; avgDurationMs: number; lastSearched: string;
  }>;
  quitDepth: Array<{ depthBucket: string; depthValue: number; count: number }>;
}

interface Props {
  slug: string;
  days: number;
  onBack: () => void;
}

export default function BlogDetailView({ slug, days, onBack }: Props) {
  const [data, setData] = useState<BlogDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/analytics/blog-detail?slug=${encodeURIComponent(slug)}&days=${days}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [slug, days]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        Błąd ładowania danych: {error}
      </div>
    );
  }

  if (!data) return null;

  const o = data.overview;

  function formatTime(seconds: number) {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Wróć do listy
        </button>
        <span className="text-gray-300">/</span>
        <h2 className="text-lg font-bold text-gray-900 truncate max-w-lg">{slug}</h2>
      </div>

      {/* Overview stat cards */}
      {o && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatCard label="Odsłony" value={o.pageviews} />
          <StatCard label="Unikalni" value={o.uniqueVisitors} />
          <StatCard label="Śr. scroll depth" value={`${o.avgScrollDepth}%`} />
          <StatCard label="Śr. czas" value={formatTime(o.avgTime)} />
          <StatCard label="% czytelników" value={`${o.readRate}%`} />
          <StatCard label="Subskrypcje" value={o.subscriptions} />
          <StatCard label="Kopie (Ctrl+C)" value={o.copies} />
          <StatCard label="Interakcje" value={o.interactions} />
          <StatCard label="Ctrl+F szukania" value={o.findInPageSearches} />
        </div>
      )}

      {/* Pageviews over time */}
      <Section title="Odsłony w czasie">
        {data.pageviewsByDay.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data.pageviewsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="views" name="Odsłony" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} />
              <Area type="monotone" dataKey="uniqueVisitors" name="Unikalni" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </Section>

      {/* Scroll heatmap */}
      <Section title="Scroll Heatmap (czas spędzony per pozycja)">
        {data.scrollHeatmap.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.scrollHeatmap}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'sek.', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(val) => [`${String(val)}s`, 'Śr. czas']} />
              <Bar dataKey="avgDwellTime" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </Section>

      {/* Ctrl+F searches */}
      <Section title="Ctrl+F — czego szukają w tym artykule">
        {data.findInPage.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Zapytanie</th>
                  <th className="pb-2 font-medium text-right">Ile razy</th>
                  <th className="pb-2 font-medium text-right">Śr. trafień</th>
                  <th className="pb-2 font-medium text-right">Śr. czas</th>
                </tr>
              </thead>
              <tbody>
                {data.findInPage.map((f, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-900">{f.query}</td>
                    <td className="py-2 text-right">{f.count}</td>
                    <td className="py-2 text-right">{f.avgMatches}</td>
                    <td className="py-2 text-right">
                      {f.avgDurationMs > 1000
                        ? `${(f.avgDurationMs / 1000).toFixed(1)}s`
                        : `${f.avgDurationMs}ms`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Brak wyszukiwań Ctrl+F w tym artykule" />
        )}
      </Section>

      {/* Copy log */}
      <Section title="Co kopiują z tego artykułu">
        {data.copyLog.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {data.copyLog.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded whitespace-nowrap">
                  x{c.count}
                </span>
                <p className="text-sm text-gray-900 break-words flex-1">
                  {(c.text || '').slice(0, 200)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Brak skopiowanych fragmentów" />
        )}
      </Section>

      {/* Quit depth */}
      <Section title="Quit rate wg głębokości">
        {data.quitDepth.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.quitDepth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="depthBucket" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" name="Użytkownicy" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </Section>

      {/* AI Improvement Suggestions */}
      <Section title="Sugestie ulepszeń (AI)">
        <BlogImprovements slug={slug} days={days} />
      </Section>
    </div>
  );
}
