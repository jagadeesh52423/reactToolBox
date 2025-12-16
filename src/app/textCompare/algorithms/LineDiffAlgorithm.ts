import { ITextDiffAlgorithm } from './ITextDiffAlgorithm';
import { DiffResult, DiffLine, DiffType, DiffOptions } from '../models/DiffModels';

/**
 * Line-by-line diff algorithm with look-ahead optimization
 * Implements the Strategy pattern for text comparison
 */
export class LineDiffAlgorithm implements ITextDiffAlgorithm {
  public getName(): string {
    return 'Line-by-Line Diff';
  }

  public getDescription(): string {
    return 'Compares text line by line with smart look-ahead for insertions and deletions';
  }

  public computeDiff(leftText: string, rightText: string, options?: DiffOptions): DiffResult {
    const leftLines = this.preprocessLines(leftText, options);
    const rightLines = this.preprocessLines(rightText, options);

    const result: DiffResult = {
      left: [],
      right: [],
    };

    let i = 0;
    let j = 0;

    while (i < leftLines.length || j < rightLines.length) {
      if (i < leftLines.length && j < rightLines.length) {
        if (this.linesEqual(leftLines[i], rightLines[j], options)) {
          // Lines are identical
          result.left.push(this.createDiffLine(leftLines[i], DiffType.UNCHANGED, i + 1));
          result.right.push(this.createDiffLine(rightLines[j], DiffType.UNCHANGED, j + 1));
          i++;
          j++;
        } else {
          // Lines are different - use look-ahead to detect insertions/deletions
          const isRemoval = this.detectRemoval(leftLines, rightLines, i, j);
          const isAddition = this.detectAddition(leftLines, rightLines, i, j);

          if (isRemoval) {
            // Left line was removed
            result.left.push(this.createDiffLine(leftLines[i], DiffType.REMOVED, i + 1));
            result.right.push(this.createDiffLine('', DiffType.PLACEHOLDER, 0));
            i++;
          } else if (isAddition) {
            // Right line was added
            result.left.push(this.createDiffLine('', DiffType.PLACEHOLDER, 0));
            result.right.push(this.createDiffLine(rightLines[j], DiffType.ADDED, j + 1));
            j++;
          } else {
            // Lines are modified
            result.left.push(this.createDiffLine(leftLines[i], DiffType.CHANGED, i + 1));
            result.right.push(this.createDiffLine(rightLines[j], DiffType.CHANGED, j + 1));
            i++;
            j++;
          }
        }
      } else if (i < leftLines.length) {
        // Only left has remaining lines (all removed)
        result.left.push(this.createDiffLine(leftLines[i], DiffType.REMOVED, i + 1));
        result.right.push(this.createDiffLine('', DiffType.PLACEHOLDER, 0));
        i++;
      } else {
        // Only right has remaining lines (all added)
        result.left.push(this.createDiffLine('', DiffType.PLACEHOLDER, 0));
        result.right.push(this.createDiffLine(rightLines[j], DiffType.ADDED, j + 1));
        j++;
      }
    }

    return result;
  }

  /**
   * Preprocesses lines based on options
   */
  private preprocessLines(text: string, options?: DiffOptions): string[] {
    const lines = text.split('\n');

    return lines.map((line) => {
      let processed = line;

      if (options?.ignoreWhitespace) {
        processed = processed.trim();
      }

      if (options?.ignoreCase) {
        processed = processed.toLowerCase();
      }

      return processed;
    });
  }

  /**
   * Checks if two lines are equal based on options
   */
  private linesEqual(line1: string, line2: string, options?: DiffOptions): boolean {
    let l1 = line1;
    let l2 = line2;

    if (options?.ignoreWhitespace) {
      l1 = l1.trim();
      l2 = l2.trim();
    }

    if (options?.ignoreCase) {
      l1 = l1.toLowerCase();
      l2 = l2.toLowerCase();
    }

    return l1 === l2;
  }

  /**
   * Detects if the current left line was removed (look-ahead check)
   */
  private detectRemoval(
    leftLines: string[],
    rightLines: string[],
    i: number,
    j: number
  ): boolean {
    return i + 1 < leftLines.length && leftLines[i + 1] === rightLines[j];
  }

  /**
   * Detects if the current right line was added (look-ahead check)
   */
  private detectAddition(
    leftLines: string[],
    rightLines: string[],
    i: number,
    j: number
  ): boolean {
    return j + 1 < rightLines.length && leftLines[i] === rightLines[j + 1];
  }

  /**
   * Creates a DiffLine object
   */
  private createDiffLine(text: string, type: DiffType, lineNumber: number): DiffLine {
    return { text, type, lineNumber };
  }
}
