/**
 * Interface for text case conversion strategies
 * Follows the Strategy Pattern to allow different conversion algorithms
 */
export interface ITextCaseStrategy {
  /**
   * Converts the input text according to the specific case strategy
   * @param text - The input text to convert
   * @returns The converted text
   */
  convert(text: string): string;

  /**
   * Gets the name of this strategy
   */
  getName(): string;

  /**
   * Gets an example of the output format
   */
  getExample(): string;

  /**
   * Gets a description of what this strategy does
   */
  getDescription(): string;
}
