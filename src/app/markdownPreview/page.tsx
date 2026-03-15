'use client';

import MarkdownPreviewTool from './components/MarkdownPreviewTool';

/**
 * Markdown Preview Page
 *
 * Live markdown editor with rendered preview.
 * Features:
 * - Real-time markdown to HTML preview
 * - GFM (GitHub Flavored Markdown) support
 * - Toggle editor visibility
 * - Export rendered HTML
 */
export default function MarkdownPreviewPage() {
    return <MarkdownPreviewTool />;
}
