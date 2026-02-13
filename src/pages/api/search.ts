/**
 * Search API Endpoint
 *
 * POST /api/search
 *
 * Request body:
 * {
 *   "query": "jak zaoszczędzić czas",
 *   "language": "pl",  // optional: "pl" | "en" | "all" (default: "all")
 *   "limit": 5         // optional: number (default: 5)
 * }
 *
 * Response:
 * {
 *   "results": [...],
 *   "method": "semantic" | "keyword" | "none",
 *   "count": 5
 * }
 */

import type { APIRoute } from 'astro';
import { searchWithFallback } from '@lib/embeddings/search';

// Disable prerendering for this API route
export const prerender = false;

/**
 * Sanitize user input query
 *
 * @param query - Raw query string
 * @returns Sanitized query
 */
function sanitizeQuery(query: string): string {
  // Remove control characters
  return query.replace(/[\x00-\x1F\x7F]/g, '').trim();
}

/**
 * Validate search request
 *
 * @param body - Request body
 * @returns Validation result
 */
function validateRequest(body: any): {
  valid: boolean;
  error?: string;
  data?: {
    query: string;
    language: 'pl' | 'en' | 'all';
    limit: number;
  };
} {
  // Check if body exists
  if (!body || typeof body !== 'object') {
    return {
      valid: false,
      error: 'Invalid request body',
    };
  }

  // Check if query exists
  if (!body.query || typeof body.query !== 'string') {
    return {
      valid: false,
      error: 'Query is required and must be a string',
    };
  }

  // Sanitize query
  const sanitizedQuery = sanitizeQuery(body.query);

  // Check if query is empty after sanitization
  if (sanitizedQuery.length === 0) {
    return {
      valid: false,
      error: 'Query cannot be empty',
    };
  }

  // Check query length
  if (sanitizedQuery.length > 500) {
    return {
      valid: false,
      error: 'Query is too long (maximum 500 characters)',
    };
  }

  // Validate language
  const language = body.language || 'all';
  if (!['pl', 'en', 'all'].includes(language)) {
    return {
      valid: false,
      error: 'Language must be "pl", "en", or "all"',
    };
  }

  // Validate limit
  const limit = parseInt(body.limit) || 5;
  if (limit < 1 || limit > 20) {
    return {
      valid: false,
      error: 'Limit must be between 1 and 20',
    };
  }

  return {
    valid: true,
    data: {
      query: sanitizedQuery,
      language: language as 'pl' | 'en' | 'all',
      limit,
    },
  };
}

/**
 * POST /api/search
 * Perform semantic search on blog posts
 */
export const POST: APIRoute = async ({ request }) => {
  const startTime = Date.now();

  try {
    // Parse request body
    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Invalid JSON in request body',
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Validate request
    const validation = validateRequest(body);

    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          error: validation.error,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { query, language, limit } = validation.data!;

    // Log request
    console.log('[API Search]', {
      query,
      language,
      limit,
      timestamp: new Date().toISOString(),
    });

    // Perform search with fallback
    const { results, method } = await searchWithFallback({
      query,
      language,
      limit,
    });

    const latency = Date.now() - startTime;

    // Log result
    console.log('[API Search] Result', {
      query,
      resultsCount: results.length,
      method,
      latency: `${latency}ms`,
    });

    // Return results
    return new Response(
      JSON.stringify({
        results,
        method,
        count: results.length,
        latency,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
        },
      }
    );
  } catch (error: any) {
    const latency = Date.now() - startTime;

    // Log error
    console.error('[API Search] Error', {
      message: error?.message,
      stack: error?.stack,
      latency: `${latency}ms`,
    });

    // Check if it's an OpenAI error
    if (error?.message?.includes('OpenAI')) {
      return new Response(
        JSON.stringify({
          error: 'Search service temporarily unavailable',
          details: 'AI service error',
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60', // Retry after 1 minute
          },
        }
      );
    }

    // Check if it's a Redis error
    if (error?.message?.includes('Redis')) {
      return new Response(
        JSON.stringify({
          error: 'Search service temporarily unavailable',
          details: 'Storage service error',
        }),
        {
          status: 503,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '30', // Retry after 30 seconds
          },
        }
      );
    }

    // Generic error
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};

/**
 * OPTIONS /api/search
 * Handle CORS preflight requests
 */
export const OPTIONS: APIRoute = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
