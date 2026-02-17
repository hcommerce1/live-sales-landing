/**
 * Session Drawer
 *
 * Right-side sliding panel with session detail, timeline, and visitor history.
 * Uses Headless UI Dialog + Framer Motion.
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogPanel } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import SessionTimeline from './SessionTimeline';
import type { SessionDetail } from '@lib/analytics/types';

interface Props {
  sessionId: string | null;
  onClose: () => void;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'teraz';
  if (mins < 60) return `${mins} min temu`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h temu`;
  const days = Math.floor(hours / 24);
  return `${days}d temu`;
}

export default function SessionDrawer({ sessionId, onClose }: Props) {
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

  const h = detail?.visitorHistory;
  const isReturning = h && h.totalSessions > 1;

  return (
    <AnimatePresence>
      {sessionId && (
        <Dialog as="div" open={!!sessionId} onClose={onClose} className="relative z-50">
          {/* Backdrop with fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel from RIGHT with spring + scale animation */}
          <div className="fixed inset-0 flex justify-end">
            <DialogPanel
              as={motion.div}
              initial={{ x: '100%', scale: 0.95, opacity: 0 }}
              animate={{ x: 0, scale: 1, opacity: 1 }}
              exit={{ x: '100%', scale: 0.95, opacity: 0 }}
              transition={{
                type: 'spring',
                damping: 28,
                stiffness: 320,
                mass: 0.8,
              }}
              className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto border-l border-gray-200"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-gray-900">Sesja</h2>
                      {isReturning && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', delay: 0.3, damping: 15, stiffness: 400 }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200"
                        >
                          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                          </svg>
                          {h!.totalSessions}x visitor
                        </motion.span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      {sessionId.slice(0, 8)}...
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-150"
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
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="h-20 bg-gray-100 rounded-lg animate-pulse"
                      />
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
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {/* Visitor history card (if returning) */}
                    {isReturning && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.15, duration: 0.3 }}
                        className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <p className="text-sm font-bold text-amber-800">
                            Powracający visitor — {h!.totalSessions} sesji łącznie
                          </p>
                        </div>

                        {h!.previousSessions.length > 0 && (
                          <div className="space-y-1.5 mt-3">
                            <p className="text-xs font-medium text-amber-700 uppercase tracking-wider">Poprzednie sesje:</p>
                            {h!.previousSessions.map((ps, i) => (
                              <motion.div
                                key={ps.sessionId}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.06 }}
                                className="flex items-center justify-between text-xs bg-white/60 rounded-lg px-3 py-2"
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-amber-600">{ps.sessionId.slice(0, 6)}</span>
                                  <span className="text-gray-600">/{ps.landingPage}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500">
                                  <span>{ps.pageCount} str.</span>
                                  <span>{timeAgo(ps.sessionStart)}</span>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Session timeline */}
                    <SessionTimeline
                      referrer={detail.referrer}
                      pageVisits={detail.pageVisits}
                      sessionStart={detail.sessionStart}
                      sessionEnd={detail.sessionEnd}
                    />
                  </motion.div>
                )}
              </div>
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
