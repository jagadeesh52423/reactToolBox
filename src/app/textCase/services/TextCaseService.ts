import { TextCaseStrategyFactory } from '../factories/TextCaseStrategyFactory';
import { TextCaseType, TextCaseOption, TextStats } from '../models/TextCaseType';
import { ITextCaseStrategy } from '../strategies/ITextCaseStrategy';

/**
 * Service class for text case conversion operations
 * Follows the Service Layer pattern to encapsulate business logic
 *
 * This class acts as a facade for the text case conversion functionality,
 * coordinating between strategies and providing a simple interface for the UI
 */
export class TextCaseService {
  private factory: TextCaseStrategyFactory;
  private currentStrategy: ITextCaseStrategy | null;

  constructor() {
    this.factory = TextCaseStrategyFactory.getInstance();
    this.currentStrategy = null;
  }

  /**
   * Converts text using the specified case type
   * @param text - The input text to convert
   * @param caseType - The desired case type
   * @returns The converted text
   */
  public convertText(text: string, caseType: TextCaseType): string {
    if (!text) {
      return '';
    }

    this.currentStrategy = this.factory.createStrategy(caseType);
    return this.currentStrategy.convert(text);
  }

  /**
   * Gets all available text case options for the UI
   * @returns Array of text case options
   */
  public getAvailableOptions(): TextCaseOption[] {
    const strategies = this.factory.getAllStrategies();

    return strategies.map(strategy => ({
      type: this.getTypeFromName(strategy.getName()),
      label: strategy.getName(),
      example: strategy.getExample(),
      description: strategy.getDescription(),
    }));
  }

  /**
   * Calculates statistics for the given text
   * @param text - The text to analyze
   * @returns Text statistics
   */
  public calculateStats(text: string): TextStats {
    const characterCount = text.length;
    const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
    const lineCount = text.split('\n').length;

    return {
      characterCount,
      wordCount,
      lineCount,
    };
  }

  /**
   * Validates if the given case type is supported
   * @param caseType - The case type to validate
   * @returns True if supported, false otherwise
   */
  public isValidCaseType(caseType: TextCaseType): boolean {
    return this.factory.hasStrategy(caseType);
  }

  /**
   * Gets the current strategy being used
   * @returns The current strategy or null if none is set
   */
  public getCurrentStrategy(): ITextCaseStrategy | null {
    return this.currentStrategy;
  }

  /**
   * Helper method to map strategy name to TextCaseType enum
   * This is a workaround since we can't easily reverse-map from name to enum
   */
  private getTypeFromName(name: string): TextCaseType {
    const mapping: Record<string, TextCaseType> = {
      'UPPERCASE': TextCaseType.UPPERCASE,
      'lowercase': TextCaseType.LOWERCASE,
      'Title Case': TextCaseType.TITLE_CASE,
      'Sentence case': TextCaseType.SENTENCE_CASE,
      'camelCase': TextCaseType.CAMEL_CASE,
      'PascalCase': TextCaseType.PASCAL_CASE,
      'snake_case': TextCaseType.SNAKE_CASE,
      'kebab-case': TextCaseType.KEBAB_CASE,
      'CONSTANT_CASE': TextCaseType.CONSTANT_CASE,
      'dot.case': TextCaseType.DOT_CASE,
      'path/case': TextCaseType.PATH_CASE,
      'aLtErNaTiNg CaSe': TextCaseType.ALTERNATING_CASE,
      'Inverse Case': TextCaseType.INVERSE_CASE,
    };

    return mapping[name] || TextCaseType.UPPERCASE;
  }
}
