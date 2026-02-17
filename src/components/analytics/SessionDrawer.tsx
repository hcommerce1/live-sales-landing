/**
 * Session Drawer
 *
 * Left-side sliding panel that shows session detail + timeline.
 * Uses Headless UI Dialog + Framer Motion (same pattern as Navbar.tsx mobile drawer).
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import SessionTimeline from './SessionTimeline';
import type { SessionDetail } from '@lib/analytics/types';

interface Props {
  sessionId: string | null;
  onClose: () => void;
}

export default function SessionDrawer({ sessionId, onClose }: Props) {
  const shouldReduceMotion = useReducedMotion();
  const [detail, setDetail] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setDetail(null);
      return;
    }
    setLoading(true);
    setError('');
    fetch(`/api/analytics/sessions?id=${encodeURIComponent(sessionId)}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(setDetail)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <AnimatePresence>
      {sessionId && (
        <Dialog as="div" open={!!sessionId} onClose={onClose} className="relative z-50">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Panel from LEFT */}
          <div className="fixed inset-0 flex">
            <DialogPanel
              as={motion.div}
              initial={{ x: shouldReduceMotion ? 0 : '-100%', opacity: shouldReduceMotion ? 0 : 1 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: shouldReduceMotion ? 0 : '-100%', opacity: shouldReduceMotion ? 0 : 1 }}
              transition={{
                type: shouldReduceMotion ? 'tween' : 'spring',
                damping: 30,
                stiffness: 300,
                duration: shouldReduceMotion ? 0.15 : undefined,
              }}
              className="relative w-full max-w-lg bg-white shadow-xl overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Szczegóły sesji</h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    {sessionId.slice(0, 8)}...
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Zamknij"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                {loading && (
                  <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-gray-100 rounded-lg" />
                    ))}
                  </div>
                )}

                {error && (
                  <div className="text-center py-8">
                    <p className="text-red-500 text-sm">{error}</p>
                    <button
                      onClick={() => {
                        setError('');
                        setLoading(true);
                        fetch(`/api/analytics/sessions?id=${encodeURIComponent(sessionId!)}`)
                          .then(r => r.json())
                          .then(setDetail)
                          .catch(err => setError(err.message))
                          .finally(() => setLoading(false));
                      }}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Spróbuj ponownie
                    </button>
                  </div>
                )}

                {!loading && !error && detail && (
                  <SessionTimeline
                    referrer={detail.referrer}
                    pageVisits={detail.pageVisits}
                    sessionStart={detail.sessionStart}
                    sessionEnd={detail.sessionEnd}
                  />
                )}
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
