/**
 * AI-Powered Search Component
 *
 * Real-time semantic search for blog posts using OpenAI embeddings.
 *
 * Features:
 * - Debounced search (500ms)
 * - Real-time results as you type
 * - Similarity score display
 * - Keyboard navigation
 * - Loading states
 * - Error handling
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
  slug: string;
  lang: 'pl' | 'en';
  postTitle: string;
  description: string;
  sectionTitle?: string;
  url: string;
  similarity: number;
  excerpt?: string;
}

interface SearchResponse {
  results: SearchResult[];
  method: 'semantic' | 'keyword' | 'none';
  count: number;
  latency?: number;
}

interface AISearchProps {
  language?: 'pl' | 'en' | 'all';
  placeholder?: string;
  limit?: number;
}

export default function AISearch({
  language = 'all',
  placeholder = 'Search blog posts...',
  limit = 5,
}: AISearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'searching' | 'success' | 'error'>('idle');
  const [searchMethod, setSearchMethod] = useState<'semantic' | 'keyword' | 'none' | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if query is empty
    if (!query || query.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      setStatus('idle');
      setSearchMethod(null);
      return;
    }

    // Don't search for very short queries
    if (query.trim().length < 2) {
      setStatus('idle');
      return;
    }

    // Set searching status
    setStatus('searching');

    // Debounce search (500ms)
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: query.trim(),
            language,
            limit,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Search failed');
        }

        const data: SearchResponse = await response.json();

        setResults(data.results);
        setSearchMethod(data.method);
        setStatus('success');
        setIsOpen(data.results.length > 0);
        setErrorMessage('');

        console.log(`[AISearch] Found ${data.count} results in ${data.latency}ms (${data.method})`);
      } catch (error: any) {
        console.error('[AISearch] Search error:', error);
        setStatus('error');
        setResults([]);
        setIsOpen(false);
        setSearchMethod(null);
        setErrorMessage(error?.message || 'Search failed');
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, language, limit]);

  // Animations
  const shouldReduceMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  const resultVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: shouldReduceMotion ? 0 : i * 0.05,
        duration: shouldReduceMotion ? 0 : 0.2,
      },
    }),
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          {/* Search Icon */}
          <svg
            className={`w-5 h-5 transition-colors ${
              status === 'searching' ? 'text-sky-600 animate-pulse' : 'text-gray-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full pl-12 pr-4 py-3
            bg-white border-2 rounded-xl
            text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500
            transition-all duration-200
            ${status === 'error' ? 'border-red-300' : 'border-gray-200'}
          `}
        />

        {/* AI Badge */}
        {searchMethod && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
            <span
              className={`
                px-2 py-1 text-xs font-semibold rounded-full
                ${
                  searchMethod === 'semantic'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700'
                }
              `}
            >
              {searchMethod === 'semantic' ? '✨ AI' : '🔍 Keyword'}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {status === 'error' && errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600"
        >
          {errorMessage}
        </motion.div>
      )}

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{
              duration: shouldReduceMotion ? 0 : 0.2,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2">
              {results.map((result, index) => (
                <motion.a
                  key={`${result.slug}-${result.sectionTitle || 'main'}`}
                  href={result.url}
                  custom={index}
                  variants={resultVariants}
                  initial="hidden"
                  animate="visible"
                  className="block p-4 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-sky-600 transition-colors truncate">
                        {result.postTitle}
                      </h4>
                      {result.sectionTitle && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          → {result.sectionTitle}
                        </p>
                      )}
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {result.description}
                      </p>
                    </div>

                    {/* Similarity Score */}
                    <div className="flex-shrink-0">
                      <div className="text-xs font-medium text-gray-400">
                        {Math.round(result.similarity * 100)}%
                      </div>
                    </div>
                  </div>
                </motion.a>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                {searchMethod === 'semantic' ? (
                  <>
                    ✨ Powered by AI •{' '}
                    <span className="font-medium">{results.length}</span> result
                    {results.length !== 1 ? 's' : ''}
                  </>
                ) : (
                  <>
                    🔍 Keyword search •{' '}
                    <span className="font-medium">{results.length}</span> result
                    {results.length !== 1 ? 's' : ''}
                  </>
                )}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* No Results */}
      {isOpen && status === 'success' && results.length === 0 && query.trim().length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-50 w-full mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-xl"
        >
          <p className="text-sm text-gray-500 text-center">
            No results found for "{query}"
          </p>
        </motion.div>
      )}
    </div>
  );
}
