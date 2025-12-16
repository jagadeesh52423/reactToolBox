/**
 * Interface for HTML syntax highlighting strategies
 */
export interface IHTMLHighlighter {
  /**
   * Applies syntax highlighting to HTML code
   * @param html - The HTML string to highlight
   * @returns HTML string with highlighting markup
   */
  highlight(html: string): string;

  /**
   * Gets the name of this highlighter
   */
  getName(): string;
}
