import type { CollectionEntry } from 'astro:content';

// Oblicz czas czytania (200 słów/min w polskim)
export function getReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / 200);
}

// Formatuj datę po polsku
export function formatDate(date: Date, locale: string = 'pl'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

// Sortuj posty od najnowszych
export function sortByDate(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

// Filtruj opublikowane (bez draft)
export function filterPublished(posts: CollectionEntry<'blog'>[]): CollectionEntry<'blog'>[] {
  return posts.filter(post => !post.data.draft);
}

// Wygeneruj excerpt z contentu
export function generateExcerpt(content: string, length: number = 150): string {
  const plainText = content.replace(/[#*`\[\]]/g, '').trim();
  if (plainText.length <= length) return plainText;
  return plainText.slice(0, length).trim() + '...';
}

// Powiązane posty na podstawie tagów
export function getRelatedPosts(
  currentPost: CollectionEntry<'blog'>,
  allPosts: CollectionEntry<'blog'>[],
  limit: number = 3
): CollectionEntry<'blog'>[] {
  const currentTags = currentPost.data.tags;
  return allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => ({
      post,
      score: post.data.tags.filter(tag => currentTags.includes(tag)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post);
}
