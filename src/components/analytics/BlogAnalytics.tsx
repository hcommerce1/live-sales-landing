/**
 * BlogAnalytics — list of blog posts with metrics + drill-down to detail view.
 */

import { useState } from 'react';
import BlogDetailView from './BlogDetailView';

type SortKey = 'pageviews' | 'uniqueVisitors' | 'avgDepth' | 'avgTime' | 'copies' | 'interactions' | 'returnVisits' | 'readRate' | 'subscriptions';

interface PostRow {
  slug: string;
  pageviews: number;
  uniqueVisitors: number;
  avgDepth: number;
  avgTime: number;
  copies: number;
  interactions: number;
  returnVisits: number;
  readRate: number;
  subscriptions: number;
}

interface FindInPageRow {
  query: string;
  slug: string;
  count: number;
}

interface Props {
  postRankings: PostRow[];
  findInPage: FindInPageRow[];
  days: number;
}

function ctrlFCountFor(slug: string, findInPage: FindInPageRow[]): number {
  return findInPage.filter(f => f.slug === slug).reduce((s, f) => s + f.count, 0);
}

const COLUMNS: { key: SortKey; label: string; title?: string }[] = [
  { key: 'pageviews', label: 'Odsłony' },
  { key: 'uniqueVisitors', label: 'Unikalni' },
  { key: 'avgDepth', label: 'Scroll%', title: 'Średnia głębokość scrollowania' },
  { key: 'readRate', label: 'Czyt.%', title: '% odwiedzających ze scroll depth ≥ 80%' },
  { key: 'avgTime', label: 'Czas', title: 'Średni czas na stronie' },
  { key: 'copies', label: 'Ctrl+C', title: 'Liczba kopiowań tekstu' },
  { key: 'interactions', label: 'Interakcje' },
  { key: 'returnVisits', label: 'Powroty' },
  { key: 'subscriptions', label: 'Subskr.', title: 'Subskrypcje z tego artykułu' },
];

export default function BlogAnalytics({ postRankings, findInPage, days }: Props) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('pageviews');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [search, setSearch] = useState('');

  if (selectedSlug) {
    return (
      <BlogDetailView
        slug={selectedSlug}
        days={days}
        onBack={() => setSelectedSlug(null)}
      />
    );
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'desc' ? 'asc' : 'desc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  }

  const filtered = postRankings
    .filter(p => !search || p.slug.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const av = a[sortKey] as number;
      const bv = b[sortKey] as number;
      return sortDir === 'desc' ? bv - av : av - bv;
    });

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) {
      return <span className="ml-1 text-gray-300 text-xs">↕</span>;
    }
    return <span className="ml-1 text-blue-500 text-xs">{sortDir === 'desc' ? '↓' : '↑'}</span>;
  }

  if (postRankings.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400 py-12">
        <p className="text-sm">Brak danych o artykułach za wybrany okres</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Szukaj artykułu..."
          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">
                  Artykuł
                  <span className="ml-1 text-gray-400 font-normal">({filtered.length})</span>
                </th>
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    title={col.title}
                    onClick={() => toggleSort(col.key)}
                    className="px-3 py-3 font-medium text-gray-600 text-right cursor-pointer hover:text-blue-600 whitespace-nowrap select-none"
                  >
                    {col.label}
                    <SortIcon col={col.key} />
                  </th>
                ))}
                <th className="px-3 py-3 font-medium text-gray-600 text-right whitespace-nowrap">
                  Ctrl+F
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const ctrlF = ctrlFCountFor(p.slug, findInPage);
                return (
                  <tr
                    key={p.slug}
                    onClick={() => setSelectedSlug(p.slug)}
                    className="border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs">
                      <span className="truncate block" title={p.slug}>{p.slug}</span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{p.pageviews}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{p.uniqueVisitors}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{p.avgDepth}%</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className={p.readRate >= 50 ? 'text-green-600 font-medium' : ''}>{p.readRate}%</span>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {p.avgTime < 60 ? `${p.avgTime}s` : `${Math.floor(p.avgTime / 60)}m`}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">{p.copies}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{p.interactions}</td>
                    <td className="px-3 py-3 text-right tabular-nums">{p.returnVisits}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {p.subscriptions > 0 ? (
                        <span className="text-emerald-600 font-medium">{p.subscriptions}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {ctrlF > 0 ? (
                        <span className="text-indigo-600 font-medium">{ctrlF}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && search && (
          <div className="text-center py-8 text-gray-400 text-sm">
            Brak artykułów pasujących do „{search}"
          </div>
        )}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Kliknij wiersz aby zobaczyć szczegółową analitykę artykułu
      </p>
    </div>
  );
}
