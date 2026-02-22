/**
 * FB Posts Manager
 *
 * React island for /admin/fb-posts.
 * Handles: copy to clipboard, regenerate per post, preview display.
 */

import { useState, useCallback } from 'react';
import type { FbPostRecord } from '@lib/fbPostGenerator';

interface Props {
  initialPosts: FbPostRecord[];
}

export default function FbPostsManager({ initialPosts }: Props) {
  const [posts, setPosts] = useState<FbPostRecord[]>(initialPosts);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = useCallback(async (post: FbPostRecord) => {
    try {
      await navigator.clipboard.writeText(post.fbPost);
      setCopied(post.slug);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError('Kopiowanie nie powiodło się. Zaznacz tekst ręcznie.');
    }
  }, []);

  const handleRegenerate = useCallback(async (post: FbPostRecord) => {
    setRegenerating(post.slug);
    setError(null);
    try {
      const res = await fetch('/api/generate-fb-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: post.slug, lang: post.lang }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(body.error ?? res.statusText);
      }
      const updated: FbPostRecord = await res.json();
      setPosts(prev => prev.map(p => (p.slug === updated.slug ? updated : p)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Błąd regeneracji dla "${post.title}": ${msg}`);
    } finally {
      setRegenerating(null);
    }
  }, []);

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
          <span>⚠️</span>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {posts.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-lg font-medium mb-2">Brak wygenerowanych postów</p>
          <p className="text-sm mb-4">Uruchom skrypt generowania:</p>
          <code className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-mono">
            npm run generate:fb-posts:pl
          </code>
        </div>
      )}

      {posts.map(post => (
        <FbPostCard
          key={post.slug}
          post={post}
          isCopied={copied === post.slug}
          isRegenerating={regenerating === post.slug}
          onCopy={handleCopy}
          onRegenerate={handleRegenerate}
        />
      ))}
    </div>
  );
}

// ============================================================
// FbPostCard
// ============================================================

interface CardProps {
  post: FbPostRecord;
  isCopied: boolean;
  isRegenerating: boolean;
  onCopy: (post: FbPostRecord) => void;
  onRegenerate: (post: FbPostRecord) => void;
}

function FbPostCard({ post, isCopied, isRegenerating, onCopy, onRegenerate }: CardProps) {
  const [showFull, setShowFull] = useState(false);

  const blogUrl = `https://live-sales.pl/${post.lang}/blog/${post.slug}`;

  // Facebook preview: first 2 non-empty lines visible before "See more"
  const lines = post.fbPost.split('\n').filter(l => l.trim());
  const hookLines = lines.slice(0, 2).join('\n');
  const hasMore = lines.length > 2;

  const scoreColor =
    post.estimatedReach >= 70
      ? 'text-green-700 bg-green-50 border-green-200'
      : post.estimatedReach >= 40
        ? 'text-yellow-700 bg-yellow-50 border-yellow-200'
        : 'text-red-700 bg-red-50 border-red-200';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* ---- Header ---- */}
      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-gray-800 truncate">{post.title}</span>
          <span className="shrink-0 text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
            {post.lang.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-3">
          <span className="text-xs text-gray-400">{post.wordCount} słów</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${scoreColor}`}
            title="Heurystyczny wynik jakości posta (0-100). Nie jest to rzeczywisty zasięg Facebook."
          >
            Reach {post.estimatedReach}/100
          </span>
        </div>
      </div>

      {/* ---- Facebook-style Preview ---- */}
      <div className="px-5 py-4">
        <div className="bg-[#f0f2f5] rounded-2xl p-4">
          {/* Mock FB profile */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              LS
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-900">LiveSales Blog</div>
              <div className="text-[11px] text-gray-400">Grupa e-commerce · Teraz</div>
            </div>
          </div>

          {/* Post text with fold */}
          <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
            {showFull ? post.fbPost : hookLines}
            {hasMore && !showFull && (
              <>
                {' '}
                <button
                  onClick={() => setShowFull(true)}
                  className="text-gray-500 hover:text-gray-700 text-xs underline"
                >
                  ...Zobacz więcej
                </button>
              </>
            )}
            {showFull && hasMore && (
              <button
                onClick={() => setShowFull(false)}
                className="block text-gray-500 hover:text-gray-700 text-xs underline mt-1"
              >
                Zwiń
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---- Actions ---- */}
      <div className="flex items-center gap-2 px-5 py-3 border-t border-gray-100">
        <button
          onClick={() => onCopy(post)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium py-2 rounded-xl transition-colors"
        >
          {isCopied ? '✓ Skopiowano!' : 'Kopiuj post'}
        </button>
        <button
          onClick={() => onRegenerate(post)}
          disabled={isRegenerating}
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 text-sm text-gray-600 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isRegenerating ? (
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Generuję...
            </span>
          ) : (
            'Regeneruj'
          )}
        </button>
        <a
          href={blogUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-sm text-gray-600 rounded-xl transition-colors"
        >
          Artykuł ↗
        </a>
        <span className="text-xs text-gray-400 ml-auto hidden sm:block">
          {new Date(post.generatedAt).toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
          })}
        </span>
      </div>

      {/* ---- Raw text (collapsed) ---- */}
      <details className="group">
        <summary className="px-5 py-2 text-xs text-gray-400 cursor-pointer hover:text-gray-600 border-t border-gray-50 list-none flex items-center gap-1">
          <span className="group-open:rotate-90 transition-transform inline-block">▶</span>
          Pełny tekst do edycji
        </summary>
        <div className="px-5 pb-4">
          <textarea
            readOnly
            value={post.fbPost}
            rows={10}
            className="w-full text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3 font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
            onClick={e => (e.target as HTMLTextAreaElement).select()}
          />
        </div>
      </details>
    </div>
  );
}
