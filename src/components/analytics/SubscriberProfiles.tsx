/**
 * SubscriberProfiles — subscriber reading patterns and pre-subscribe journey.
 *
 * Shows:
 * 1. Which blogs subscribers read most
 * 2. Pre-subscribe journey (what pages people visit before subscribing)
 */

import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Section, EmptyState, LoadingSkeleton } from './shared';

interface SubscriberProfilesProps {
  days: number;
}

interface ReadingPattern {
  slug: string;
  subscriberReaders: number;
  totalPageviews: number;
  avgDepth: number;
  avgTime: number;
}

interface JourneyPattern {
  slug: string;
  subscriberCount: number;
}

interface ProfileData {
  readingPatterns: ReadingPattern[];
  journeyPatterns: JourneyPattern[];
}

export default function SubscriberProfiles({ days }: SubscriberProfilesProps) {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`/api/analytics/subscriber-profiles?days=${days}`)
      .then(r => {
        if (r.status === 401) throw new Error('Brak autoryzacji');
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [days]);

  if (loading) return <LoadingSkeleton />;

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const hasData = data.readingPatterns.length > 0 || data.journeyPatterns.length > 0;

  return (
    <div className="space-y-8">
      {!hasData && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-3">&#128100;</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Brak danych o subskrybentach</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Dane pojawia sie po pierwszych subskrypcjach. Gdy czytelnicy zapiszą się na blog,
            ich zachowania zostaną automatycznie powiązane z profilami.
          </p>
        </div>
      )}

      {/* What subscribers read */}
      <Section title="Co czytają subskrybenci">
        {data.readingPatterns.length > 0 ? (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 font-medium">Artykuł</th>
                    <th className="pb-2 font-medium text-right">Subskrybenci</th>
                    <th className="pb-2 font-medium text-right">Odsłony</th>
                    <th className="pb-2 font-medium text-right">Śr. depth</th>
                    <th className="pb-2 font-medium text-right">Śr. czas</th>
                  </tr>
                </thead>
                <tbody>
                  {data.readingPatterns.map((p, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      <td className="py-2 font-medium text-gray-900 max-w-xs truncate">{p.slug}</td>
                      <td className="py-2 text-right">
                        <span className="font-semibold text-blue-600">{p.subscriberReaders}</span>
                      </td>
                      <td className="py-2 text-right tabular-nums">{p.totalPageviews}</td>
                      <td className="py-2 text-right tabular-nums">{p.avgDepth}%</td>
                      <td className="py-2 text-right tabular-nums">
                        {p.avgTime < 60 ? `${p.avgTime}s` : `${Math.floor(p.avgTime / 60)}m`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <EmptyState message="Brak danych o czytelnikach-subskrybentach" />
        )}
      </Section>

      {/* Pre-subscribe journey */}
      <Section title="Ścieżka przed subskrypcją">
        <p className="text-sm text-gray-500 mb-4">
          Jakie strony odwiedzają użytkownicy zanim się zapiszą na blog:
        </p>
        {data.journeyPatterns.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(300, data.journeyPatterns.length * 35)}>
            <BarChart data={data.journeyPatterns} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis
                dataKey="slug"
                type="category"
                tick={{ fontSize: 11 }}
                width={220}
              />
              <Tooltip />
              <Bar
                dataKey="subscriberCount"
                name="Subskrybenci"
                fill="#6366f1"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState message="Brak danych o ścieżce przed subskrypcją" />
        )}
      </Section>
    </div>
  );
}
