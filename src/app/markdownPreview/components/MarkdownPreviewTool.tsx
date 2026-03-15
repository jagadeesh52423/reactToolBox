'use client';

import React, { useState, useMemo, useCallback } from 'react';
import EditorPanel from './EditorPanel';
import PreviewPanel from './PreviewPanel';
import { parseMarkdown, buildHtmlDocument } from '../utils/markdownParser';

const DEFAULT_MARKDOWN = `# Welcome to Markdown Preview

Start typing your markdown here to see a **live preview**.

## Features

- GitHub Flavored Markdown (GFM)
- Tables, task lists, and strikethrough
- Code blocks with syntax highlighting
- Export to HTML

## Example Table

| Feature | Supported |
|---------|-----------|
| Headings | Yes |
| Bold/Italic | Yes |
| Tables | Yes |
| Task Lists | Yes |

## Code Block

\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}
\`\`\`

## Task List

- [x] Write markdown
- [x] See live preview
- [ ] Export to HTML

> This is a blockquote. You can write notes or quotes here.

---

*Happy writing!*
`;

/**
 * MarkdownPreviewTool Component
 *
 * Main orchestrator for the Markdown Preview tool.
 * Manages markdown state, editor visibility toggle, and HTML export.
 */
export default function MarkdownPreviewTool() {
    const [markdown, setMarkdown] = useState<string>(DEFAULT_MARKDOWN);
    const [isEditorVisible, setIsEditorVisible] = useState<boolean>(true);

    const renderedHtml = useMemo(() => parseMarkdown(markdown), [markdown]);

    const toggleEditorVisibility = useCallback(() => {
        setIsEditorVisible((prev) => !prev);
    }, []);

    const handleClear = useCallback(() => {
        setMarkdown('');
    }, []);

    const handleExportHtml = useCallback(() => {
        const htmlDocument = buildHtmlDocument(renderedHtml);
        const blob = new Blob([htmlDocument], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'markdown-export.html';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
    }, [renderedHtml]);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <main className="flex-1 p-6 overflow-hidden min-h-0">
                <div className="w-full h-full">
                    <div
                        className={`grid gap-6 h-full ${
                            isEditorVisible
                                ? 'grid-cols-1 lg:grid-cols-2'
                                : 'grid-cols-1'
                        }`}
                    >
                        {isEditorVisible && (
                            <EditorPanel
                                markdown={markdown}
                                onMarkdownChange={setMarkdown}
                                onToggleVisibility={toggleEditorVisibility}
                                onClear={handleClear}
                            />
                        )}

                        <PreviewPanel
                            renderedHtml={renderedHtml}
                            isEditorVisible={isEditorVisible}
                            onToggleEditorVisibility={toggleEditorVisibility}
                            onExportHtml={handleExportHtml}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
