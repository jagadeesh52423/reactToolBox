import { useState, useMemo, useCallback } from 'react';
import { JSONValue, JsonPath, JsonValueType, PathSuggestion } from '../models/JsonModels';
import { getJsonMutationService } from '../services/JsonMutationService';
import { getJsonParserService } from '../services/JsonParserService';

export interface UseNavigateReturn {
  navigateText: string;
  setNavigateText: (text: string) => void;
  suggestions: PathSuggestion[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  moveUp: () => void;
  moveDown: () => void;
}

function getValueType(value: JSONValue): JsonValueType {
  if (value === null) return JsonValueType.NULL;
  if (Array.isArray(value)) return JsonValueType.ARRAY;
  switch (typeof value) {
    case 'string': return JsonValueType.STRING;
    case 'number': return JsonValueType.NUMBER;
    case 'boolean': return JsonValueType.BOOLEAN;
    case 'object': return JsonValueType.OBJECT;
    default: return JsonValueType.UNKNOWN;
  }
}

function truncate(s: string, max: number = 40): string {
  return s.length > max ? s.slice(0, max) + '...' : s;
}

function getAllPaths(data: JSONValue, path: JsonPath = []): PathSuggestion[] {
  const results: PathSuggestion[] = [];
  if (data === null || typeof data !== 'object') return results;

  const entries = Object.entries(data as Record<string, JSONValue>);
  for (const [key, value] of entries) {
    const childPath = [...path, key];
    const type = getValueType(value);
    const pathString = childPath.join('.');
    let preview: string | undefined;
    if (type !== JsonValueType.OBJECT && type !== JsonValueType.ARRAY) {
      preview = truncate(String(value));
    } else if (type === JsonValueType.ARRAY) {
      preview = `[${(value as JSONValue[]).length} items]`;
    } else {
      preview = `{${Object.keys(value as Record<string, JSONValue>).length} keys}`;
    }
    results.push({ path: childPath, pathString, type, preview });
    // Recurse into children
    results.push(...getAllPaths(value, childPath));
  }
  return results;
}

/** Fuzzy subsequence match: does every char of pattern appear in order in target? */
function subsequenceMatch(pattern: string, target: string): boolean {
  let pi = 0;
  for (let ti = 0; ti < target.length && pi < pattern.length; ti++) {
    if (pattern[pi].toLowerCase() === target[ti].toLowerCase()) pi++;
  }
  return pi === pattern.length;
}

/** Score a match: lower = better. prefix > subsequence > levenshtein */
function scoreMatch(segment: string, key: string): number {
  const seg = segment.toLowerCase();
  const k = key.toLowerCase();
  if (k.startsWith(seg)) return 0; // prefix match — best
  if (subsequenceMatch(seg, k)) return 1; // subsequence — medium
  // Levenshtein distance as last resort
  return 2 + levenshtein(seg, k);
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function segmentMatches(segment: string, key: string): boolean {
  if (!segment) return true;
  const seg = segment.toLowerCase();
  const k = key.toLowerCase();
  // prefix or subsequence
  if (k.startsWith(seg)) return true;
  if (subsequenceMatch(seg, k)) return true;
  // Levenshtein: allow distance up to 40% of segment length
  const threshold = Math.max(1, Math.floor(seg.length * 0.4));
  return levenshtein(seg, k) <= threshold;
}

export function useNavigate(data: JSONValue | null): UseNavigateReturn {
  const [navigateText, setNavigateText] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allPaths = useMemo(() => {
    if (!data) return [];
    return getAllPaths(data);
  }, [data]);

  const suggestions = useMemo(() => {
    if (!data) return [];

    const input = navigateText.trim();

    // Empty input → show top-level keys only
    if (!input) {
      return allPaths.filter(p => p.path.length === 1);
    }

    // Trailing dot → show children of matched prefix
    const hasTrailingDot = navigateText.endsWith('.');
    const segments = input.split('.');

    if (hasTrailingDot) {
      // Find exact parent path and show its children
      const parentSegments = segments.filter(s => s.length > 0);
      // Find paths whose parent matches
      return allPaths.filter(p => {
        if (p.path.length !== parentSegments.length + 1) return false;
        // All parent segments must match exactly
        for (let i = 0; i < parentSegments.length; i++) {
          if (!segmentMatches(parentSegments[i], p.path[i])) return false;
        }
        return true;
      }).sort((a, b) => a.pathString.localeCompare(b.pathString));
    }

    // Fuzzy match per segment
    const matched = allPaths.filter(p => {
      // Path must have at least as many segments as input
      if (p.path.length < segments.length) return false;
      // Match each input segment against corresponding path level
      for (let i = 0; i < segments.length; i++) {
        if (!segmentMatches(segments[i], p.path[i])) return false;
      }
      return true;
    });

    // Score and sort
    matched.sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      for (let i = 0; i < segments.length; i++) {
        scoreA += scoreMatch(segments[i], a.path[i]);
        scoreB += scoreMatch(segments[i], b.path[i]);
      }
      // Prefer shorter paths (more specific matches)
      scoreA += a.path.length * 0.1;
      scoreB += b.path.length * 0.1;
      return scoreA - scoreB;
    });

    return matched.slice(0, 50); // cap for performance
  }, [data, navigateText, allPaths]);

  // Reset selection when suggestions change
  const setNavigateTextAndReset = useCallback((text: string) => {
    setNavigateText(text);
    setSelectedIndex(0);
  }, []);

  const moveUp = useCallback(() => {
    setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
  }, [suggestions.length]);

  const moveDown = useCallback(() => {
    setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
  }, [suggestions.length]);

  return {
    navigateText,
    setNavigateText: setNavigateTextAndReset,
    suggestions,
    selectedIndex,
    setSelectedIndex,
    moveUp,
    moveDown,
  };
}
