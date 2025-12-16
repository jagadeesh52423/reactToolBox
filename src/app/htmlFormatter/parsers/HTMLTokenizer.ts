import { HTMLToken, TokenType, TagDisplayType } from '../models/HTMLToken';
import { HTMLTagConfig } from '../config/HTMLTagConfig';

/**
 * Tokenizer class for parsing HTML into tokens
 * Follows Single Responsibility Principle - only handles tokenization
 */
export class HTMLTokenizer {
  private tagConfig: HTMLTagConfig;

  constructor() {
    this.tagConfig = HTMLTagConfig.getInstance();
  }

  /**
   * Tokenizes HTML string into an array of tokens
   * @param html - The HTML string to tokenize
   * @returns Array of HTMLToken objects
   */
  public tokenize(html: string): HTMLToken[] {
    // Normalize whitespace
    const normalized = this.normalizeWhitespace(html);

    // Split into raw tokens (tags and text)
    const rawTokens = normalized.split(/(<[^>]*>)/g).filter(token => token.length > 0);

    // Convert raw tokens to structured tokens
    return rawTokens
      .map(token => this.createToken(token))
      .filter(token => token !== null) as HTMLToken[];
  }

  /**
   * Normalizes whitespace in HTML while preserving important spaces
   */
  private normalizeWhitespace(html: string): string {
    return html
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();
  }

  /**
   * Creates a structured token from a raw string token
   */
  private createToken(rawToken: string): HTMLToken | null {
    const trimmed = rawToken.trim();
    if (!trimmed) {
      return null;
    }

    // Check if it's a tag
    if (trimmed.startsWith('<')) {
      return this.parseTag(trimmed);
    }

    // It's text content
    return {
      type: TokenType.TEXT,
      content: rawToken, // Preserve original spacing for text
    };
  }

  /**
   * Parses a tag string into a token
   */
  private parseTag(tag: string): HTMLToken {
    // DOCTYPE declaration
    if (tag.match(/^<!DOCTYPE/i)) {
      return {
        type: TokenType.DOCTYPE,
        content: tag,
      };
    }

    // HTML comment
    if (tag.startsWith('<!--')) {
      return {
        type: TokenType.COMMENT,
        content: tag,
      };
    }

    // Closing tag
    if (tag.startsWith('</')) {
      const tagName = this.extractTagName(tag);
      return {
        type: TokenType.TAG_CLOSE,
        content: tag,
        tagName,
        displayType: this.tagConfig.getDisplayType(tagName),
      };
    }

    // Opening or self-closing tag
    const tagName = this.extractTagName(tag);
    const isSelfClosing = tag.endsWith('/>') || this.tagConfig.isSelfClosing(tagName);

    return {
      type: isSelfClosing ? TokenType.TAG_SELF_CLOSING : TokenType.TAG_OPEN,
      content: tag,
      tagName,
      displayType: this.tagConfig.getDisplayType(tagName),
      attributes: this.extractAttributes(tag),
    };
  }

  /**
   * Extracts tag name from a tag string
   */
  private extractTagName(tag: string): string {
    const match = tag.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/i);
    return match ? match[1].toLowerCase() : '';
  }

  /**
   * Extracts attributes from a tag string
   */
  private extractAttributes(tag: string): string {
    const match = tag.match(/<[a-zA-Z][a-zA-Z0-9]*\s+([^>]*?)\/?>$/i);
    return match ? match[1].trim() : '';
  }
}
