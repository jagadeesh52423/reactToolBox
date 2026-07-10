// Case transformation functions
export function toUpperCase(text: string): string {
  return text.toUpperCase();
}

export function toLowerCase(text: string): string {
  return text.toLowerCase();
}

export function toTitleCase(text: string): string {
  return text.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.substring(1).toLowerCase()
  );
}

// Splits on whitespace, hyphens and underscores, and on lower-to-upper transitions
// (so `_` gets the same word-boundary treatment as `-` and space, unlike a `\b` regex).
function splitIntoWords(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[\s_-]+/)
    .filter(Boolean);
}

export function toCamelCase(text: string): string {
  return splitIntoWords(text)
    .map((word, index) => {
      const lower = word.toLowerCase();
      return index === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

export function toPascalCase(text: string): string {
  return splitIntoWords(text)
    .map((word) => {
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join('');
}

export function toSnakeCase(text: string): string {
  return text
    .replace(/\s+/g, '_')
    .replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)
    .replace(/^_/, '')
    .replace(/-/g, '_')
    .replace(/_+/g, '_');
}

export function toKebabCase(text: string): string {
  return text
    .replace(/\s+/g, '-')
    .replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)
    .replace(/^-/, '')
    .replace(/_/g, '-')
    .replace(/-+/g, '-');
}

export function toSentenceCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function toConstantCase(text: string): string {
  return text
    .replace(/\s+/g, '_')
    .replace(/[A-Z]/g, (match, index) => index > 0 ? `_${match}` : match)
    .replace(/[-./]/g, '_')
    .replace(/_+/g, '_')
    .toUpperCase();
}

export function toDotCase(text: string): string {
  return text
    .replace(/\s+/g, '.')
    .replace(/[A-Z]/g, (match, index) => index > 0 ? `.${match.toLowerCase()}` : match.toLowerCase())
    .replace(/[-_/]/g, '.')
    .replace(/\.+/g, '.')
    .toLowerCase();
}

export function toPathCase(text: string): string {
  return text
    .replace(/\s+/g, '/')
    .replace(/[A-Z]/g, (match, index) => index > 0 ? `/${match.toLowerCase()}` : match.toLowerCase())
    .replace(/[-_.]/g, '/')
    .replace(/\/+/g, '/')
    .toLowerCase();
}

export function toAlternatingCase(text: string): string {
  return text
    .split('')
    .map((char, index) => index % 2 === 0 ? char.toLowerCase() : char.toUpperCase())
    .join('');
}

export function toInverseCase(text: string): string {
  return text
    .split('')
    .map(char => char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase())
    .join('');
}

// Formatting functions
export function trimWhitespace(text: string): string {
  return text.trim();
}

export function removeExtraSpaces(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*/g, '\n')
    .trim();
}

// Encoding functions
export function encodeURL(text: string): string {
  return encodeURIComponent(text);
}

export function decodeURL(text: string): string {
  try {
    return decodeURIComponent(text);
  } catch (error) {
    return 'Error decoding URL: Invalid encoding';
  }
}

// Regex helpers
export function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Counting functions
export function countCharacters(text: string): number {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    // Count user-perceived characters (graphemes), not UTF-16 code units,
    // so astral-plane emoji count as 1 instead of 2.
    return Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)).length;
  }
  return text.length;
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    // Locale-aware word segmentation handles non-space-delimited scripts (CJK, Thai)
    // correctly, unlike a plain whitespace split.
    const segments = new Intl.Segmenter(undefined, { granularity: 'word' }).segment(trimmed);
    let wordCount = 0;
    for (const segment of segments) {
      if (segment.isWordLike) wordCount++;
    }
    // Emoji/symbol-only text has no isWordLike segments (ICU doesn't treat them as
    // words), so fall back to whitespace tokens rather than reporting 0 words for
    // visibly non-empty text.
    if (wordCount > 0) return wordCount;
  }

  return trimmed.split(/\s+/).length;
}

export function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}
