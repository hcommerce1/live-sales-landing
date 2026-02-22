/**
 * TopicGenerator — AI-powered blog topic suggestions via GPT-4o.
 */

import { useState } from 'react';
import type { TopicSuggestion } from '@lib/openai';

interface Props {
  days: number;
  hasEnoughData: boolean;
  currentPageviews: number;
}

const DIFFICULTY_LABELS = { low: 'Łatwy', medium: 'Średni', high: 'Trudny' };
const DIFFICULTY_COLORS = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-red-100 text-red-700',
};
const CATEGORY_LABELS = {
  tutorial: 'Tutorial',
  'case-study': 'Case Study',
  guide: 'Poradnik',
  announcement: 'Ogłoszenie',
};
const CATEGORY_COLORS = {
  tutorial: 'bg-blue-100 text-blue-700',
  'case-study': 'bg-purple-100 text-purple-700',
  guide: 'bg-indigo-100 text-indigo-700',
  announcement: 'bg-pink-100 text-pink-700',
};

export default function TopicGenerator({ days, hasEnoughData, currentPageviews }: Props) {
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([]);
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
      const res = await fetch('/api/analytics/topic-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days }),
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

  // Not enough data
  if (!hasEnoughData) {
    return (
      <div className="space-y-4">
        <div className="p-5 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-yellow-800">Za mało danych</p>
              <p className="text-sm text-yellow-700 mt-1">
                Zebrano {currentPageviews} z wymaganych 50 pageviews. Generator uruchomi się automatycznie gdy zbierzesz więcej danych.
              </p>
              <div className="mt-3 w-full bg-yellow-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((currentPageviews / 50) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-yellow-600 mt-1">{currentPageviews}/50 pageviews</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header + button */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Generator tematów AI</h3>
            <p className="text-sm text-gray-500 mt-1">
              GPT-4o analizuje dane analityczne — co ludzie szukają, kopiują i czego im brakuje —
              i proponuje tematy nowych artykułów.
            </p>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm rounded-xl transition-colors"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analizuję…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                {generated ? 'Generuj ponownie' : 'Generuj sugestie tematów'}
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700 flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Trwa analiza danych i generowanie sugestii przez GPT-4o… (może potrwać do 20 sekund)
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Not enough data message from server */}
      {message && !error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          {message}
        </div>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 font-medium">
            {suggestions.length} propozycji tematów na podstawie danych z ostatnich {days} dni:
          </p>
          {suggestions.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {i + 1}
                  </span>
                  <h4 className="font-bold text-gray-900 text-base leading-snug">{s.title}</h4>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_COLORS[s.estimatedDifficulty] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {DIFFICULTY_LABELS[s.estimatedDifficulty] ?? s.estimatedDifficulty}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[s.suggestedCategory] || 'bg-gray-100 text-gray-600'}`}
                  >
                    {CATEGORY_LABELS[s.suggestedCategory] ?? s.suggestedCategory}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700">{s.description}</p>

              {/* Reasoning */}
              <p className="text-sm text-gray-500 italic border-l-2 border-gray-200 pl-3">
                {s.reasoning}
              </p>

              {/* Data signals */}
              {s.dataSignals?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {s.dataSignals.map((signal, j) => (
                    <span
                      key={j}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                    >
                      📊 {signal}
                    </span>
                  ))}
                </div>
              )}

              {/* Copy title button */}
              <button
                onClick={() => navigator.clipboard.writeText(s.title)}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Kopiuj tytuł
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
