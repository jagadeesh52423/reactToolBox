// Cheap pre-check run on every keystroke before the (debounced) diff actually executes.
// Mirrors LineDiffAlgorithm's MAX_LCS_CELLS philosophy (bound the O(n*m) LCS table) but
// operates on raw line counts instead of the trimmed-middle length, since computing the
// real trim here would duplicate the algorithm's work on every keystroke.
export const AUTO_DIFF_LINE_PRODUCT_LIMIT = 1_000_000;

export function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}

/**
 * True when the input is large enough that live (debounced) diffing should be paused
 * in favor of an explicit manual "Compare" trigger.
 */
export function shouldPauseAutoDiff(
  leftText: string,
  rightText: string,
  limit: number = AUTO_DIFF_LINE_PRODUCT_LIMIT
): boolean {
  return countLines(leftText) * countLines(rightText) > limit;
}
