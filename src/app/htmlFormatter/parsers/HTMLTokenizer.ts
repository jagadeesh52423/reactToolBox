import { HTMLToken, TokenType, TagDisplayType } from '../models/HTMLToken';
import { HTMLTagConfig } from '../config/HTMLTagConfig';

/**
 * Tokenizer class for parsing HTML into tokens
 * Follows Single Responsibility Principle - only handles tokenization
 */
export class HTMLTokenizer {
  private tagConfig: HTMLTagConfig;

  // Raw text elements - content should not be parsed as HTML
  private static readonly RAW_TEXT_TAGS = new Set(['script', 'style', 'textarea', 'pre']);

  constructor() {
    this.tagConfig = HTMLTagConfig.getInstance();
  }

  /**
   * Tokenizes HTML string into an array of tokens
   * @param html - The HTML string to tokenize
   * @returns Array of HTMLToken objects
   */
  public tokenize(html: string): HTMLToken[] {
    const tokens: HTMLToken[] = [];
    let pos = 0;
    const len = html.length;

    while (pos < len) {
      // Look for the next tag
      const tagStart = html.indexOf('<', pos);

      if (tagStart === -1) {
        // No more tags, rest is text
        const text = html.slice(pos);
        const normalizedText = this.normalizeTextWhitespace(text, false, false);
        if (normalizedText) {
          tokens.push({
            type: TokenType.TEXT,
            content: normalizedText,
          });
        }
        break;
      }

      // Add text before the tag
      if (tagStart > pos) {
        const text = html.slice(pos, tagStart);
        // Determine if we need to preserve leading/trailing spaces
        const prevToken = tokens.length > 0 ? tokens[tokens.length - 1] : null;
        const preserveLeading = prevToken !== null && this.isInlineToken(prevToken);

        // Peek at next tag to see if it's inline
        const nextTagEnd = this.findTagEnd(html, tagStart);
        const nextTag = nextTagEnd !== -1 ? html.slice(tagStart, nextTagEnd + 1) : '';
        const nextTagName = this.extractTagName(nextTag);
        const preserveTrailing = !!(nextTagName && this.tagConfig.isInline(nextTagName));

        const normalizedText = this.normalizeTextWhitespace(text, preserveLeading, preserveTrailing);
        if (normalizedText) {
          tokens.push({
            type: TokenType.TEXT,
            content: normalizedText,
          });
        }
      }

      // Find end of tag
      const tagEnd = this.findTagEnd(html, tagStart);
      if (tagEnd === -1) {
        // Malformed HTML - treat rest as text
        const text = html.slice(tagStart);
        tokens.push({
          type: TokenType.TEXT,
          content: text,
        });
        break;
      }

      const tag = html.slice(tagStart, tagEnd + 1);
      const token = this.parseTag(tag);
      tokens.push(token);

      pos = tagEnd + 1;

      // Check if this is a raw text element opening tag
      if (token.type === TokenType.TAG_OPEN && token.tagName &&
          HTMLTokenizer.RAW_TEXT_TAGS.has(token.tagName)) {
        // Find the closing tag and preserve content
        const closeTagPattern = new RegExp(`</${token.tagName}>`, 'i');
        const closeMatch = html.slice(pos).match(closeTagPattern);

        if (closeMatch && closeMatch.index !== undefined) {
          const rawContent = html.slice(pos, pos + closeMatch.index);

          // Add raw content as a special token (preserve whitespace)
          if (rawContent) {
            tokens.push({
              type: TokenType.RAW_TEXT,
              content: rawContent,
              tagName: token.tagName,
            });
          }

          // Add the closing tag
          const closeTag = closeMatch[0];
          tokens.push({
            type: TokenType.TAG_CLOSE,
            content: closeTag,
            tagName: token.tagName,
            displayType: this.tagConfig.getDisplayType(token.tagName),
          });

          pos = pos + closeMatch.index + closeTag.length;
        }
      }
    }

    return tokens;
  }

  /**
   * Check if a token is an inline element
   */
  private isInlineToken(token: HTMLToken): boolean {
    if (token.type === TokenType.TEXT) return true;
    if (token.displayType === TagDisplayType.INLINE) return true;
    if (token.tagName && this.tagConfig.isInline(token.tagName)) return true;
    return false;
  }

  /**
   * Normalizes whitespace in text content while preserving important spaces
   * @param text - The text to normalize
   * @param preserveLeading - Keep at least one leading space if original had whitespace
   * @param preserveTrailing - Keep at least one trailing space if original had whitespace
   */
  private normalizeTextWhitespace(text: string, preserveLeading: boolean, preserveTrailing: boolean): string {
    const hadLeadingSpace = /^\s/.test(text);
    const hadTrailingSpace = /\s$/.test(text);

    // Normalize internal whitespace
    let normalized = text
      .replace(/\r\n/g, '\n')
      .replace(/\s+/g, ' ')
      .trim();

    if (!normalized) return '';

    // Restore important spaces for inline content
    if (preserveLeading && hadLeadingSpace) {
      normalized = ' ' + normalized;
    }
    if (preserveTrailing && hadTrailingSpace) {
      normalized = normalized + ' ';
    }

    return normalized;
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

    // CDATA section
    if (tag.startsWith('<![CDATA[')) {
      return {
        type: TokenType.TEXT,
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
    const match = tag.match(/<\/?([a-zA-Z][a-zA-Z0-9-]*)/i);
    return match ? match[1].toLowerCase() : '';
  }

  /**
   * Extracts attributes from a tag string by slicing between the tag name and the
   * closing '>' (or '/>'), rather than a regex over the raw content, since attribute
   * values may themselves contain '>' (e.g. title="a > b").
   */
  private extractAttributes(tag: string): string {
    const nameMatch = tag.match(/^<[a-zA-Z][a-zA-Z0-9-]*/);
    if (!nameMatch) return '';

    let end = tag.length - 1;
    if (tag[end - 1] === '/') end -= 1;

    return tag.slice(nameMatch[0].length, end).trim();
  }

  /**
   * Finds the index of the '>' that closes the tag/construct starting at `start`.
   * Comments and CDATA sections use their own terminators ('-->', ']]>') since their
   * content may contain unbalanced quote characters. Other tags are scanned quote-aware
   * so a '>' inside a quoted attribute value doesn't end the tag early.
   */
  private findTagEnd(html: string, start: number): number {
    if (html.startsWith('<!--', start)) {
      const closeIdx = html.indexOf('-->', start);
      return closeIdx === -1 ? -1 : closeIdx + 2;
    }

    if (html.startsWith('<![CDATA[', start)) {
      const closeIdx = html.indexOf(']]>', start);
      return closeIdx === -1 ? -1 : closeIdx + 2;
    }

    let quote: '"' | "'" | null = null;
    for (let i = start; i < html.length; i++) {
      const char = html[i];
      if (quote) {
        if (char === quote) quote = null;
      } else if (char === '"' || char === "'") {
        quote = char;
      } else if (char === '>') {
        return i;
      }
    }
    return -1;
  }
}
