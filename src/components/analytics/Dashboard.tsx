/**
 * Analytics Dashboard
 *
 * Main React island for /admin/analytics page.
 * Fetches data from /api/analytics/dashboard and renders:
 * - Overview cards
 * - Pageviews chart
 * - Post rankings table
 * - Scroll heatmap
 * - Copy log
 * - Quit depth chart
 * - Search insights
 * - Return visits
 * - Subscription stats
 */

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import RealtimeChart from './RealtimeChart';
import SessionList from './SessionList';
import SessionDrawer from './SessionDrawer';

type DateRange = 7 | 30 | 90;

interface DashboardData {
  overview: {
    pageviews: number;
    uniqueVisitors: number;
    avgScrollDepth: number;
    bounceRate: number;
  } | null;
  pageviewsByDay: Array<{ day: string; views: number; uniqueVisitors: number }>;
  postRankings: Array<{
    slug: string; pageviews: number; uniqueVisitors: number;
    avgDepth: number; avgTime: number; copies: number;
    interactions: number; returnVisits: number;
  }>;
  scrollHeatmap: Array<{ segment: string; position: number; avgDwellTime: number }>;
  copyLog: Array<{ slug: string; text: string; count: number; lastCopied: string }>;
  quitDepth: Array<{ depthBucket: string; depthValue: number; count: number }>;
  searchQueries: Array<{ query: string; count: number; avgResults: number; clicks: number; ctr: number }>;
  returnVisits: Array<{ slug: string; returnCount: number; avgVisits: number }>;
  subscriptions: {
    total: number; confirmed: number; unsubscribed?: number;
    bySlug: Array<{ slug: string; count: number }>;
  };
  findInPage: Array<{
    query: string; slug: string; count: number;
    avgMatches: number; avgNavigated: number;
    avgDurationMs: number; lastSearched: string;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [days, setDays] = useState<DateRange>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [selectedSession, setSelectedSession] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/dashboard?days=${days}`);
      if (res.status === 401) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setIsLoggedIn(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/analytics/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setIsLoggedIn(true);
        fetchData();
      } else {
        setError('Nieprawidłowy token');
      }
    } catch {
      setError('Błąd połączenia');
    }
  };

  // --- LOGIN FORM ---
  if (!isLoggedIn && !loading) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <h2 className="text-2xl font-bold mb-6 text-center">Dostęp do analityki</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={token}
            onChange={(e) => { setToken(e.target.value); setError(''); }}
            placeholder="Token dostępu"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Zaloguj
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    );
  }

  // --- LOADING ---
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="h-80 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-gray-500">Brak danych</div>;
  }

  const o = data.overview;
  const MIN_PAGEVIEWS = 50;
  const hasEnoughData = (o?.pageviews || 0) >= MIN_PAGEVIEWS;

  return (
    <div className="space-y-8">
      {/* Date Range Picker */}
      <div className="flex items-center gap-2">
        {([7, 30, 90] as DateRange[]).map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              days === d
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Not enough data banner */}
      {!hasEnoughData && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          Za mało danych do pełnej analizy ({o?.pageviews || 0}/{MIN_PAGEVIEWS} wymaganych pageviews). Wykresy mogą być nieprecyzyjne.
        </div>
      )}

      {/* Overview Cards */}
      {o && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Odsłony" value={o.pageviews} />
          <StatCard label="Unikalni" value={o.uniqueVisitors} />
          <StatCard label="Śr. scroll depth" value={`${o.avgScrollDepth}%`} />
          <StatCard label="Bounce rate" value={`${o.bounceRate}%`} color={o.bounceRate > 60 ? 'red' : o.bounceRate > 40 ? 'yellow' : 'green'} />
        </div>
      )}

      {/* Realtime Traffic */}
      <RealtimeChart />

      {/* Pageviews Over Time */}
      <Section title="Odsłony w czasie">
        {data.pageviewsByDay.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.pageviewsByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="views" name="Odsłony" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} />
              <Area type="monotone" dataKey="uniqueVisitors" name="Unikalni" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </Section>

      {/* Post Rankings */}
      <Section title="Ranking artykułów">
        {data.postRankings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Artykuł</th>
                  <th className="pb-2 font-medium text-right">Odsłony</th>
                  <th className="pb-2 font-medium text-right">Śr. depth</th>
                  <th className="pb-2 font-medium text-right">Śr. czas</th>
                  <th className="pb-2 font-medium text-right">Kopie</th>
                  <th className="pb-2 font-medium text-right">Powroty</th>
                </tr>
              </thead>
              <tbody>
                {data.postRankings.map(p => (
                  <tr key={p.slug} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-900 max-w-xs truncate">{p.slug}</td>
                    <td className="py-2 text-right">{p.pageviews}</td>
                    <td className="py-2 text-right">{p.avgDepth}%</td>
                    <td className="py-2 text-right">{p.avgTime}s</td>
                    <td className="py-2 text-right">{p.copies}</td>
                    <td className="py-2 text-right">{p.returnVisits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState />
        )}
      </Section>

      {/* Scroll Heatmap */}
      <Section title="Scroll Heatmap (czas spędzony per pozycja)">
        {data.scrollHeatmap.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.scrollHeatmap}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="segment" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: 'sekundy', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(val: number) => [`${val}s`, 'Śr. czas']} />
              <Bar dataKey="avgDwellTime" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </Section>

      {/* Copy Log */}
      <Section title="Co kopiują użytkownicy">
        {data.copyLog.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.copyLog.map((c, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xs font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded whitespace-nowrap">
                  x{c.count}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 break-words">{(c.text || '').slice(0, 200)}</p>
                  <p className="text-xs text-gray-400 mt-1">{c.slug}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </Section>

      {/* Find-in-Page Log */}
      <Section title="Ctrl+F — co szukają w artykułach">
        {data.findInPage && data.findInPage.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Zapytanie</th>
                  <th className="pb-2 font-medium">Artykuł</th>
                  <th className="pb-2 font-medium text-right">Ile razy</th>
                  <th className="pb-2 font-medium text-right">Śr. trafienia</th>
                  <th className="pb-2 font-medium text-right">Śr. czas</th>
                </tr>
              </thead>
              <tbody>
                {data.findInPage.map((f, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-900">{f.query}</td>
                    <td className="py-2 text-gray-600 max-w-xs truncate">{f.slug}</td>
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
          <EmptyState />
        )}
      </Section>

      {/* Quit Depth */}
      <Section title="Quit rate wg głębokości">
        {data.quitDepth.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
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

      {/* Search Insights */}
      <Section title="Wyszukiwania">
        {data.searchQueries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 font-medium">Zapytanie</th>
                  <th className="pb-2 font-medium text-right">Ile razy</th>
                  <th className="pb-2 font-medium text-right">Śr. wyniki</th>
                  <th className="pb-2 font-medium text-right">CTR</th>
                </tr>
              </thead>
              <tbody>
                {data.searchQueries.map((q, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="py-2 font-medium text-gray-900">{q.query}</td>
                    <td className="py-2 text-right">{q.count}</td>
                    <td className="py-2 text-right">{q.avgResults}</td>
                    <td className="py-2 text-right">
                      <span className={q.ctr > 50 ? 'text-green-600' : q.ctr > 20 ? 'text-yellow-600' : 'text-red-500'}>
                        {q.ctr}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState />
        )}
      </Section>

      {/* Return Visits */}
      <Section title="Powroty użytkowników">
        {data.returnVisits.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.returnVisits} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="slug" type="category" tick={{ fontSize: 11 }} width={200} />
              <Tooltip />
              <Bar dataKey="returnCount" name="Powroty" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState />
        )}
      </Section>

      {/* Subscription Stats */}
      <Section title="Subskrypcje">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <StatCard label="Łącznie" value={data.subscriptions.total} />
          <StatCard label="Potwierdzone" value={data.subscriptions.confirmed} color="green" />
          <StatCard label="Wypisani" value={data.subscriptions.unsubscribed || 0} color="red" />
        </div>
        {data.subscriptions.bySlug.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500 mb-2">Subskrypcje per artykuł:</p>
            {data.subscriptions.bySlug.map((s, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700 truncate">{s.slug}</span>
                <span className="font-medium">{s.count}</span>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Recent Sessions */}
      <Section title="Ostatnie sesje">
        <SessionList onSelectSession={setSelectedSession} />
      </Section>

      {/* Session Detail Drawer (from left) */}
      <SessionDrawer
        sessionId={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
}

// --- Sub-components ---

function StatCard({ label, value, color }: { label: string; value: number | string; color?: string }) {
  const colorClasses = {
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
  };

  return (
    <div className={`p-4 rounded-xl border ${color ? colorClasses[color as keyof typeof colorClasses] : 'bg-white border-gray-200'}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-8 text-gray-400">
      <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <p className="text-sm">Brak danych za wybrany okres</p>
      <p className="text-xs mt-1">Dane pojawią się po pierwszych wizytach</p>
    </div>
  );
}
