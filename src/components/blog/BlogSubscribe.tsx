/**
 * Blog Email Subscription Form
 *
 * Inline component shown within blog articles.
 * Handles subscribe flow with loading/success/error states.
 * Remembers dismiss and confirmed status in localStorage.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BlogSubscribeProps {
  slug: string;
  lang?: string;
}

export default function BlogSubscribe({ slug, lang = 'pl' }: BlogSubscribeProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'dismissed' | 'already'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    try {
      // Don't show if already confirmed
      if (localStorage.getItem('ls_subscribed') === 'true') {
        setStatus('already');
        return;
      }
      // Don't show if dismissed recently (7 days)
      const dismissedAt = localStorage.getItem('ls_subscribe_dismissed');
      if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 86400000) {
        setStatus('dismissed');
      }
    } catch {
      // localStorage not available
    }
  }, []);

  const handleDismiss = () => {
    setStatus('dismissed');
    try { localStorage.setItem('ls_subscribe_dismissed', String(Date.now())); }
    catch { /* ignore */ }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage('Podaj prawidłowy adres email.');
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), lang, slug }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage(data.message);
        try { localStorage.setItem('ls_subscribed', 'true'); }
        catch { /* ignore */ }

        // Track subscribe event
        if (typeof window !== 'undefined' && (window as any).__ls_track) {
          (window as any).__ls_track('subscribe', { slug });
        }
      } else {
        setStatus('error');
        setMessage(data.error || 'Coś poszło nie tak.');
      }
    } catch {
      setStatus('error');
      setMessage('Błąd połączenia. Spróbuj później.');
    }
  };

  // Don't render if dismissed or already subscribed
  if (status === 'dismissed' || status === 'already') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4 }}
        className="my-12 mx-auto max-w-3xl px-4"
      >
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Zamknij"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {status === 'success' ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-3">&#9993;</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Sprawdź swoją skrzynkę!</h3>
              <p className="text-sm text-gray-600">{message}</p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Podobał Ci się ten artykuł?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Subskrybuj, aby dostawać powiadomienia o nowych artykułach.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="Twój adres email"
                  className={`flex-1 px-4 py-3 rounded-xl border-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    status === 'error' ? 'border-red-300' : 'border-gray-200'
                  }`}
                  disabled={status === 'loading'}
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
                >
                  {status === 'loading' ? 'Wysyłam...' : 'Subskrybuj'}
                </button>
              </form>

              {status === 'error' && message && (
                <p className="mt-2 text-sm text-red-600">{message}</p>
              )}

              <p className="mt-3 text-xs text-gray-400">
                Bez spamu. Możesz się wypisać w każdej chwili.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
