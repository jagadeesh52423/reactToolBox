import { ITextDiffAlgorithm } from './ITextDiffAlgorithm';
import { DiffResult, DiffLine, DiffType, DiffOptions } from '../models/DiffModels';
import { compileIgnorePattern } from '../utils/ignorePattern';
import { applyWhitespaceMode } from '../utils/whitespaceMode';

type LineDiffOp =
  | { type: 'equal'; leftIndex: number; rightIndex: number }
  | { type: 'delete'; leftIndex: number }
  | { type: 'insert'; rightIndex: number };

// Cap on the LCS DP table size (leftMiddle.length * rightMiddle.length), checked after
// trimming the common prefix/suffix. Beyond this the O(n*m) table becomes multi-second/OOM
// on large inputs — mirrors jsonCompare's MAX_LCS_CELLS guard for the same failure mode.
const MAX_LCS_CELLS = 1_000_000;

/**
 * Line-by-line diff algorithm using an LCS (longest common subsequence) alignment
 * Implements the Strategy pattern for text comparison
 */
export class LineDiffAlgorithm implements ITextDiffAlgorithm {
  public getName(): string {
    return 'Line-by-Line Diff';
  }

  public getDescription(): string {
    return 'Compares text line by line using an LCS alignment to correctly group multi-line insertions and deletions';
  }

  public computeDiff(leftText: string, rightText: string, options?: DiffOptions): DiffResult {
    const leftLines = this.preprocessLines(leftText, options);
    const rightLines = this.preprocessLines(rightText, options);

    // Trim the common prefix/suffix first so the O(n*m) LCS only runs on the part
    // that actually differs — the common case (a small edit in a large file) never
    // gets near the cap below.
    const prefixLength = this.commonPrefixLength(leftLines, rightLines, options);
    const suffixLength = this.commonSuffixLength(leftLines, rightLines, prefixLength, options);

    const leftMiddle = leftLines.slice(prefixLength, leftLines.length - suffixLength);
    const rightMiddle = rightLines.slice(prefixLength, rightLines.length - suffixLength);

    const result: DiffResult = {
      left: [],
      right: [],
    };

    for (let i = 0; i < prefixLength; i++) {
      result.left.push(this.createDiffLine(leftLines[i], DiffType.UNCHANGED, i + 1));
      result.right.push(this.createDiffLine(rightLines[i], DiffType.UNCHANGED, i + 1));
    }

    if (leftMiddle.length * rightMiddle.length > MAX_LCS_CELLS) {
      this.appendPositionalFallback(result, leftMiddle, rightMiddle, prefixLength);
      result.notice =
        'Inputs too large for a precise diff — showing a simplified line-by-line comparison instead.';
    } else {
      this.appendLcsDiff(result, leftMiddle, rightMiddle, prefixLength, options);
    }

    const leftSuffixStart = leftLines.length - suffixLength;
    const rightSuffixStart = rightLines.length - suffixLength;
    for (let i = 0; i < suffixLength; i++) {
      result.left.push(this.createDiffLine(leftLines[leftSuffixStart + i], DiffType.UNCHANGED, leftSuffixStart + i + 1));
      result.right.push(this.createDiffLine(rightLines[rightSuffixStart + i], DiffType.UNCHANGED, rightSuffixStart + i + 1));
    }

    return result;
  }

  /**
   * Appends an LCS-aligned diff of the (already prefix/suffix-trimmed) middle section.
   * `lineOffset` is the number of trimmed prefix lines, used to recover real line numbers.
   */
  private appendLcsDiff(
    result: DiffResult,
    leftMiddle: string[],
    rightMiddle: string[],
    lineOffset: number,
    options?: DiffOptions
  ): void {
    const ops = this.computeLineDiffOps(leftMiddle, rightMiddle, options);

    let opIndex = 0;
    while (opIndex < ops.length) {
      const op = ops[opIndex];

      if (op.type === 'equal') {
        result.left.push(
          this.createDiffLine(leftMiddle[op.leftIndex], DiffType.UNCHANGED, lineOffset + op.leftIndex + 1)
        );
        result.right.push(
          this.createDiffLine(rightMiddle[op.rightIndex], DiffType.UNCHANGED, lineOffset + op.rightIndex + 1)
        );
        opIndex++;
        continue;
      }

      // Gather the contiguous run of deletes/inserts between two equal lines into one hunk,
      // then pair them up as CHANGED rows so multi-line edits still align side by side.
      const deletedIndices: number[] = [];
      const insertedIndices: number[] = [];
      while (opIndex < ops.length && ops[opIndex].type !== 'equal') {
        const hunkOp = ops[opIndex];
        if (hunkOp.type === 'delete') {
          deletedIndices.push(hunkOp.leftIndex);
        } else if (hunkOp.type === 'insert') {
          insertedIndices.push(hunkOp.rightIndex);
        }
        opIndex++;
      }

      const pairedCount = Math.min(deletedIndices.length, insertedIndices.length);

      for (let k = 0; k < pairedCount; k++) {
        result.left.push(
          this.createDiffLine(leftMiddle[deletedIndices[k]], DiffType.CHANGED, lineOffset + deletedIndices[k] + 1)
        );
        result.right.push(
          this.createDiffLine(rightMiddle[insertedIndices[k]], DiffType.CHANGED, lineOffset + insertedIndices[k] + 1)
        );
      }

      for (let k = pairedCount; k < deletedIndices.length; k++) {
        result.left.push(
          this.createDiffLine(leftMiddle[deletedIndices[k]], DiffType.REMOVED, lineOffset + deletedIndices[k] + 1)
        );
        result.right.push(this.createDiffLine('', DiffType.PLACEHOLDER, 0));
      }

      for (let k = pairedCount; k < insertedIndices.length; k++) {
        result.left.push(this.createDiffLine('', DiffType.PLACEHOLDER, 0));
        result.right.push(
          this.createDiffLine(rightMiddle[insertedIndices[k]], DiffType.ADDED, lineOffset + insertedIndices[k] + 1)
        );
      }
    }
  }

  /**
   * Degraded fallback for middles too large for the O(n*m) LCS table: pairs lines by
   * position instead of aligning them, trading precision for a bounded (O(n)) cost.
   */
  private appendPositionalFallback(
    result: DiffResult,
    leftMiddle: string[],
    rightMiddle: string[],
    lineOffset: number
  ): void {
    const pairedCount = Math.min(leftMiddle.length, rightMiddle.length);

    for (let k = 0; k < pairedCount; k++) {
      result.left.push(this.createDiffLine(leftMiddle[k], DiffType.CHANGED, lineOffset + k + 1));
      result.right.push(this.createDiffLine(rightMiddle[k], DiffType.CHANGED, lineOffset + k + 1));
    }
    for (let k = pairedCount; k < leftMiddle.length; k++) {
      result.left.push(this.createDiffLine(leftMiddle[k], DiffType.REMOVED, lineOffset + k + 1));
      result.right.push(this.createDiffLine('', DiffType.PLACEHOLDER, 0));
    }
    for (let k = pairedCount; k < rightMiddle.length; k++) {
      result.left.push(this.createDiffLine('', DiffType.PLACEHOLDER, 0));
      result.right.push(this.createDiffLine(rightMiddle[k], DiffType.ADDED, lineOffset + k + 1));
    }
  }

  /**
   * Length of the run of lines both texts start with (in original, untrimmed order).
   */
  private commonPrefixLength(leftLines: string[], rightLines: string[], options?: DiffOptions): number {
    const max = Math.min(leftLines.length, rightLines.length);
    let i = 0;
    while (i < max && this.linesEqual(leftLines[i], rightLines[i], options)) i++;
    return i;
  }

  /**
   * Length of the run of lines both texts end with, not overlapping the prefix.
   */
  private commonSuffixLength(
    leftLines: string[],
    rightLines: string[],
    prefixLength: number,
    options?: DiffOptions
  ): number {
    const max = Math.min(leftLines.length, rightLines.length) - prefixLength;
    let i = 0;
    while (
      i < max &&
      this.linesEqual(leftLines[leftLines.length - 1 - i], rightLines[rightLines.length - 1 - i], options)
    ) {
      i++;
    }
    return i;
  }

  /**
   * Computes an LCS-based alignment between the two line arrays, expressed as a
   * sequence of equal/delete/insert operations in left-to-right order.
   */
  private computeLineDiffOps(
    leftLines: string[],
    rightLines: string[],
    options?: DiffOptions
  ): LineDiffOp[] {
    const leftCount = leftLines.length;
    const rightCount = rightLines.length;

    // lcsLength[i][j] = length of the LCS of leftLines[i..) and rightLines[j..)
    const lcsLength: number[][] = Array.from({ length: leftCount + 1 }, () =>
      new Array<number>(rightCount + 1).fill(0)
    );

    for (let i = leftCount - 1; i >= 0; i--) {
      for (let j = rightCount - 1; j >= 0; j--) {
        lcsLength[i][j] = this.linesEqual(leftLines[i], rightLines[j], options)
          ? lcsLength[i + 1][j + 1] + 1
          : Math.max(lcsLength[i + 1][j], lcsLength[i][j + 1]);
      }
    }

    const ops: LineDiffOp[] = [];
    let i = 0;
    let j = 0;
    while (i < leftCount && j < rightCount) {
      if (this.linesEqual(leftLines[i], rightLines[j], options)) {
        ops.push({ type: 'equal', leftIndex: i, rightIndex: j });
        i++;
        j++;
      } else if (lcsLength[i + 1][j] >= lcsLength[i][j + 1]) {
        ops.push({ type: 'delete', leftIndex: i });
        i++;
      } else {
        ops.push({ type: 'insert', rightIndex: j });
        j++;
      }
    }
    while (i < leftCount) {
      ops.push({ type: 'delete', leftIndex: i });
      i++;
    }
    while (j < rightCount) {
      ops.push({ type: 'insert', rightIndex: j });
      j++;
    }

    return ops;
  }

  /**
   * Preprocesses lines based on options: strips text matching `ignorePattern` (when
   * it compiles), then normalizes whitespace, then case — in that order, so a
   * pattern that removes text (e.g. a timestamp) leaves whitespace for the
   * whitespace mode to clean up.
   */
  private preprocessLines(text: string, options?: DiffOptions): string[] {
    // Normalize CRLF/CR line endings to LF before splitting so content that is
    // byte-identical apart from line-ending style diffs as unchanged.
    const lines = text.replace(/\r\n?/g, '\n').split('\n');
    const { regex: ignoreRegex } = compileIgnorePattern(options?.ignorePattern, options?.ignoreCase);

    return lines.map((line) => {
      let processed = line;

      if (ignoreRegex) {
        ignoreRegex.lastIndex = 0;
        processed = processed.replace(ignoreRegex, '');
      }

      processed = applyWhitespaceMode(processed, options?.whitespaceMode ?? 'none');

      if (options?.ignoreCase) {
        processed = processed.toLowerCase();
      }

      return processed;
    });
  }

  /**
   * Checks if two lines are equal based on options. Inputs are always the
   * already-preprocessed lines from preprocessLines (ignorePattern/whitespace/case
   * already applied), so this re-application is a defensive no-op, not double-work
   * that changes the result.
   */
  private linesEqual(line1: string, line2: string, options?: DiffOptions): boolean {
    let l1 = applyWhitespaceMode(line1, options?.whitespaceMode ?? 'none');
    let l2 = applyWhitespaceMode(line2, options?.whitespaceMode ?? 'none');

    if (options?.ignoreCase) {
      l1 = l1.toLowerCase();
      l2 = l2.toLowerCase();
    }

    return l1 === l2;
  }

  /**
   * Creates a DiffLine object
   */
  private createDiffLine(text: string, type: DiffType, lineNumber: number): DiffLine {
    return { text, type, lineNumber };
  }
}
