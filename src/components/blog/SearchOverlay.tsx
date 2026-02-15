/**
 * Full-screen Search Overlay
 *
 * Opened via Ctrl+K / Cmd+K (captured by AnalyticsTracker.astro).
 * Wraps existing AISearch component.
 *
 * Accessibility:
 * - Focus trap (Tab stays within overlay)
 * - Escape closes overlay
 * - aria-modal, role="dialog"
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AISearch from './AISearch';

interface SearchOverlayProps {
  language?: 'pl' | 'en' | 'all';
}

export default function SearchOverlay({ language = 'all' }: SearchOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);

  const open = useCallback(() => {
    previousFocus.current = document.activeElement;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Restore focus to previous element
    if (previousFocus.current instanceof HTMLElement) {
      previousFocus.current.focus();
    }
  }, []);

  // Listen for custom 'open-search' event from AnalyticsTracker
  useEffect(() => {
    const handler = () => open();
    window.addEventListener('open-search', handler);
    return () => window.removeEventListener('open-search', handler);
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, close]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !overlayRef.current) return;

    const focusable = overlayRef.current.querySelectorAll<HTMLElement>(
      'input, button, a[href], [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    // Auto-focus the search input
    first?.focus();

    const trapFocus = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', trapFocus);
    return () => document.removeEventListener('keydown', trapFocus);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Szukaj na blogu"
        >
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-2xl mx-4"
          >
            {/* Keyboard hint */}
            <div className="flex justify-end mb-2">
              <span className="text-xs text-white/60">
                ESC aby zamknąć
              </span>
            </div>

            {/* Search container */}
            <div className="bg-white rounded-2xl shadow-2xl p-4">
              <AISearch
                language={language}
                placeholder="Szukaj artykułów... (⌘K)"
                limit={8}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
