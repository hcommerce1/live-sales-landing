/**
 * Realtime Traffic Chart
 *
 * Shows pageview counts in 5-minute intervals over the last 24 or 48 hours.
 * Auto-refreshes every 60 seconds.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { RealtimeDataPoint } from '@lib/analytics/types';

type TimeWindow = 24 | 48;

interface FormattedPoint extends RealtimeDataPoint {
  label: string;
}

function formatTimeBucket(bucket: string, hours: TimeWindow): string {
  try {
    const date = new Date(bucket);
    if (isNaN(date.getTime())) return bucket;
    if (hours === 24) {
      return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    }
    return (
      date.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }) +
      ' ' +
      date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    );
  } catch {
    return bucket;
  }
}

export default function RealtimeChart() {
  const [hours, setHours] = useState<TimeWindow>(24);
  const [data, setData] = useState<FormattedPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/analytics/realtime?hours=${hours}`);
      if (!res.ok) return;
      const raw: RealtimeDataPoint[] = await res.json();
      setData(
        raw.map(d => ({
          ...d,
          label: formatTimeBucket(d.timeBucket, hours),
        })),
      );
      setLastUpdate(new Date().toLocaleTimeString('pl-PL'));
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Calculate how many X-axis labels to show (~12 labels)
  const tickInterval = Math.max(1, Math.floor(data.length / 12));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Ruch w czasie rzeczywistym</h3>
          <p className="text-xs text-gray-400 mt-1">
            Co 5 min{lastUpdate ? ` · Ostatnia aktualizacja: ${lastUpdate}` : ''} · Auto-refresh 60s
          </p>
        </div>
        <div className="flex gap-2">
          {([24, 48] as TimeWindow[]).map(h => (
            <button
              key={h}
              onClick={() => setHours(h)}
              className={`px-3 py-1 text-sm font-medium rounded-lg transition-colors ${
                hours === h
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
      ) : data.length > 0 ? (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              interval={tickInterval}
            />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip
              labelFormatter={label => `Czas: ${label}`}
              formatter={(val: number, name: string) => [
                val,
                name === 'pageviews' ? 'Odsłony' : 'Unikalni',
              ]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="pageviews"
              name="Odsłony"
              stroke="#2563eb"
              fill="#2563eb"
              fillOpacity={0.15}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="uniqueVisitors"
              name="Unikalni"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.1}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div className="text-center py-12 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p className="text-sm">Brak danych za ostatnie {hours}h</p>
        </div>
      )}
    </div>
  );
}
