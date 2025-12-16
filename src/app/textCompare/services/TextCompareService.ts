import { ITextDiffAlgorithm } from '../algorithms/ITextDiffAlgorithm';
import { LineDiffAlgorithm } from '../algorithms/LineDiffAlgorithm';
import { WordDiffProcessor } from '../algorithms/WordDiffProcessor';
import { DiffResult, DiffStatistics, DiffOptions, WordDiffResult, DiffType } from '../models/DiffModels';

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
    return this.diffAlgorithm.computeDiff(leftText, rightText, options);
  }

  /**
   * Computes word-level diff for a pair of lines
   */
  public compareWords(leftLine: string, rightLine: string): WordDiffResult {
    return this.wordDiffProcessor.computeWordDiff(leftLine, rightLine);
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

    const totalChanges = added + removed + modified;
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
