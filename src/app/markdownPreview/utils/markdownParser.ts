import { marked } from 'marked';

/**
 * Markdown Parser Utility
 *
 * Configures and exposes the marked library for parsing markdown to HTML.
 * Uses GFM (GitHub Flavored Markdown) with line breaks enabled.
 */

// Configure marked with GFM support
marked.setOptions({
    gfm: true,
    breaks: true,
});

/**
 * Strip script tags from HTML as a basic sanitization precaution.
 */
function stripScriptTags(html: string): string {
    return html.replace(
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        ''
    );
}

/**
 * Parse markdown string into sanitized HTML.
 */
export function parseMarkdown(markdown: string): string {
    try {
        const rawHtml = marked.parse(markdown) as string;
        return stripScriptTags(rawHtml);
    } catch {
        return '<p class="text-red-500">Error parsing markdown.</p>';
    }
}

/**
 * Build a complete standalone HTML document from rendered HTML content.
 */
export function buildHtmlDocument(renderedHtml: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Markdown Export</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; color: #1a202c; }
  pre { background: #f7fafc; padding: 1rem; border-radius: 0.375rem; overflow-x: auto; }
  code { background: #f7fafc; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875em; }
  pre code { background: none; padding: 0; }
  table { border-collapse: collapse; width: 100%; }
  th, td { border: 1px solid #e2e8f0; padding: 0.5rem 1rem; text-align: left; }
  th { background: #f7fafc; font-weight: 600; }
  blockquote { border-left: 4px solid #e2e8f0; margin: 1rem 0; padding: 0.5rem 1rem; color: #718096; }
  img { max-width: 100%; height: auto; }
  h1, h2, h3, h4, h5, h6 { margin-top: 1.5em; margin-bottom: 0.5em; }
  hr { border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
</style>
</head>
<body>
${renderedHtml}
</body>
</html>`;
}
