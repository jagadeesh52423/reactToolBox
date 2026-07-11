// Best-effort bound, not a full ReDoS guarantee: a length cap on the pattern reduces
// the worst-case backtracking surface. Full protection would need a worker + timeout
// (as regexTester does for full-document matching); this pattern only ever runs
// per-line during preprocessing, so the blast radius of a slow pattern is one line,
// not the whole document.
export const MAX_IGNORE_PATTERN_LENGTH = 200;

export interface CompiledIgnorePattern {
  regex: RegExp | null;
  error: string | null;
}

/**
 * Compiles the user-supplied "ignore text matching this pattern" field into a global,
 * unicode-aware RegExp. Never throws — an empty/undefined pattern disables the
 * feature (regex: null, error: null); an invalid or oversized pattern also disables
 * it but reports why via `error`, so the diff still runs (fail-open) while the UI can
 * surface the problem inline.
 */
export function compileIgnorePattern(pattern: string | undefined, ignoreCase: boolean | undefined): CompiledIgnorePattern {
  if (!pattern) return { regex: null, error: null };
  if (pattern.length > MAX_IGNORE_PATTERN_LENGTH) {
    return { regex: null, error: `Pattern too long (max ${MAX_IGNORE_PATTERN_LENGTH} characters)` };
  }
  try {
    const flags = ignoreCase ? 'gui' : 'gu';
    return { regex: new RegExp(pattern, flags), error: null };
  } catch (err) {
    return { regex: null, error: err instanceof Error ? err.message : 'Invalid pattern' };
  }
}
