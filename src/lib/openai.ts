/**
 * OpenAI API Integration
 *
 * Provides embeddings generation for semantic search.
 * Uses text-embedding-3-small model for cost-effectiveness.
 *
 * Cost: ~$0.02 per 1M tokens
 */

import OpenAI from 'openai';

// Initialize OpenAI client with config
// Support both import.meta.env (Astro/Vite) and process.env (Node.js)
const apiKey = typeof import.meta !== 'undefined' && import.meta.env?.OPENAI_API_KEY
  ? import.meta.env.OPENAI_API_KEY
  : process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey,
  timeout: 30000, // 30 seconds
  maxRetries: 2,
});

/**
 * Generate embedding vector for given text
 *
 * @param text - Text to generate embedding for
 * @returns Array of 1536 numbers representing the embedding vector
 * @throws Error if API call fails
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error: any) {
    // Handle specific error cases
    if (error?.status === 401) {
      throw new Error('Invalid OpenAI API key. Check OPENAI_API_KEY in .env');
    }

    if (error?.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    }

    if (error?.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to OpenAI API. Check your internet connection.');
    }

    // Generic error
    console.error('[OpenAI Error]', error);
    throw new Error(`OpenAI embedding generation failed: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * More efficient than calling generateEmbedding() in a loop
 *
 * @param texts - Array of texts to generate embeddings for
 * @returns Array of embedding vectors
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
      encoding_format: 'float',
    });

    return response.data.map(item => item.embedding);
  } catch (error: any) {
    console.error('[OpenAI Batch Error]', error);
    throw new Error(`OpenAI batch embedding generation failed: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Generate contextual search summaries using GPT-4o-mini
 *
 * For each search result, generates a 1-sentence description
 * explaining why the article is relevant to the user's query.
 */
export async function generateSearchSummaries(
  query: string,
  results: Array<{ postTitle: string; sectionTitle?: string; content: string }>
): Promise<string[]> {
  if (results.length === 0) return [];

  const articles = results.map((r, i) =>
    `[${i + 1}] "${r.postTitle}"${r.sectionTitle ? ` (sekcja: ${r.sectionTitle})` : ''}\nTreść: ${r.content.slice(0, 600)}`
  ).join('\n\n');

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 300,
      messages: [{
        role: 'system',
        content: `Jesteś asystentem wyszukiwarki. Dla każdego artykułu napisz JEDNO zdanie (max 20 słów) odpowiadające BEZPOŚREDNIO na zapytanie użytkownika.

ZASADY:
- Użyj konkretnych terminów z zapytania (np. jeśli pytanie o "CAC", napisz o CAC)
- NIE pisz ogólników typu "dowiedz się" czy "poznaj klucze do sukcesu"
- Odnieś się do treści artykułu, nie wymyślaj

PRZYKŁAD:
Zapytanie: "jak obliczyć ROAS"
Artykuł: "15 metryk e-commerce" (sekcja: ROAS)
Wynik: Wzór na ROAS, benchmarki (2x-6x) i praktyczne przykłady z Meta Ads.

Format: 1. zdanie\n2. zdanie`
      }, {
        role: 'user',
        content: `Zapytanie: "${query}"\n\nArtykuły:\n${articles}`
      }],
    });

    const text = response.choices[0]?.message?.content || '';
    const lines = text.split('\n').filter(l => l.trim());

    return results.map((_, i) => {
      const line = lines.find(l => l.startsWith(`${i + 1}.`));
      return line ? line.replace(/^\d+\.\s*/, '').trim() : '';
    });
  } catch (error) {
    console.error('[OpenAI] Summary generation failed:', error);
    return results.map(() => '');
  }
}

// =============================================================
// Blog Topic Suggestions (GPT-4o)
// =============================================================

export interface TopicSuggestion {
  title: string;
  description: string;
  reasoning: string;
  dataSignals: string[];
  estimatedDifficulty: 'low' | 'medium' | 'high';
  suggestedCategory: 'tutorial' | 'case-study' | 'guide' | 'announcement';
}

interface AnalyticsSignals {
  postRankings: Array<{
    slug: string; pageviews: number; uniqueVisitors: number;
    avgDepth: number; avgTime: number; copies: number;
    interactions: number; returnVisits: number;
  }>;
  searchQueries: Array<{ query: string; count: number; avgResults: number; clicks: number; ctr: number }>;
  findInPage: Array<{ query: string; slug: string; count: number }>;
  copyLog: Array<{ slug: string; text: string; count: number }>;
  topInteractions: Array<{ slug: string; count: number }>;
  totalPageviews: number;
}

function buildTopicPrompt(data: AnalyticsSignals): string {
  const sections: string[] = [];

  if (data.postRankings.length > 0) {
    sections.push(
      '## Ranking artykułów (pageviews)\n' +
        data.postRankings
          .map(
            p =>
              `- ${p.slug}: ${p.pageviews} pv, ${p.uniqueVisitors} uniq, scroll ${p.avgDepth}%, czas ${p.avgTime}s, ${p.copies} kopii, ${p.returnVisits} powrotów`,
          )
          .join('\n'),
    );
  }

  if (data.searchQueries.length > 0) {
    sections.push(
      '## Wyszukiwania na stronie\n' +
        data.searchQueries
          .map(q => `- "${q.query}": ${q.count}x, CTR ${q.ctr}%, śr. wyników: ${q.avgResults}`)
          .join('\n'),
    );
  }

  if (data.findInPage.length > 0) {
    sections.push(
      '## Ctrl+F — czego szukają w artykułach\n' +
        data.findInPage.map(f => `- "${f.query}" w ${f.slug}: ${f.count}x`).join('\n'),
    );
  }

  if (data.copyLog.length > 0) {
    sections.push(
      '## Najczęściej kopiowane fragmenty\n' +
        data.copyLog
          .map(c => `- [${c.slug}] "${(c.text || '').slice(0, 120)}": ${c.count}x`)
          .join('\n'),
    );
  }

  return sections.join('\n\n');
}

/**
 * Generate blog topic suggestions using GPT-4o based on analytics data.
 */
export async function generateBlogTopicSuggestions(
  data: AnalyticsSignals,
): Promise<TopicSuggestion[]> {
  const prompt = buildTopicPrompt(data);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    temperature: 0.7,
    max_tokens: 2500,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Jesteś strategicznym konsultantem content marketingu dla bloga o e-commerce, automatyzacji danych i narzędziach AI dla sprzedawców online.

Na podstawie danych analitycznych zaproponuj tematy na nowe artykuły blogowe.

ZASADY ANALIZY:
- Wyszukiwania z niskim CTR = niezaspokojone potrzeby → okazja na nowy artykuł
- Ctrl+F szukania wewnątrz artykułów = czego brakuje w istniejących treściach
- Kopiowane fragmenty = tematy o wysokiej wartości dla czytelnika
- Popularne artykuły (wysokie powroty) = tematy warte rozwinięcia/spin-offów
- Zapytania bez wyników = potencjalne nowe tematy

ODPOWIEDZ WYŁĄCZNIE poprawnym JSON:
{
  "suggestions": [
    {
      "title": "Tytuł artykułu po polsku",
      "description": "2-3 zdania o czym będzie artykuł i co czytelnik z niego wyniesie",
      "reasoning": "Dlaczego ten temat? Jakie dane to potwierdzają?",
      "dataSignals": ["konkretny sygnał z danych", "drugi sygnał"],
      "estimatedDifficulty": "low|medium|high",
      "suggestedCategory": "tutorial|case-study|guide|announcement"
    }
  ]
}

Zaproponuj 6-8 tematów posortowanych od najbardziej obiecujących. Tematy muszą być konkretne i praktyczne.`,
      },
      {
        role: 'user',
        content: `Dane analityczne z ostatniego okresu (${data.totalPageviews} pageviews łącznie):\n\n${prompt}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content || '{}';
  let parsed: { suggestions?: TopicSuggestion[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Nieprawidłowa odpowiedź z OpenAI');
  }

  return parsed.suggestions || [];
}

/**
 * Get estimated token count for text
 * Rough approximation: 1 token ≈ 4 characters
 *
 * @param text - Text to estimate tokens for
 * @returns Estimated token count
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Calculate cost for embedding generation
 *
 * @param tokenCount - Number of tokens
 * @returns Cost in USD
 */
export function calculateEmbeddingCost(tokenCount: number): number {
  const costPerMillionTokens = 0.02; // $0.02 per 1M tokens
  return (tokenCount / 1_000_000) * costPerMillionTokens;
}
