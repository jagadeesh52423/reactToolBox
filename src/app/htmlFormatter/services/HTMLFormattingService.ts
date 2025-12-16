import { HTMLTokenizer } from '../parsers/HTMLTokenizer';
import { IHTMLFormatter } from '../formatters/IHTMLFormatter';
import { IHTMLHighlighter } from '../highlighters/IHTMLHighlighter';
import { StandardHTMLFormatter } from '../formatters/StandardHTMLFormatter';
import { BasicHTMLHighlighter } from '../highlighters/BasicHTMLHighlighter';
import { FormatOptions } from '../models/HTMLToken';

/**
 * Service class for HTML formatting operations
 * Implements the Facade pattern to provide a simple interface
 * Coordinates between tokenizer, formatter, and highlighter
 */
export class HTMLFormattingService {
  private tokenizer: HTMLTokenizer;
  private formatter: IHTMLFormatter;
  private highlighter: IHTMLHighlighter;

  constructor(
    formatter?: IHTMLFormatter,
    highlighter?: IHTMLHighlighter
  ) {
    this.tokenizer = new HTMLTokenizer();
    this.formatter = formatter || new StandardHTMLFormatter();
    this.highlighter = highlighter || new BasicHTMLHighlighter();
  }

  /**
   * Formats HTML string with the configured formatter
   * @param html - Raw HTML string
   * @param options - Formatting options
   * @returns Formatted HTML string
   * @throws Error if formatting fails
   */
  public formatHTML(html: string, options: FormatOptions): string {
    try {
      if (!html || !html.trim()) {
        throw new Error('HTML input is empty');
      }

      // Step 1: Tokenize
      const tokens = this.tokenizer.tokenize(html);

      if (tokens.length === 0) {
        throw new Error('No valid HTML tokens found');
      }

      // Step 2: Format
      const formatted = this.formatter.format(tokens, options);

      return formatted;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`HTML formatting failed: ${error.message}`);
      }
      throw new Error('HTML formatting failed: Unknown error');
    }
  }

  /**
   * Applies syntax highlighting to HTML
   * @param html - HTML string to highlight
   * @returns HTML string with syntax highlighting markup
   */
  public highlightHTML(html: string): string {
    try {
      return this.highlighter.highlight(html);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Syntax highlighting failed: ${error.message}`);
      }
      throw new Error('Syntax highlighting failed: Unknown error');
    }
  }

  /**
   * Formats and highlights HTML in one operation
   * @param html - Raw HTML string
   * @param options - Formatting options
   * @returns Object with formatted and highlighted HTML
   */
  public formatAndHighlight(html: string, options: FormatOptions): {
    formatted: string;
    highlighted: string;
  } {
    const formatted = this.formatHTML(html, options);
    const highlighted = this.highlightHTML(formatted);

    return {
      formatted,
      highlighted,
    };
  }

  /**
   * Validates HTML structure (basic validation)
   * @param html - HTML string to validate
   * @returns Validation result with errors if any
   */
  public validateHTML(html: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const tokens = this.tokenizer.tokenize(html);
      const tagStack: string[] = [];

      for (const token of tokens) {
        if (token.type === 'TAG_OPEN' && token.tagName) {
          tagStack.push(token.tagName);
        } else if (token.type === 'TAG_CLOSE' && token.tagName) {
          const expected = tagStack.pop();
          if (expected !== token.tagName) {
            errors.push(
              `Mismatched closing tag: expected </${expected}>, found </${token.tagName}>`
            );
          }
        }
      }

      // Check for unclosed tags
      if (tagStack.length > 0) {
        errors.push(`Unclosed tags: ${tagStack.join(', ')}`);
      }
    } catch (error) {
      errors.push('Failed to parse HTML');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sets a different formatter strategy
   * @param formatter - The formatter to use
   */
  public setFormatter(formatter: IHTMLFormatter): void {
    this.formatter = formatter;
  }

  /**
   * Sets a different highlighter strategy
   * @param highlighter - The highlighter to use
   */
  public setHighlighter(highlighter: IHTMLHighlighter): void {
    this.highlighter = highlighter;
  }

  /**
   * Gets statistics about the HTML
   * @param html - HTML string to analyze
   * @returns Statistics object
   */
  public getStatistics(html: string): {
    characters: number;
    lines: number;
    tags: number;
    tokens: number;
  } {
    const tokens = this.tokenizer.tokenize(html);
    const tagCount = tokens.filter(
      t => t.type === 'TAG_OPEN' || t.type === 'TAG_CLOSE' || t.type === 'TAG_SELF_CLOSING'
    ).length;

    return {
      characters: html.length,
      lines: html.split('\n').length,
      tags: tagCount,
      tokens: tokens.length,
    };
  }
}
