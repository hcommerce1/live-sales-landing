/**
 * ClickHeatmap — visual click heatmap with page screenshot background.
 *
 * Renders click positions as a gradient-colored heatmap overlay
 * on top of a real page screenshot.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface ClickHeatmapProps {
  days: number;
}

interface PageEntry {
  slug: string;
  totalClicks: number;
}

interface ClickPoint {
  x: number;
  yPage: number;
  tag: string;
  text: string;
  count: number;
}

interface ScreenshotData {
  b64: string;
  viewportWidth: number;
  viewportHeight: number;
  pageHeight: number;
  updatedAt: string;
}

export default function ClickHeatmap({ days }: ClickHeatmapProps) {
  const [pages, setPages] = useState<PageEntry[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [clicks, setClicks] = useState<ClickPoint[]>([]);
  const [screenshot, setScreenshot] = useState<ScreenshotData | null>(null);
  const [loading, setLoading] = useState(false);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch pages list
  useEffect(() => {
    fetch(`/api/analytics/click-heatmap?days=${days}`)
      .then(r => r.json())
      .then(data => {
        setPages(data.pages || []);
        if (data.pages?.length > 0 && !selectedSlug) {
          setSelectedSlug(data.pages[0].slug);
        }
      })
      .catch(() => setError('Nie udało się pobrać danych'));
  }, [days]);

  // Fetch clicks + screenshot when slug changes
  useEffect(() => {
    if (!selectedSlug) return;

    setLoading(true);
    setError('');

    Promise.all([
      fetch(`/api/analytics/click-heatmap?days=${days}&slug=${encodeURIComponent(selectedSlug)}`)
        .then(r => r.json()),
      fetch(`/api/analytics/screenshot?slug=${encodeURIComponent(selectedSlug)}`)
        .then(r => r.ok ? r.json() : null),
    ])
      .then(([clickData, screenshotData]) => {
        setClicks(clickData.clicks || []);
        setScreenshot(screenshotData?.b64 ? screenshotData : null);
      })
      .catch(() => setError('Błąd pobierania danych'))
      .finally(() => setLoading(false));
  }, [selectedSlug, days]);

  // Draw heatmap on canvas
  const drawHeatmap = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || clicks.length === 0) return;

    const containerWidth = container.clientWidth;
    // Calculate aspect ratio from screenshot or default
    const pageH = screenshot?.pageHeight || 900;
    const vpW = screenshot?.viewportWidth || 1440;
    const scale = containerWidth / vpW;
    const canvasHeight = Math.round(pageH * scale);

    canvas.width = containerWidth;
    canvas.height = canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Find max count for normalization
    const maxCount = Math.max(...clicks.map(c => c.count), 1);

    // Draw circles for each click cluster
    for (const click of clicks) {
      const x = (click.x / 100) * canvas.width;
      const y = (click.yPage / 100) * canvas.height;
      const intensity = click.count / maxCount;
      const radius = 12 + intensity * 30;

      // Create radial gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);

      // Color based on intensity: blue → green → yellow → red
      const alpha = 0.3 + intensity * 0.5;
      if (intensity < 0.25) {
        gradient.addColorStop(0, `rgba(59, 130, 246, ${alpha})`); // blue
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
      } else if (intensity < 0.5) {
        gradient.addColorStop(0, `rgba(34, 197, 94, ${alpha})`); // green
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
      } else if (intensity < 0.75) {
        gradient.addColorStop(0, `rgba(234, 179, 8, ${alpha})`); // yellow
        gradient.addColorStop(1, 'rgba(234, 179, 8, 0)');
      } else {
        gradient.addColorStop(0, `rgba(239, 68, 68, ${alpha})`); // red
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, [clicks, screenshot]);

  useEffect(() => {
    drawHeatmap();
  }, [drawHeatmap]);

  // Generate screenshot
  async function generateScreenshot() {
    if (!selectedSlug) return;
    setScreenshotLoading(true);
    try {
      const res = await fetch('/api/analytics/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: selectedSlug }),
      });
      if (res.ok) {
        // Refetch screenshot
        const ssRes = await fetch(`/api/analytics/screenshot?slug=${encodeURIComponent(selectedSlug)}`);
        if (ssRes.ok) {
          const data = await ssRes.json();
          setScreenshot(data.b64 ? data : null);
        }
      }
    } catch {
      setError('Nie udało się wygenerować screenshota');
    } finally {
      setScreenshotLoading(false);
    }
  }

  if (pages.length === 0 && !loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 text-center text-gray-400 py-12">
        <p className="text-sm">Brak danych o kliknięciach za wybrany okres</p>
      </div>
    );
  }

  const containerWidth = containerRef.current?.clientWidth || 800;
  const vpW = screenshot?.viewportWidth || 1440;
  const scale = containerWidth / vpW;
  const canvasHeight = Math.round((screenshot?.pageHeight || 900) * scale);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={selectedSlug}
          onChange={e => setSelectedSlug(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {pages.map(p => (
            <option key={p.slug} value={p.slug}>
              {p.slug} ({p.totalClicks} kliknięć)
            </option>
          ))}
        </select>

        <button
          onClick={generateScreenshot}
          disabled={screenshotLoading || !selectedSlug}
          className="text-sm px-3 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded-lg transition-colors flex items-center gap-1.5"
        >
          {screenshotLoading ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generuję...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {screenshot ? 'Odśwież screenshot' : 'Generuj screenshot'}
            </>
          )}
        </button>

        {screenshot && (
          <span className="text-xs text-gray-400">
            Ostatnia aktualizacja: {new Date(screenshot.updatedAt).toLocaleString('pl-PL')}
          </span>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-gray-50 rounded-xl p-12 flex items-center justify-center">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Ładowanie danych...
          </div>
        </div>
      ) : (
        /* Heatmap container */
        <div
          ref={containerRef}
          className="relative bg-gray-100 rounded-xl overflow-hidden border border-gray-200"
          style={{ maxHeight: '70vh', overflowY: 'auto' }}
        >
          {/* Screenshot background */}
          {screenshot && (
            <img
              src={`data:image/jpeg;base64,${screenshot.b64}`}
              alt={`Screenshot: ${selectedSlug}`}
              className="w-full block"
              style={{ imageRendering: 'auto' }}
            />
          )}

          {/* Fallback when no screenshot */}
          {!screenshot && clicks.length > 0 && (
            <div
              className="bg-white w-full"
              style={{ height: canvasHeight || 600 }}
            >
              <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-sm">
                Kliknij "Generuj screenshot" aby zobaczyć podgląd strony
              </div>
            </div>
          )}

          {/* Canvas overlay */}
          {clicks.length > 0 && (
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full pointer-events-none"
              style={{ height: screenshot ? '100%' : canvasHeight }}
            />
          )}

          {clicks.length === 0 && !loading && (
            <div className="p-12 text-center text-gray-400 text-sm">
              Brak danych o kliknięciach dla tej strony
            </div>
          )}
        </div>
      )}

      {/* Stats */}
      {clicks.length > 0 && (
        <div className="flex gap-4 text-xs text-gray-500">
          <span>Łącznie punktów: {clicks.length}</span>
          <span>Suma kliknięć: {clicks.reduce((s, c) => s + c.count, 0)}</span>
          <div className="flex items-center gap-2 ml-auto">
            <span>Legenda:</span>
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 opacity-60" /> Niski
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 opacity-60" /> Średni
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 opacity-60" /> Wysoki
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 opacity-60" /> Gorący
          </div>
        </div>
      )}
    </div>
  );
}
