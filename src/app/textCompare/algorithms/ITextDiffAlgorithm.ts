import { DiffResult, DiffOptions } from '../models/DiffModels';

/**
 * Interface for text diff algorithms
 * Follows the Strategy Pattern to allow different diff implementations
 */
export interface ITextDiffAlgorithm {
  /**
   * Computes the difference between two texts
   * @param leftText - The original text
   * @param rightText - The modified text
   * @param options - Optional diff options
   * @returns The diff result
   */
  computeDiff(leftText: string, rightText: string, options?: DiffOptions): DiffResult;

  /**
   * Gets the name of this algorithm
   */
  getName(): string;

  /**
   * Gets a description of this algorithm
   */
  getDescription(): string;
}
