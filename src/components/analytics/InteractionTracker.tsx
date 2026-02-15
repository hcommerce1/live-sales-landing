/**
 * React hook for tracking interactions in island components.
 *
 * Uses the global window.__ls_track exposed by AnalyticsTracker.astro.
 * Safe to call even if the tracker script hasn't loaded yet (no-ops).
 */

declare global {
  interface Window {
    __ls_track?: (type: string, meta?: Record<string, unknown>) => void;
    __ls_flush?: () => void;
  }
}

export function useTrackInteraction() {
  const track = (component: string, action: string, meta?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.__ls_track) {
      window.__ls_track('interaction', { component, action, ...meta });
    }
  };

  const flush = () => {
    if (typeof window !== 'undefined' && window.__ls_flush) {
      window.__ls_flush();
    }
  };

  return { track, flush };
}
