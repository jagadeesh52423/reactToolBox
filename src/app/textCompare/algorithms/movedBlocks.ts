import { DiffLine, DiffResult, DiffType } from '../models/DiffModels';

/**
 * Post-processes a computed DiffResult to reclassify content-identical REMOVED/ADDED
 * line pairs as MOVED. Deliberately a separate pass over the LCS algorithm's output
 * rather than a change to LineDiffAlgorithm itself — moved-detection is opt-in and
 * orthogonal to alignment, so it stays out of the core algorithm entirely (Open/Closed).
 *
 * Matching is on `line.text`, which LineDiffAlgorithm already preprocesses per the
 * active whitespaceMode/ignoreCase/ignorePattern options — so this function inherits
 * "respect the compare options" for free without re-implementing any of them.
 *
 * Duplicate-safe: a per-text FIFO queue of REMOVED indices is built first, then each
 * ADDED line (in document order) consumes at most one queued REMOVED index with the
 * same text. "foo" removed twice + added once matches exactly one pair — the earlier
 * removed "foo" — leaving the second REMOVED untouched; never double-counts a line on
 * either side since each index is written into the result at most once.
 *
 * Blank/whitespace-only lines are excluded from matching — pairing every reshuffled
 * blank separator line as "moved" would be noisy and isn't what a user means by it.
 */
export function detectMovedLines(diffResult: DiffResult): DiffResult {
  const removedQueueByText = new Map<string, number[]>();
  diffResult.left.forEach((line, index) => {
    if (line.type !== DiffType.REMOVED || line.text.trim() === '') return;
    const queue = removedQueueByText.get(line.text);
    if (queue) queue.push(index);
    else removedQueueByText.set(line.text, [index]);
  });

  if (removedQueueByText.size === 0) return diffResult;

  const newLeft = diffResult.left.slice();
  const newRight = diffResult.right.slice();
  let matchedAny = false;

  diffResult.right.forEach((line, addedIndex) => {
    if (line.type !== DiffType.ADDED || line.text.trim() === '') return;
    const queue = removedQueueByText.get(line.text);
    if (!queue || queue.length === 0) return;

    const removedIndex = queue.shift() as number;
    const removedLine = diffResult.left[removedIndex];
    matchedAny = true;
    newLeft[removedIndex] = toMoved(removedLine, line.lineNumber);
    newRight[addedIndex] = toMoved(line, removedLine.lineNumber);
  });

  if (!matchedAny) return diffResult;
  return { ...diffResult, left: newLeft, right: newRight };
}

function toMoved(line: DiffLine, counterpartLineNumber: number): DiffLine {
  return { ...line, type: DiffType.MOVED, movedCounterpartLineNumber: counterpartLineNumber };
}
