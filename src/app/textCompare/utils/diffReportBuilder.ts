import { DiffResult, DiffStatistics, DiffType } from '../models/DiffModels';

/**
 * Builds the plain-text diff report shared by the Export (download) and Copy Diff
 * actions. `now` is injected so the timestamp line stays testable.
 */
export function buildDiffReport(diffResult: DiffResult, statistics: DiffStatistics, now: Date = new Date()): string {
  const leftLines = diffResult.left
    .filter((l) => l.type !== DiffType.PLACEHOLDER)
    .map((l) => {
      const prefix = l.type === DiffType.REMOVED ? '-' : l.type === DiffType.CHANGED ? '~' : ' ';
      return `${prefix} ${l.text}`;
    });
  const rightLines = diffResult.right
    .filter((l) => l.type !== DiffType.PLACEHOLDER)
    .map((l) => {
      const prefix = l.type === DiffType.ADDED ? '+' : l.type === DiffType.CHANGED ? '~' : ' ';
      return `${prefix} ${l.text}`;
    });

  return [
    '=== Text Compare Report ===',
    `Date: ${now.toISOString()}`,
    `Similarity: ${statistics.similarity.toFixed(1)}%`,
    `Added: ${statistics.changes.added}, Removed: ${statistics.changes.removed}, Modified: ${statistics.changes.modified}`,
    '',
    '--- Original ---',
    ...leftLines,
    '',
    '--- Modified ---',
    ...rightLines,
  ].join('\n');
}
