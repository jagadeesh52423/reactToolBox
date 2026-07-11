import { DiffGranularity, DiffResult, DiffType, WordDiff } from '../models/DiffModels';

export interface UnifiedDiffRow {
  key: string;
  type: DiffType.UNCHANGED | DiffType.ADDED | DiffType.REMOVED;
  text: string;
  oldLineNumber?: number;
  newLineNumber?: number;
  wordDiff?: WordDiff[];
}

interface WordDiffComparer {
  compareWords(leftLine: string, rightLine: string, granularity?: DiffGranularity): { left: WordDiff[]; right: WordDiff[] };
}

/**
 * Flattens the side-by-side DiffResult (left/right arrays aligned by index, with a
 * PLACEHOLDER row on the opposite side of a pure add/remove) into a single ordered
 * list of unified-diff rows. A CHANGED pair becomes two rows (old-as-removed,
 * new-as-added) so word-level highlighting still applies to each.
 */
export function buildUnifiedDiffRows(
  diffResult: DiffResult,
  compareService: WordDiffComparer,
  granularity?: DiffGranularity
): UnifiedDiffRow[] {
  const rows: UnifiedDiffRow[] = [];
  const { left, right } = diffResult;
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index++) {
    const leftLine = left[index];
    const rightLine = right[index];
    if (!leftLine || !rightLine) continue;

    if (leftLine.type === DiffType.UNCHANGED && rightLine.type === DiffType.UNCHANGED) {
      rows.push({
        key: `unchanged-${index}`,
        type: DiffType.UNCHANGED,
        text: leftLine.text,
        oldLineNumber: leftLine.lineNumber,
        newLineNumber: rightLine.lineNumber,
      });
    } else if (leftLine.type === DiffType.CHANGED && rightLine.type === DiffType.CHANGED) {
      const wordDiff = compareService.compareWords(leftLine.text, rightLine.text, granularity);
      rows.push({
        key: `changed-old-${index}`,
        type: DiffType.REMOVED,
        text: leftLine.text,
        oldLineNumber: leftLine.lineNumber,
        wordDiff: wordDiff.left,
      });
      rows.push({
        key: `changed-new-${index}`,
        type: DiffType.ADDED,
        text: rightLine.text,
        newLineNumber: rightLine.lineNumber,
        wordDiff: wordDiff.right,
      });
    } else if (leftLine.type === DiffType.REMOVED) {
      rows.push({
        key: `removed-${index}`,
        type: DiffType.REMOVED,
        text: leftLine.text,
        oldLineNumber: leftLine.lineNumber,
      });
    } else if (rightLine.type === DiffType.ADDED) {
      rows.push({
        key: `added-${index}`,
        type: DiffType.ADDED,
        text: rightLine.text,
        newLineNumber: rightLine.lineNumber,
      });
    }
  }

  return rows;
}
