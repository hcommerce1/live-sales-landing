/**
 * MDX Content → Clean Text for TTS
 *
 * Strips all Markdown formatting, code blocks, KaTeX formulas,
 * React components, tables, and HTML tags — producing natural
 * readable text for ElevenLabs TTS.
 */

/**
 * Convert MDX/Markdown content to clean text suitable for TTS.
 */
export function prepareTextForTTS(mdxContent: string): string {
  let text = mdxContent;

  // 1. Remove frontmatter (---...---)
  text = text.replace(/^---[\s\S]*?---\n*/m, '');

  // 2. Remove import statements
  text = text.replace(/^import\s+.*$/gm, '');

  // 3. Remove JSX/React components (<Component ... /> and <Component>...</Component>)
  text = text.replace(/<[A-Z][a-zA-Z]*[^>]*\/>/g, '');
  text = text.replace(/<[A-Z][a-zA-Z]*[^>]*>[\s\S]*?<\/[A-Z][a-zA-Z]*>/g, '');

  // 4. Remove code blocks (```...```)
  text = text.replace(/```[\s\S]*?```/g, '');

  // 5. Remove inline code (`...`)
  text = text.replace(/`([^`]+)`/g, '$1');

  // 6. Remove KaTeX block formulas ($$...$$)
  text = text.replace(/\$\$[\s\S]*?\$\$/g, '');

  // 7. Remove KaTeX inline formulas ($...$)
  text = text.replace(/\$[^$\n]+\$/g, '');

  // 8. Remove HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // 9. Convert Markdown links [text](url) → text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 10. Remove images ![alt](url)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '');

  // 11. Remove headings markers (# ## ### etc) but keep text
  text = text.replace(/^#{1,6}\s+/gm, '');

  // 12. Remove bold/italic markers
  text = text.replace(/\*\*\*([^*]+)\*\*\*/g, '$1');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/___([^_]+)___/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');

  // 13. Remove strikethrough
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // 14. Remove blockquote markers
  text = text.replace(/^>\s*/gm, '');

  // 15. Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // 16. Clean up list markers (- * 1.)
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // 17. Remove table syntax (|...|)
  text = text.replace(/^\|.*\|$/gm, '');
  text = text.replace(/^[-:|]+$/gm, '');

  // 18. Collapse multiple newlines
  text = text.replace(/\n{3,}/g, '\n\n');

  // 19. Trim whitespace
  text = text.trim();

  return text;
}

/**
 * Split text into chunks suitable for TTS API (max ~4500 chars per chunk).
 * Splits at paragraph boundaries.
 */
export function chunkText(text: string, maxChars: number = 4500): string[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if (current.length + para.length + 2 > maxChars) {
      if (current.trim()) chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }

  if (current.trim()) chunks.push(current.trim());

  return chunks;
}

/**
 * Generate SHA-256 hash of content for cache invalidation.
 */
export async function contentHash(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.slice(0, 1000));
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}
