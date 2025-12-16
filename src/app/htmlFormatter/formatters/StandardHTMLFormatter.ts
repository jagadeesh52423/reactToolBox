import { IHTMLFormatter } from './IHTMLFormatter';
import { HTMLToken, FormatOptions, TokenType, TagDisplayType } from '../models/HTMLToken';

/**
 * Standard HTML formatter implementing the Strategy pattern
 * Provides standard indentation with proper handling of inline and block elements
 */
export class StandardHTMLFormatter implements IHTMLFormatter {
  private indentLevel: number = 0;
  private indent: string = '';
  private result: string = '';
  private tokens: HTMLToken[] = [];
  private currentIndex: number = 0;

  public getName(): string {
    return 'Standard Formatter';
  }

  public format(tokens: HTMLToken[], options: FormatOptions): string {
    this.reset();
    this.tokens = tokens;
    this.indent = ' '.repeat(options.indentSize);

    for (this.currentIndex = 0; this.currentIndex < tokens.length; this.currentIndex++) {
      const token = tokens[this.currentIndex];
      this.processToken(token, options);
    }

    return this.postProcess(this.result.trim());
  }

  private reset(): void {
    this.indentLevel = 0;
    this.result = '';
    this.currentIndex = 0;
  }

  private processToken(token: HTMLToken, options: FormatOptions): void {
    switch (token.type) {
      case TokenType.DOCTYPE:
        this.handleDoctype(token);
        break;
      case TokenType.COMMENT:
        this.handleComment(token);
        break;
      case TokenType.TAG_OPEN:
        this.handleOpenTag(token);
        break;
      case TokenType.TAG_CLOSE:
        this.handleCloseTag(token);
        break;
      case TokenType.TAG_SELF_CLOSING:
        this.handleSelfClosingTag(token);
        break;
      case TokenType.TEXT:
        this.handleText(token, options);
        break;
      default:
        this.result += token.content;
    }
  }

  private handleDoctype(token: HTMLToken): void {
    this.result += token.content + '\n';
  }

  private handleComment(token: HTMLToken): void {
    this.result += this.getIndentation() + token.content + '\n';
  }

  private handleOpenTag(token: HTMLToken): void {
    if (token.displayType === TagDisplayType.INLINE) {
      this.result += token.content;
    } else {
      // Check if this block element contains only inline content
      const hasOnlyInlineContent = this.hasOnlyInlineContent(this.currentIndex);

      if (hasOnlyInlineContent) {
        // Keep on same line, don't add newline or increase indent
        this.result += this.getIndentation() + token.content;
      } else {
        // Normal block formatting
        this.result += this.getIndentation() + token.content + '\n';
        this.indentLevel++;
      }
    }
  }

  private handleCloseTag(token: HTMLToken): void {
    if (token.displayType === TagDisplayType.INLINE) {
      this.result += token.content;
    } else {
      // Check if the previous opening tag had only inline content
      const openingIndex = this.findMatchingOpenTag(this.currentIndex, token.tagName || '');
      const hadOnlyInlineContent = openingIndex >= 0 && this.hasOnlyInlineContent(openingIndex);

      if (hadOnlyInlineContent) {
        // Close on same line
        this.result += token.content + '\n';
      } else {
        // Normal block formatting
        this.indentLevel = Math.max(0, this.indentLevel - 1);
        this.result += this.getIndentation() + token.content + '\n';
      }
    }
  }

  private handleSelfClosingTag(token: HTMLToken): void {
    if (token.displayType === TagDisplayType.INLINE) {
      this.result += token.content;
    } else {
      this.result += this.getIndentation() + token.content + '\n';
    }
  }

  private handleText(token: HTMLToken, options: FormatOptions): void {
    const trimmedContent = token.content.trim();
    if (!trimmedContent) return;

    const prevToken = this.getPreviousToken();
    const nextToken = this.getNextToken();

    // Check if we're inside a block element that has only inline content
    const inInlineOnlyBlock = this.isInInlineOnlyBlock();

    // Check if we're directly inside an inline element
    const inInlineContext = this.isInInlineContext();

    // Check if this is simple content between block tags (e.g., <h1>Title</h1>)
    const isSimpleBlockContent =
      prevToken?.type === TokenType.TAG_OPEN &&
      prevToken?.displayType === TagDisplayType.BLOCK &&
      nextToken?.type === TokenType.TAG_CLOSE &&
      prevToken?.tagName === nextToken?.tagName;

    if (inInlineOnlyBlock || inInlineContext || isSimpleBlockContent) {
      // Keep inline - don't add indentation or newlines
      this.result += token.content;
    } else {
      // Add as a separate line with indentation
      this.result += this.getIndentation() + trimmedContent + '\n';
    }
  }

  private isInInlineContext(): boolean {
    // Look backward to see if we have unclosed inline tags
    for (let i = this.currentIndex - 1; i >= 0; i--) {
      const token = this.tokens[i];
      if (token.type === TokenType.TAG_OPEN && token.displayType === TagDisplayType.INLINE) {
        // Check if it's been closed
        let depth = 1;
        for (let j = i + 1; j < this.currentIndex; j++) {
          const checkToken = this.tokens[j];
          if (checkToken.tagName === token.tagName) {
            if (checkToken.type === TokenType.TAG_OPEN) depth++;
            if (checkToken.type === TokenType.TAG_CLOSE) depth--;
          }
        }
        if (depth > 0) return true; // Still open
      }

      // Stop at block elements
      if (token.displayType === TagDisplayType.BLOCK) {
        break;
      }
    }
    return false;
  }

  private getPreviousToken(): HTMLToken | null {
    return this.currentIndex > 0 ? this.tokens[this.currentIndex - 1] : null;
  }

  private getNextToken(): HTMLToken | null {
    return this.currentIndex < this.tokens.length - 1
      ? this.tokens[this.currentIndex + 1]
      : null;
  }

  private getIndentation(): string {
    return this.indent.repeat(Math.max(0, this.indentLevel));
  }

  /**
   * Checks if a block element (at the given index) contains only inline content
   * This helps us determine if we should keep everything on one line
   */
  private hasOnlyInlineContent(openTagIndex: number): boolean {
    const openToken = this.tokens[openTagIndex];
    if (!openToken.tagName) return false;

    // Find the matching closing tag
    let depth = 1;
    for (let i = openTagIndex + 1; i < this.tokens.length; i++) {
      const token = this.tokens[i];

      if (token.tagName === openToken.tagName) {
        if (token.type === TokenType.TAG_OPEN) {
          depth++;
        } else if (token.type === TokenType.TAG_CLOSE) {
          depth--;
          if (depth === 0) {
            // Found the matching closing tag
            // Check all tokens between open and close
            for (let j = openTagIndex + 1; j < i; j++) {
              const innerToken = this.tokens[j];
              // If we find any block element, return false
              if (
                innerToken.displayType === TagDisplayType.BLOCK &&
                innerToken.type === TokenType.TAG_OPEN
              ) {
                return false;
              }
            }
            // All content is inline or text
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Finds the index of the matching opening tag for a closing tag
   */
  private findMatchingOpenTag(closeTagIndex: number, tagName: string): number {
    let depth = 1;
    for (let i = closeTagIndex - 1; i >= 0; i--) {
      const token = this.tokens[i];
      if (token.tagName === tagName) {
        if (token.type === TokenType.TAG_CLOSE) {
          depth++;
        } else if (token.type === TokenType.TAG_OPEN) {
          depth--;
          if (depth === 0) {
            return i;
          }
        }
      }
    }
    return -1;
  }

  /**
   * Checks if we're currently inside a block element that contains only inline content
   */
  private isInInlineOnlyBlock(): boolean {
    // Find the nearest unclosed block tag
    for (let i = this.currentIndex - 1; i >= 0; i--) {
      const token = this.tokens[i];

      if (token.type === TokenType.TAG_OPEN && token.displayType === TagDisplayType.BLOCK) {
        // Check if this block tag has only inline content
        return this.hasOnlyInlineContent(i);
      } else if (token.type === TokenType.TAG_CLOSE && token.displayType === TagDisplayType.BLOCK) {
        // We've passed a closing block tag, so we're not inside one
        return false;
      }
    }
    return false;
  }

  /**
   * Post-processing to clean up specific patterns
   */
  private postProcess(html: string): string {
    // The formatter should now handle inline-only content correctly,
    // so we don't need aggressive post-processing
    return html;
  }
}
