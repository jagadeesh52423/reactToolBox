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
      this.result += this.getIndentation() + token.content + '\n';
      this.indentLevel++;
    }
  }

  private handleCloseTag(token: HTMLToken): void {
    if (token.displayType === TagDisplayType.INLINE) {
      this.result += token.content;
    } else {
      this.indentLevel = Math.max(0, this.indentLevel - 1);
      this.result += this.getIndentation() + token.content + '\n';
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

    const inInlineContext = this.isInInlineContext();
    const prevToken = this.getPreviousToken();
    const nextToken = this.getNextToken();

    // Check if this is simple content between tags (e.g., <h1>Title</h1>)
    const isSimpleContent =
      prevToken?.type === TokenType.TAG_OPEN &&
      prevToken?.displayType !== TagDisplayType.INLINE &&
      nextToken?.type === TokenType.TAG_CLOSE &&
      prevToken?.tagName === nextToken?.tagName;

    if (inInlineContext && !isSimpleContent) {
      // Keep inline with surrounding inline elements
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
   * Post-processing to clean up specific patterns
   */
  private postProcess(html: string): string {
    // Fix inline-only content in list items and similar patterns
    // Pattern: <li>\n  <a>text</a>\n</li> -> <li><a>text</a></li>
    let result = html.replace(
      /(<(li|td|th|dt|dd)[^>]*>)\n\s*(<[^>]+>[^<]*<\/[^>]+>)\s*\n(\s*<\/\2>)/gi,
      '$1$3$4'
    );

    return result;
  }
}
