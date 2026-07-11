import { useCallback, useEffect, useMemo, useState } from 'react';

export interface SearchableRow {
  id: string;
  text: string;
  /** True for added/removed/changed rows; false for unchanged — drives "scope to changes only". */
  isChange: boolean;
}

export interface SearchMatch {
  rowId: string;
  start: number;
  end: number; // exclusive
}

export interface HighlightSegment {
  text: string;
  isMatch: boolean;
  isActive: boolean;
}

const MAX_QUERY_LENGTH = 500;
// Per-row match cap — bounds pathological cases (e.g. an empty-match pattern on a
// huge line) without needing a worker/timeout for what is normally a tiny scan.
const MAX_MATCHES_PER_ROW = 5_000;

/**
 * Pure match search over a flattened row list. Never throws: an invalid regex (when
 * `isRegex`) yields `{ matches: [], error }` instead of crashing the search.
 */
export function findDiffMatches(
  rows: SearchableRow[],
  query: string,
  opts: { isRegex: boolean; caseSensitive: boolean; scopeToChanges: boolean }
): { matches: SearchMatch[]; error: string | null } {
  if (!query) return { matches: [], error: null };
  if (query.length > MAX_QUERY_LENGTH) return { matches: [], error: `Search text too long (max ${MAX_QUERY_LENGTH} characters)` };

  const scopedRows = opts.scopeToChanges ? rows.filter((row) => row.isChange) : rows;

  const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const source = opts.isRegex ? query : escapeRegExp(query);
  const flags = opts.caseSensitive ? 'gu' : 'giu';

  let pattern: RegExp;
  try {
    pattern = new RegExp(source, flags);
  } catch (err) {
    return { matches: [], error: err instanceof Error ? err.message : 'Invalid pattern' };
  }

  const matches: SearchMatch[] = [];
  for (const row of scopedRows) {
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;
    let rowMatchCount = 0;
    while ((match = pattern.exec(row.text)) !== null && rowMatchCount < MAX_MATCHES_PER_ROW) {
      const matchLength = match[0].length;
      matches.push({ rowId: row.id, start: match.index, end: match.index + matchLength });
      pattern.lastIndex = matchLength === 0 ? pattern.lastIndex + 1 : pattern.lastIndex;
      rowMatchCount++;
    }
  }

  return { matches, error: null };
}

/**
 * Splits a row's text into highlight segments given that row's matches and the
 * globally-active match (if it falls on this row). Pure and reusable by both the
 * side-by-side and unified renderers.
 */
export function buildHighlightSegments(
  text: string,
  rowMatches: { start: number; end: number }[],
  activeRange: { start: number; end: number } | null
): HighlightSegment[] {
  if (rowMatches.length === 0) return [{ text, isMatch: false, isActive: false }];

  const sorted = [...rowMatches].sort((a, b) => a.start - b.start);
  const segments: HighlightSegment[] = [];
  let cursor = 0;

  for (const m of sorted) {
    if (m.start > cursor) segments.push({ text: text.slice(cursor, m.start), isMatch: false, isActive: false });
    const isActive = !!activeRange && activeRange.start === m.start && activeRange.end === m.end;
    segments.push({ text: text.slice(m.start, m.end), isMatch: true, isActive });
    cursor = Math.max(cursor, m.end);
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), isMatch: false, isActive: false });

  return segments;
}

/**
 * Search-within-the-diff state: query/regex/scope toggles, computed matches, and
 * next/prev navigation with wraparound. Consumers own row construction (rows differ
 * in shape between the side-by-side and unified views) and re-run this hook's
 * `rows` input whenever the active view's row list changes.
 */
export function useDiffSearch(rows: SearchableRow[]) {
  const [query, setQuery] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [scopeToChanges, setScopeToChanges] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { matches, error } = useMemo(
    () => findDiffMatches(rows, query, { isRegex, caseSensitive: false, scopeToChanges }),
    [rows, query, isRegex, scopeToChanges]
  );

  // Any change to the match set invalidates the current position — restart at the
  // first match rather than pointing at a stale/out-of-range index.
  useEffect(() => {
    setCurrentIndex(0);
  }, [matches]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (matches.length === 0 ? 0 : (prev + 1) % matches.length));
  }, [matches.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (matches.length === 0 ? 0 : (prev - 1 + matches.length) % matches.length));
  }, [matches.length]);

  const currentMatch = matches.length > 0 ? matches[currentIndex % matches.length] : null;

  const matchesByRowId = useMemo(() => {
    const map = new Map<string, SearchMatch[]>();
    for (const match of matches) {
      const existing = map.get(match.rowId);
      if (existing) existing.push(match);
      else map.set(match.rowId, [match]);
    }
    return map;
  }, [matches]);

  return {
    query,
    setQuery,
    isRegex,
    setIsRegex,
    scopeToChanges,
    setScopeToChanges,
    matches,
    matchesByRowId,
    error,
    currentIndex,
    currentMatch,
    matchCount: matches.length,
    goToNext,
    goToPrevious,
    isActive: query.trim().length > 0,
  };
}
