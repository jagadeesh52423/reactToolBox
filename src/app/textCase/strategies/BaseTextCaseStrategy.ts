import { ITextCaseStrategy } from './ITextCaseStrategy';

/**
 * Abstract base class for text case strategies
 * Provides common functionality for all strategies
 */
export abstract class BaseTextCaseStrategy implements ITextCaseStrategy {
  constructor(
    protected readonly name: string,
    protected readonly example: string,
    protected readonly description: string
  ) {}

  abstract convert(text: string): string;

  getName(): string {
    return this.name;
  }

  getExample(): string {
    return this.example;
  }

  getDescription(): string {
    return this.description;
  }

  /**
   * Helper method to split text into words
   * Handles various delimiters and camelCase
   */
  protected splitIntoWords(text: string): string[] {
    return text
      .replace(/([a-z])([A-Z])/g, '$1 $2') // Split camelCase
      .split(/[\s\-_./]+/) // Split on delimiters
      .filter(word => word.length > 0);
  }

  /**
   * Helper method to remove special characters
   */
  protected removeSpecialChars(text: string): string {
    return text.replace(/[^a-zA-Z0-9\s]/g, '');
  }
}
