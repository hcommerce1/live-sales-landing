/**
 * Facebook Post Generator
 *
 * Core library for generating Facebook posts from blog content.
 * Used by:
 *   - scripts/generate-fb-posts.ts  (CLI bulk generation)
 *   - src/pages/api/generate-fb-post.ts  (per-post API for admin UI)
 *
 * NOTE: Does NOT import from 'astro:content' — must work in plain Node/tsx context.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import type OpenAI from 'openai';

// ============================================================
// TYPES
// ============================================================

export interface FbPostRecord {
  slug: string;
  lang: 'pl' | 'en';
  title: string;
  fbPost: string;           // tekst gotowy do wklejenia na FB
  generatedAt: string;      // ISO timestamp
  wordCount: number;
  estimatedReach: number;   // 0-100, heurystyka jakości posta
  promptVersion: string;    // "1.0.0" — do inwalidacji cache po zmianie promptu
}

export interface BlogPostInput {
  slug: string;
  lang: 'pl' | 'en';
  title: string;
  description: string;
  tags: string[];
  category: string;
  content: string;          // surowa treść MDX
}

// ============================================================
// PROMPT VERSION (increment when system prompt changes)
// ============================================================

const PROMPT_VERSION = '1.0.0';

// ============================================================
// SYSTEM PROMPTS
// ============================================================

const SYSTEM_PROMPT_PL = `Jesteś doświadczonym copywriterem social media dla polskich grup e-commerce na Facebooku (Ecommerce Polska, Allegro Sellers Community, E-commerce Masterminds PL, Shopify Polska PL).

Twoje zadanie: napisz post na Facebooka który wygeneruje maksymalnie dużo kliknięć w link do artykułu.

FORMAT OBOWIĄZKOWY (w tej kolejności):

1. HOOK [linie 1-2 — widoczne przed "Zobacz więcej" na mobile]:
   Zaskakujące lub kontrowersyjne twierdzenie. Użyj liczby lub konkretnego faktu jeśli dostępny. NIE pisz "Dowiedz się..." ani "Sprawdź nasz". Pisz tezę wywołującą reakcję emocjonalną.

2. PROBLEM [1-2 zdania]:
   Zidentyfikuj ból czytelnika który artykuł rozwiązuje. Bez sprzedawania — tylko diagnoza.

3. TEASERY [dokładnie 3 punkty, każdy inny emoji]:
   Każdy zawiera konkretną korzyść lub liczbę. Każdy kończy się pytaniem lub niedokończoną myślą. NIE ujawniaj rozwiązania — tylko sygnalizuj że istnieje.

4. DOWÓD [1 zdanie]:
   Krótka statystyka branżowa lub mocne twierdzenie uwiarygodniające temat.

5. CTA [2 linie]:
   Linia 1: "Pełny poradnik z przykładami → [URL_ARTYKULU]"
   Linia 2: "Sprawdź zanim zrobi to Twoja konkurencja 👀"

6. HASHTAGI [osobna linia, 4-5 tagów]:
   Wybierz pasujące: #ecommerce #sprzedazinternetowa #allegro #shopify #marketplace #automatyzacja #analityka #reklamaonline #dropshipping #facebook_ads #googleads #sklep_internetowy

ZASADY ABSOLUTNE:
- Maksimum 280 słów łącznie
- Żadnych pełnych rozwiązań — tylko teasery budujące ciekawość
- Nie zaczynaj od "Cześć", "Hej", "Witajcie" ani "Dzień dobry"
- Naturalny język, bez korporacyjnego żargonu
- Nie używaj cudzysłowów wokół tytułu artykułu w tekście

Odpowiedz WYŁĄCZNIE tekstem posta. Żadnych nagłówków, etykiet sekcji ani komentarzy.`;

const SYSTEM_PROMPT_EN = `You are an experienced social media copywriter for English-speaking e-commerce communities on Facebook.

Your task: write a Facebook post that generates maximum clicks to a blog article link.

MANDATORY FORMAT (in this order):

1. HOOK [lines 1-2 — visible before "See more" on mobile]:
   Surprising or controversial statement. Use a number or specific fact if available. Do NOT write "Learn how..." or "Check out our...". Write a thesis that provokes an emotional reaction.

2. PROBLEM [1-2 sentences]:
   Identify the reader's pain point that the article solves.

3. TEASERS [exactly 3 bullet points, different emoji each]:
   Each contains a concrete benefit or number. Each ends with a question or unfinished thought. Do NOT reveal the solution — only signal it exists.

4. PROOF [1 sentence]:
   A brief industry stat or strong claim that legitimizes the topic.

5. CTA [2 lines]:
   Line 1: "Full guide with examples → [ARTICLE_URL]"
   Line 2: "Check it before your competition does 👀"

6. HASHTAGS [separate line, 4-5 tags]:
   Choose relevant: #ecommerce #onlineselling #shopify #marketplace #automation #analytics #digitalmarketing #dropshipping #facebookads #googleads

ABSOLUTE RULES:
- Maximum 280 words total
- No full solutions — only curiosity-building teasers
- Do not start with "Hey", "Hi", or "Hello"
- Natural language, no corporate jargon

Reply with ONLY the post text. No headers, section labels, or comments.`;

// ============================================================
// MDX CLEANING
// ============================================================

/**
 * Strips MDX-specific syntax to produce clean plain text for AI processing.
 * Removes: import statements, JSX components, className attrs, {expressions}.
 */
export function stripMdxToText(content: string): string {
  return content
    // Remove import/export statements
    .replace(/^(import|export)\s+.*$/gm, '')
    // Remove JSX self-closing tags <Component />
    .replace(/<[A-Z][A-Za-z0-9]*[^>]*\/>/g, '')
    // Remove JSX opening tags <Component ...> and closing </Component>
    .replace(/<[A-Z][A-Za-z0-9]*[^>]*>/g, '')
    .replace(/<\/[A-Z][A-Za-z0-9]*>/g, '')
    // Remove common HTML tags with attributes
    .replace(/<(?:div|span|section|article|aside|header|footer|nav|main|figure|figcaption)[^>]*>/gi, '')
    .replace(/<\/(?:div|span|section|article|aside|header|footer|nav|main|figure|figcaption)>/gi, '')
    // Remove JSX block comments {/* ... */}
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    // Remove JSX expressions { ... } but keep markdown content
    .replace(/\{[^}]{0,200}\}/g, '')
    // Remove className and style attributes that may leak
    .replace(/\s+className="[^"]*"/g, '')
    .replace(/\s+style=\{[^}]*\}/g, '')
    // Normalize multiple blank lines to double
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ============================================================
// KEY POINTS EXTRACTION
// ============================================================

/**
 * Extracts the most signal-rich content from cleaned markdown text.
 * Prioritizes: H2/H3 headings → lines with numbers → first paragraphs.
 */
export function extractKeyPoints(cleanText: string, maxChars = 2000): string {
  const lines = cleanText.split('\n');

  const headings: string[] = [];
  const statsLines: string[] = [];
  const introParagraphs: string[] = [];

  let inIntro = true;
  let introCharCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      inIntro = false;
      continue;
    }

    // Collect H2 and H3 headings
    if (/^#{2,3}\s/.test(trimmed)) {
      headings.push(trimmed.replace(/^#+\s+/, ''));
      inIntro = false;
      continue;
    }

    // Collect lines containing numbers, percentages, PLN amounts, stats
    if (/\d+/.test(trimmed) && trimmed.length > 20 && trimmed.length < 200) {
      statsLines.push(trimmed);
    }

    // Collect first ~600 chars of intro paragraphs
    if (inIntro && introCharCount < 600 && !trimmed.startsWith('#')) {
      introParagraphs.push(trimmed);
      introCharCount += trimmed.length;
    }
  }

  const parts: string[] = [];

  if (introParagraphs.length > 0) {
    parts.push('WPROWADZENIE:\n' + introParagraphs.slice(0, 5).join('\n'));
  }

  if (headings.length > 0) {
    parts.push('SEKCJE:\n' + headings.map(h => `• ${h}`).join('\n'));
  }

  if (statsLines.length > 0) {
    parts.push('DANE/LICZBY:\n' + statsLines.slice(0, 8).join('\n'));
  }

  const combined = parts.join('\n\n');
  return combined.length > maxChars ? combined.slice(0, maxChars) + '...' : combined;
}

// ============================================================
// PROMPT BUILDING
// ============================================================

export function buildFbPrompt(
  post: BlogPostInput,
  cleanText: string
): Array<{ role: 'system' | 'user'; content: string }> {
  const blogUrl = `https://live-sales.pl/${post.lang}/blog/${post.slug}`;
  const keyPoints = extractKeyPoints(cleanText, 2000);
  const isPolish = post.lang === 'pl';

  const userContent = isPolish
    ? `Tytuł artykułu: "${post.title}"
Opis SEO: "${post.description}"
Tagi: ${post.tags.join(', ')}
Kategoria: ${post.category}
URL artykułu: ${blogUrl}

Treść artykułu (wyciąg):
${keyPoints}`
    : `Article title: "${post.title}"
SEO description: "${post.description}"
Tags: ${post.tags.join(', ')}
Category: ${post.category}
Article URL: ${blogUrl}

Article content (extract):
${keyPoints}`;

  return [
    { role: 'system', content: isPolish ? SYSTEM_PROMPT_PL : SYSTEM_PROMPT_EN },
    { role: 'user', content: userContent },
  ];
}

// ============================================================
// REACH SCORE HEURISTIC
// ============================================================

/**
 * Computes a 0-100 quality score based on structural signals.
 * This is a heuristic — not real Facebook reach data.
 */
export function computeReachScore(fbPost: string): number {
  let score = 50;

  const words = fbPost.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // Word count sweet spot: 150-280
  if (wordCount >= 150 && wordCount <= 280) score += 10;
  else if (wordCount > 300) score -= 10;
  else if (wordCount < 80) score -= 15;

  // Hook contains a number
  const firstTwoLines = fbPost.split('\n').slice(0, 2).join(' ');
  if (/\d+/.test(firstTwoLines)) score += 10;

  // Has exactly 3 emoji bullet points (common: single emoji at line start)
  const emojiBullets = (fbPost.match(/^[^\w\s]{1,3}\s+\w/gm) || []).length;
  if (emojiBullets >= 3) score += 10;

  // Has CTA arrow or emoji hand
  if (/→|👉|👀/.test(fbPost)) score += 10;

  // Has urgency words
  if (/zanim|konkurencja|dziś|teraz|before|competition/i.test(fbPost)) score += 10;

  // Has hashtags
  if (/#\w+/.test(fbPost)) score += 5;
  else score -= 10;

  // Starts with forbidden words
  if (/^(cześć|hej|witaj|hello|hey|hi\b)/i.test(fbPost.trim())) score -= 15;

  return Math.max(0, Math.min(100, score));
}

// ============================================================
// MAIN GENERATION
// ============================================================

export async function generateFbPost(
  openai: OpenAI,
  post: BlogPostInput
): Promise<FbPostRecord> {
  const cleanText = stripMdxToText(post.content);
  const messages = buildFbPrompt(post, cleanText);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    max_tokens: 600,
    messages: messages as Parameters<typeof openai.chat.completions.create>[0]['messages'],
  });

  const fbPost = response.choices[0]?.message?.content?.trim() ?? '';
  const wordCount = fbPost.split(/\s+/).filter(Boolean).length;

  return {
    slug: post.slug,
    lang: post.lang,
    title: post.title,
    fbPost,
    generatedAt: new Date().toISOString(),
    wordCount,
    estimatedReach: computeReachScore(fbPost),
    promptVersion: PROMPT_VERSION,
  };
}

// ============================================================
// FILE I/O
// ============================================================

const DATA_DIR = join(process.cwd(), 'src', 'data', 'fb-posts');

export function buildOutputPath(slug: string): string {
  return join(DATA_DIR, `${slug}.json`);
}

export function saveFbPost(slug: string, record: FbPostRecord): void {
  mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(buildOutputPath(slug), JSON.stringify(record, null, 2), 'utf-8');
}

export function loadFbPost(slug: string): FbPostRecord | null {
  const path = buildOutputPath(slug);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf-8')) as FbPostRecord;
}

export function loadFbPosts(): FbPostRecord[] {
  if (!existsSync(DATA_DIR)) return [];
  return readdirSync(DATA_DIR)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(readFileSync(join(DATA_DIR, f), 'utf-8')) as FbPostRecord)
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}
