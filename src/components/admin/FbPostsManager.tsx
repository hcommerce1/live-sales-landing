/**
 * FB Posts Manager
 *
 * React island for /admin/fb-posts.
 * Two sections:
 *   1. Blog Post Selector — pick posts to generate FB content for
 *   2. Generated Posts — existing FbPostCards with copy/regenerate
 */

import { useState, useCallback } from 'react';
import type { FbPostRecord } from '@lib/fbPostGenerator';

// ============================================================
// Types
// ============================================================

interface BlogPostMeta {
  slug: string;
  lang: 'pl' | 'en';
  title: string;
  description: string;
  pubDate: string;
  category: string;
  tags: string[];
}

type GenerationStatus = 'idle' | 'generating' | 'done' | 'error';

interface GenerationProgress {
  slug: string;
  status: GenerationStatus;
  error?: string;
}

interface Props {
  initialPosts: FbPostRecord[];
  availableBlogPosts: BlogPostMeta[];
}

// ============================================================
// Main Component
// ============================================================

export default function FbPostsManager({ initialPosts, availableBlogPosts }: Props) {
  const [posts, setPosts] = useState<FbPostRecord[]>(initialPosts);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Generation state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress[]>([]);

  const generatedSlugs = new Set(posts.map(p => p.slug));

  // ---- Selection handlers ----

  const toggleSelect = (slug: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(availableBlogPosts.map(p => p.slug)));
  };

  const selectUngenerated = () => {
    setSelected(
      new Set(availableBlogPosts.filter(p => !generatedSlugs.has(p.slug)).map(p => p.slug))
    );
  };

  const clearSelection = () => setSelected(new Set());

  // ---- Batch generation ----

  const handleBatchGenerate = async () => {
    if (selected.size === 0) return;

    setIsGenerating(true);
    setError(null);

    const selectedPosts = availableBlogPosts.filter(p => selected.has(p.slug));
    setProgress(selectedPosts.map(p => ({ slug: p.slug, status: 'idle' as const })));

    for (let i = 0; i < selectedPosts.length; i++) {
      const post = selectedPosts[i];

      setProgress(prev =>
        prev.map(p => (p.slug === post.slug ? { ...p, status: 'generating' as const } : p))
      );

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

        const record: FbPostRecord = await res.json();

        setPosts(prev => {
          const exists = prev.some(p => p.slug === record.slug);
          if (exists) return prev.map(p => (p.slug === record.slug ? record : p));
          return [record, ...prev];
        });

        setProgress(prev =>
          prev.map(p => (p.slug === post.slug ? { ...p, status: 'done' as const } : p))
        );
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setProgress(prev =>
          prev.map(p =>
            p.slug === post.slug ? { ...p, status: 'error' as const, error: msg } : p
          )
        );
      }

      // Rate-limit delay between requests
      if (i < selectedPosts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    setIsGenerating(false);
    setSelected(new Set());
  };

  // ---- Copy & Regenerate (existing) ----

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
    <div className="space-y-8">
      {/* === SECTION 1: Blog Post Selector === */}
      <BlogPostSelector
        blogPosts={availableBlogPosts}
        generatedSlugs={generatedSlugs}
        selected={selected}
        onToggle={toggleSelect}
        onSelectAll={selectAll}
        onSelectUngenerated={selectUngenerated}
        onClear={clearSelection}
        onGenerate={handleBatchGenerate}
        isGenerating={isGenerating}
        progress={progress}
      />

      {/* === Error banner === */}
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

      {/* === SECTION 2: Generated Posts === */}
      {posts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Wygenerowane posty ({posts.length})
          </h2>
          <div className="space-y-6">
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
        </div>
      )}
    </div>
  );
}

// ============================================================
// BlogPostSelector
// ============================================================

interface SelectorProps {
  blogPosts: BlogPostMeta[];
  generatedSlugs: Set<string>;
  selected: Set<string>;
  onToggle: (slug: string) => void;
  onSelectAll: () => void;
  onSelectUngenerated: () => void;
  onClear: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  progress: GenerationProgress[];
}

function BlogPostSelector({
  blogPosts,
  generatedSlugs,
  selected,
  onToggle,
  onSelectAll,
  onSelectUngenerated,
  onClear,
  onGenerate,
  isGenerating,
  progress,
}: SelectorProps) {
  const ungeneratedCount = blogPosts.filter(p => !generatedSlugs.has(p.slug)).length;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Generuj posty FB</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Wybierz artykuły do wygenerowania postów
              {ungeneratedCount > 0 && (
                <span className="text-orange-500"> · {ungeneratedCount} bez posta</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onSelectAll}
              disabled={isGenerating}
              className="text-blue-600 hover:underline disabled:opacity-40"
            >
              Wszystkie
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={onSelectUngenerated}
              disabled={isGenerating}
              className="text-blue-600 hover:underline disabled:opacity-40"
            >
              Tylko nowe
            </button>
            <span className="text-gray-300">|</span>
            <button
              onClick={onClear}
              disabled={isGenerating}
              className="text-gray-400 hover:underline disabled:opacity-40"
            >
              Odznacz
            </button>
          </div>
        </div>
      </div>

      {/* Blog post list with checkboxes */}
      <div className="divide-y divide-gray-100">
        {blogPosts.map(post => {
          const isGenerated = generatedSlugs.has(post.slug);
          const isSelected = selected.has(post.slug);
          const postProgress = progress.find(p => p.slug === post.slug);

          return (
            <label
              key={`${post.lang}-${post.slug}`}
              className={`flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                isSelected ? 'bg-blue-50/50' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(post.slug)}
                disabled={isGenerating}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-800 truncate">
                    {post.title}
                  </span>
                  <span className="shrink-0 text-[10px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                    {post.lang.toUpperCase()}
                  </span>
                  {isGenerated && (
                    <span className="shrink-0 text-[10px] font-medium text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                      wygenerowany
                    </span>
                  )}
                </div>
                {post.description && (
                  <p className="text-xs text-gray-400 truncate mt-0.5">{post.description}</p>
                )}
              </div>

              {/* Progress indicator */}
              {postProgress && (
                <div className="shrink-0">
                  {postProgress.status === 'generating' && (
                    <span className="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  )}
                  {postProgress.status === 'done' && (
                    <span className="text-green-500 text-sm font-bold">✓</span>
                  )}
                  {postProgress.status === 'error' && (
                    <span
                      className="text-red-500 text-sm font-bold cursor-help"
                      title={postProgress.error}
                    >
                      ✕
                    </span>
                  )}
                </div>
              )}
            </label>
          );
        })}
      </div>

      {/* Generate button */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {selected.size > 0 ? `Wybrano: ${selected.size}` : 'Zaznacz artykuły do generowania'}
        </span>
        <button
          onClick={onGenerate}
          disabled={selected.size === 0 || isGenerating}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generuję...
            </>
          ) : (
            <>Generuj{selected.size > 0 ? ` (${selected.size})` : ''}</>
          )}
        </button>
      </div>
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
