/**
 * BlogImprovements — AI-powered per-blog content improvement suggestions.
 *
 * Displayed at the bottom of BlogDetailView. Analyzes Ctrl+F searches,
 * copy events, quit depth, and search queries to suggest improvements.
 */

import { useState } from 'react';
import type { BlogImprovementSuggestion } from '@lib/openai';

interface Props {
  slug: string;
  days: number;
}

const AREA_LABELS: Record<string, string> = {
  content_gap: 'Luka w treści',
  engagement: 'Zaangażowanie',
  structure: 'Struktura',
  seo: 'SEO',
  depth: 'Pogłębienie',
};

const AREA_COLORS: Record<string, string> = {
  content_gap: 'bg-red-100 text-red-700',
  engagement: 'bg-blue-100 text-blue-700',
  structure: 'bg-purple-100 text-purple-700',
  seo: 'bg-green-100 text-green-700',
  depth: 'bg-indigo-100 text-indigo-700',
};

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Wysoki',
  medium: 'Średni',
  low: 'Niski',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-600',
};

export default function BlogImprovements({ slug, days }: Props) {
  const [suggestions, setSuggestions] = useState<BlogImprovementSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [generated, setGenerated] = useState(false);

  async function generate() {
    setLoading(true);
    setError('');
    setMessage('');
    setSuggestions([]);

    try {
      const res = await fetch('/api/analytics/blog-improvements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, days }),
      });

      if (res.status === 401) {
        setError('Brak autoryzacji. Odśwież stronę i zaloguj się ponownie.');
        return;
      }

      const json = await res.json();

      if (json.error) {
        setError(json.error);
      } else if (json.message) {
        setMessage(json.message);
      } else {
        setSuggestions(json.suggestions || []);
      }
      setGenerated(true);
    } catch (err: any) {
      setError(err.message || 'Błąd połączenia');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Sugestie ulepszeń AI</h3>
            <p className="text-sm text-gray-500 mt-1">
              GPT-4o analizuje dane behawioralne tego artykułu — co ludzie szukają, kopiują, gdzie porzucają czytanie — i proponuje konkretne ulepszenia.
            </p>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="shrink-0 flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analizuję...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {generated ? 'Generuj ponownie' : 'Generuj sugestie'}
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="mt-3 p-3 bg-indigo-50 rounded-lg text-sm text-indigo-700 flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Analizuję dane behawioralne artykułu... (do 20 sekund)
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {message && !error && (
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          {message}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500 font-medium">
            {suggestions.length} sugestii ulepszeń:
          </p>
          {suggestions.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 w-5 h-5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h4 className="font-bold text-gray-900 text-sm leading-snug">{s.title}</h4>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[s.priority] || 'bg-gray-100 text-gray-600'}`}>
                    {PRIORITY_LABELS[s.priority] ?? s.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${AREA_COLORS[s.area] || 'bg-gray-100 text-gray-600'}`}>
                    {AREA_LABELS[s.area] ?? s.area}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-700">{s.description}</p>

              <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3">
                {s.reasoning}
              </p>

              {s.dataSignals?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {s.dataSignals.map((signal, j) => (
                    <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {signal}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
