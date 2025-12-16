import { TagDisplayType } from '../models/HTMLToken';

/**
 * Configuration class for HTML tag properties
 * Implements the Singleton pattern to provide centralized tag configuration
 */
export class HTMLTagConfig {
  private static instance: HTMLTagConfig;

  private selfClosingTags: Set<string>;
  private inlineTags: Set<string>;
  private blockTags: Set<string>;

  private constructor() {
    // Self-closing tags (void elements)
    this.selfClosingTags = new Set([
      'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
      'link', 'meta', 'param', 'source', 'track', 'wbr', 'command',
      'keygen', 'menuitem',
    ]);

    // Inline elements
    this.inlineTags = new Set([
      'a', 'abbr', 'acronym', 'b', 'bdo', 'big', 'br', 'button',
      'cite', 'code', 'dfn', 'em', 'i', 'img', 'input', 'kbd',
      'label', 'map', 'object', 'q', 'samp', 'script', 'select',
      'small', 'span', 'strong', 'sub', 'sup', 'textarea', 'tt',
      'var', 'mark', 'time',
    ]);

    // Block elements
    this.blockTags = new Set([
      'address', 'article', 'aside', 'blockquote', 'canvas', 'dd', 'div',
      'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'html',
      'li', 'main', 'nav', 'noscript', 'ol', 'output', 'p', 'pre',
      'section', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr',
      'ul', 'video', 'body', 'head', 'title', 'style',
    ]);
  }

  public static getInstance(): HTMLTagConfig {
    if (!HTMLTagConfig.instance) {
      HTMLTagConfig.instance = new HTMLTagConfig();
    }
    return HTMLTagConfig.instance;
  }

  public isSelfClosing(tagName: string): boolean {
    return this.selfClosingTags.has(tagName.toLowerCase());
  }

  public isInline(tagName: string): boolean {
    return this.inlineTags.has(tagName.toLowerCase());
  }

  public isBlock(tagName: string): boolean {
    return this.blockTags.has(tagName.toLowerCase());
  }

  public getDisplayType(tagName: string): TagDisplayType {
    const lowerTag = tagName.toLowerCase();
    if (this.isSelfClosing(lowerTag)) {
      return TagDisplayType.SELF_CLOSING;
    }
    if (this.isInline(lowerTag)) {
      return TagDisplayType.INLINE;
    }
    return TagDisplayType.BLOCK;
  }

  /**
   * Allows adding custom inline tags (for extensibility)
   */
  public addInlineTag(tagName: string): void {
    this.inlineTags.add(tagName.toLowerCase());
  }

  /**
   * Allows adding custom block tags (for extensibility)
   */
  public addBlockTag(tagName: string): void {
    this.blockTags.add(tagName.toLowerCase());
  }

  /**
   * Allows adding custom self-closing tags (for extensibility)
   */
  public addSelfClosingTag(tagName: string): void {
    this.selfClosingTags.add(tagName.toLowerCase());
  }
}
