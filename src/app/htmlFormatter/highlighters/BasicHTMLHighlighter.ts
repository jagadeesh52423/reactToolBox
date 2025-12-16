import { IHTMLHighlighter } from './IHTMLHighlighter';

/**
 * Basic HTML syntax highlighter using regex-based approach
 * Implements Strategy pattern for highlighting
 */
export class BasicHTMLHighlighter implements IHTMLHighlighter {
  public getName(): string {
    return 'Basic HTML Highlighter';
  }

  public highlight(html: string): string {
    // Escape HTML entities first
    let result = this.escapeHtml(html);

    // Apply highlighting in specific order
    result = this.highlightComments(result);
    result = this.highlightDoctype(result);
    result = this.highlightTags(result);

    return result;
  }

  /**
   * Escapes HTML special characters
   */
  private escapeHtml(html: string): string {
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Highlights HTML comments
   */
  private highlightComments(html: string): string {
    return html.replace(
      /(&lt;!--.*?--&gt;)/g,
      '<span class="text-gray-500">$1</span>'
    );
  }

  /**
   * Highlights DOCTYPE declarations
   */
  private highlightDoctype(html: string): string {
    return html.replace(
      /&lt;(!DOCTYPE[^&]*?)&gt;/gi,
      '<span class="text-purple-600 font-semibold">&lt;$1&gt;</span>'
    );
  }

  /**
   * Highlights HTML tags with attributes
   */
  private highlightTags(html: string): string {
    return html.replace(
      /&lt;(\/?)([\w-]+)([^&]*?)&gt;/g,
      (match, slash, tagName, attributes) => {
        let result = `<span class="text-blue-600 font-semibold">&lt;${slash}${tagName}</span>`;

        if (attributes) {
          result += this.highlightAttributes(attributes);
        }

        result += '<span class="text-blue-600 font-semibold">&gt;</span>';
        return result;
      }
    );
  }

  /**
   * Highlights HTML attributes within tags
   */
  private highlightAttributes(attributes: string): string {
    return attributes.replace(
      /([\w-]+)(=)(&quot;.*?&quot;|&#039;.*?&#039;)/g,
      '<span class="text-purple-600">$1</span><span class="text-gray-600">$2</span><span class="text-green-600">$3</span>'
    );
  }
}
