/**
 * Enum for diff line types
 */
export enum DiffType {
  ADDED = 'added',
  REMOVED = 'removed',
  CHANGED = 'changed',
  UNCHANGED = 'unchanged',
  PLACEHOLDER = 'placeholder',
  /** A REMOVED/ADDED line that a post-process pass matched against an identical line
   * on the other side — relocated content rather than an independent add+remove. */
  MOVED = 'moved',
}

/**
 * Model representing a line in the diff result
 */
export interface DiffLine {
  text: string;
  type: DiffType;
  lineNumber: number;
  /** Set only when type is MOVED: the matching line's number on the other side. */
  movedCounterpartLineNumber?: number;
}

/**
 * Model representing the complete diff result
 */
export interface DiffResult {
  left: DiffLine[];
  right: DiffLine[];
  /** Set when the algorithm fell back to a degraded comparison (e.g. inputs too large to align precisely). */
  notice?: string;
}

/**
 * Model for word-level diff
 */
export interface WordDiff {
  text: string;
  type: 'unchanged' | 'changed';
}

/**
 * Model for word-level diff result
 */
export interface WordDiffResult {
  left: WordDiff[];
  right: WordDiff[];
}

/**
 * Model for diff statistics
 */
export interface DiffStatistics {
  totalLines: {
    left: number;
    right: number;
  };
  changes: {
    added: number;
    removed: number;
    modified: number;
    unchanged: number;
    /** Lines matched as relocated content (see DiffType.MOVED) — 0 unless detectMoved was on. */
    moved: number;
  };
  similarity: number; // Percentage 0-100
}

/**
 * Inline (within-line) diff granularity: whole words/punctuation, or individual characters.
 */
export type DiffGranularity = 'word' | 'char';

/**
 * Whitespace normalization applied to each line before comparison.
 * 'leadingAndTrailing' is the old boolean `ignoreWhitespace`'s behavior (trim()).
 */
export type WhitespaceMode = 'none' | 'leading' | 'trailing' | 'leadingAndTrailing' | 'all';

/**
 * Model for diff options
 */
export interface DiffOptions {
  whitespaceMode?: WhitespaceMode;
  ignoreCase?: boolean;
  contextLines?: number;
  granularity?: DiffGranularity;
  /** Regex applied per-line to strip matched text before comparison (e.g. timestamps, IDs). */
  ignorePattern?: string;
  /** Display-only: force all unchanged lines to fold regardless of contextLines. */
  diffOnly?: boolean;
  /** Post-process pass: reclassify content-identical REMOVED/ADDED line pairs as MOVED. */
  detectMoved?: boolean;
}

/**
 * Diff result layout: two columns side by side, or a single unified column.
 */
export type DiffViewMode = 'side-by-side' | 'unified';
