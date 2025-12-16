import { HTMLToken, FormatOptions } from '../models/HTMLToken';

/**
 * Interface for HTML formatting strategies
 * Allows different formatting approaches (compact, standard, expanded)
 */
export interface IHTMLFormatter {
  /**
   * Formats an array of HTML tokens into a formatted string
   * @param tokens - Array of HTML tokens
   * @param options - Formatting options
   * @returns Formatted HTML string
   */
  format(tokens: HTMLToken[], options: FormatOptions): string;

  /**
   * Gets the name of this formatter
   */
  getName(): string;
}
