/**
 * Enum for diff line types
 */
export enum DiffType {
  ADDED = 'added',
  REMOVED = 'removed',
  CHANGED = 'changed',
  UNCHANGED = 'unchanged',
  PLACEHOLDER = 'placeholder',
}

/**
 * Model representing a line in the diff result
 */
export interface DiffLine {
  text: string;
  type: DiffType;
  lineNumber: number;
}

/**
 * Model representing the complete diff result
 */
export interface DiffResult {
  left: DiffLine[];
  right: DiffLine[];
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
  };
  similarity: number; // Percentage 0-100
}

/**
 * Model for diff options
 */
export interface DiffOptions {
  ignoreWhitespace?: boolean;
  ignoreCase?: boolean;
  contextLines?: number;
}
