import { ITextCaseStrategy } from '../strategies/ITextCaseStrategy';
import { AlternatingCaseStrategy } from '../strategies/AlternatingCaseStrategy';
import { CamelCaseStrategy } from '../strategies/CamelCaseStrategy';
import { ConstantCaseStrategy } from '../strategies/ConstantCaseStrategy';
import { DotCaseStrategy } from '../strategies/DotCaseStrategy';
import { InverseCaseStrategy } from '../strategies/InverseCaseStrategy';
import { KebabCaseStrategy } from '../strategies/KebabCaseStrategy';
import { LowerCaseStrategy } from '../strategies/LowerCaseStrategy';
import { PascalCaseStrategy } from '../strategies/PascalCaseStrategy';
import { PathCaseStrategy } from '../strategies/PathCaseStrategy';
import { SentenceCaseStrategy } from '../strategies/SentenceCaseStrategy';
import { SnakeCaseStrategy } from '../strategies/SnakeCaseStrategy';
import { TitleCaseStrategy } from '../strategies/TitleCaseStrategy';
import { UpperCaseStrategy } from '../strategies/UpperCaseStrategy';
import { TextCaseType } from '../models/TextCaseType';

/**
 * Factory class for creating text case strategy instances
 * Implements the Factory Pattern to encapsulate strategy creation logic
 *
 * This class follows the Singleton pattern to ensure only one instance exists
 * and uses lazy initialization for strategy instances
 */
export class TextCaseStrategyFactory {
  private static instance: TextCaseStrategyFactory;
  private strategyCache: Map<TextCaseType, ITextCaseStrategy>;

  private constructor() {
    this.strategyCache = new Map();
    this.initializeStrategies();
  }

  /**
   * Gets the singleton instance of the factory
   */
  public static getInstance(): TextCaseStrategyFactory {
    if (!TextCaseStrategyFactory.instance) {
      TextCaseStrategyFactory.instance = new TextCaseStrategyFactory();
    }
    return TextCaseStrategyFactory.instance;
  }

  /**
   * Initializes all available strategies
   * Using a cache to avoid creating new instances every time
   */
  private initializeStrategies(): void {
    this.strategyCache.set(TextCaseType.UPPERCASE, new UpperCaseStrategy());
    this.strategyCache.set(TextCaseType.LOWERCASE, new LowerCaseStrategy());
    this.strategyCache.set(TextCaseType.TITLE_CASE, new TitleCaseStrategy());
    this.strategyCache.set(TextCaseType.SENTENCE_CASE, new SentenceCaseStrategy());
    this.strategyCache.set(TextCaseType.CAMEL_CASE, new CamelCaseStrategy());
    this.strategyCache.set(TextCaseType.PASCAL_CASE, new PascalCaseStrategy());
    this.strategyCache.set(TextCaseType.SNAKE_CASE, new SnakeCaseStrategy());
    this.strategyCache.set(TextCaseType.KEBAB_CASE, new KebabCaseStrategy());
    this.strategyCache.set(TextCaseType.CONSTANT_CASE, new ConstantCaseStrategy());
    this.strategyCache.set(TextCaseType.DOT_CASE, new DotCaseStrategy());
    this.strategyCache.set(TextCaseType.PATH_CASE, new PathCaseStrategy());
    this.strategyCache.set(TextCaseType.ALTERNATING_CASE, new AlternatingCaseStrategy());
    this.strategyCache.set(TextCaseType.INVERSE_CASE, new InverseCaseStrategy());
  }

  /**
   * Creates and returns a strategy instance for the given text case type
   * @param caseType - The type of case conversion strategy needed
   * @returns The strategy instance
   * @throws Error if the case type is not supported
   */
  public createStrategy(caseType: TextCaseType): ITextCaseStrategy {
    const strategy = this.strategyCache.get(caseType);

    if (!strategy) {
      throw new Error(`Unsupported text case type: ${caseType}`);
    }

    return strategy;
  }

  /**
   * Gets all available strategies
   * @returns Array of all strategy instances
   */
  public getAllStrategies(): ITextCaseStrategy[] {
    return Array.from(this.strategyCache.values());
  }

  /**
   * Checks if a strategy exists for the given case type
   * @param caseType - The case type to check
   * @returns True if the strategy exists, false otherwise
   */
  public hasStrategy(caseType: TextCaseType): boolean {
    return this.strategyCache.has(caseType);
  }
}
