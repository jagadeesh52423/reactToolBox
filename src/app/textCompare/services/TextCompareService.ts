import { ITextDiffAlgorithm } from '../algorithms/ITextDiffAlgorithm';
import { LineDiffAlgorithm } from '../algorithms/LineDiffAlgorithm';
import { WordDiffProcessor } from '../algorithms/WordDiffProcessor';
import { detectMovedLines } from '../algorithms/movedBlocks';
import { DiffResult, DiffStatistics, DiffOptions, DiffGranularity, WordDiffResult, DiffType } from '../models/DiffModels';

/**
 * Service class for text comparison operations
 * Implements the Facade pattern to provide a simple interface
 * Coordinates between diff algorithms and word-level processing
 */
export class TextCompareService {
  private diffAlgorithm: ITextDiffAlgorithm;
  private wordDiffProcessor: WordDiffProcessor;

  constructor(algorithm?: ITextDiffAlgorithm) {
    this.diffAlgorithm = algorithm || new LineDiffAlgorithm();
    this.wordDiffProcessor = new WordDiffProcessor();
  }

  /**
   * Compares two texts and returns diff result
   */
  public compareTexts(leftText: string, rightText: string, options?: DiffOptions): DiffResult {
    const result = this.diffAlgorithm.computeDiff(leftText, rightText, options);
    return options?.detectMoved ? detectMovedLines(result) : result;
  }

  /**
   * Computes inline diff for a pair of lines at the given granularity (default word)
   */
  public compareWords(leftLine: string, rightLine: string, granularity?: DiffGranularity): WordDiffResult {
    return this.wordDiffProcessor.computeWordDiff(leftLine, rightLine, granularity);
  }

  /**
   * Calculates statistics about the diff
   */
  public calculateStatistics(diffResult: DiffResult): DiffStatistics {
    const leftLines = diffResult.left.filter((line) => line.type !== DiffType.PLACEHOLDER);
    const rightLines = diffResult.right.filter((line) => line.type !== DiffType.PLACEHOLDER);

    const added = diffResult.right.filter((line) => line.type === DiffType.ADDED).length;
    const removed = diffResult.left.filter((line) => line.type === DiffType.REMOVED).length;
    const modified = diffResult.left.filter((line) => line.type === DiffType.CHANGED).length;
    const unchanged = diffResult.left.filter((line) => line.type === DiffType.UNCHANGED).length;
    // Counted from the left side only: each moved pair writes exactly one MOVED entry
    // per side (see detectMovedLines), so left- and right-side counts are always equal.
    const moved = diffResult.left.filter((line) => line.type === DiffType.MOVED).length;

    const totalLines = Math.max(leftLines.length, rightLines.length);
    const similarity = totalLines > 0 ? ((unchanged / totalLines) * 100) : 100;

    return {
      totalLines: {
        left: leftLines.length,
        right: rightLines.length,
      },
      changes: {
        added,
        removed,
        modified,
        unchanged,
        moved,
      },
      similarity: Math.round(similarity * 10) / 10, // Round to 1 decimal place
    };
  }

  /**
   * Sets a different diff algorithm
   */
  public setAlgorithm(algorithm: ITextDiffAlgorithm): void {
    this.diffAlgorithm = algorithm;
  }

  /**
   * Gets the current algorithm name
   */
  public getCurrentAlgorithmName(): string {
    return this.diffAlgorithm.getName();
  }
}
