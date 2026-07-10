'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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
    const [markdown, setMarkdown] = useLocalStorage<string>('reactToolBox_markdownPreview_content', DEFAULT_MARKDOWN);
    const [isEditorVisible, setIsEditorVisible] = useState<boolean>(true);
    const [isSyncScrollEnabled, setIsSyncScrollEnabled] = useState<boolean>(true);

    // Guards the editor<->preview scroll sync against feedback loops: setting one
    // pane's scrollTop programmatically fires its own scroll event, which must not
    // re-trigger a sync back onto the pane that originated the user's scroll.
    const isSyncingScrollRef = useRef(false);
    const editorTextareaRef = useRef<HTMLTextAreaElement>(null);
    const previewScrollRef = useRef<HTMLDivElement>(null);

    const renderedHtml = useMemo(() => parseMarkdown(markdown), [markdown]);

    const toggleEditorVisibility = useCallback(() => {
        setIsEditorVisible((prev) => !prev);
    }, []);

    const toggleSyncScroll = useCallback(() => {
        setIsSyncScrollEnabled((prev) => !prev);
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

    const applyProportionalScroll = useCallback((source: HTMLElement, target: HTMLElement) => {
        const sourceScrollable = source.scrollHeight - source.clientHeight;
        const fraction = sourceScrollable > 0 ? source.scrollTop / sourceScrollable : 0;
        const targetScrollable = target.scrollHeight - target.clientHeight;
        target.scrollTop = fraction * targetScrollable;
    }, []);

    const handleEditorScroll = useCallback(() => {
        if (!isSyncScrollEnabled || isSyncingScrollRef.current) return;
        const editor = editorTextareaRef.current;
        const preview = previewScrollRef.current;
        if (!editor || !preview) return;

        isSyncingScrollRef.current = true;
        applyProportionalScroll(editor, preview);
        requestAnimationFrame(() => {
            isSyncingScrollRef.current = false;
        });
    }, [isSyncScrollEnabled, applyProportionalScroll]);

    const handlePreviewScroll = useCallback(() => {
        if (!isSyncScrollEnabled || isSyncingScrollRef.current) return;
        const editor = editorTextareaRef.current;
        const preview = previewScrollRef.current;
        if (!editor || !preview) return;

        isSyncingScrollRef.current = true;
        applyProportionalScroll(preview, editor);
        requestAnimationFrame(() => {
            isSyncingScrollRef.current = false;
        });
    }, [isSyncScrollEnabled, applyProportionalScroll]);

    return (
        <div className="h-[var(--tool-content-height)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
                                textareaRef={editorTextareaRef}
                                onEditorScroll={handleEditorScroll}
                            />
                        )}

                        <PreviewPanel
                            renderedHtml={renderedHtml}
                            isEditorVisible={isEditorVisible}
                            onToggleEditorVisibility={toggleEditorVisibility}
                            onExportHtml={handleExportHtml}
                            scrollContainerRef={previewScrollRef}
                            onPreviewScroll={handlePreviewScroll}
                            isSyncScrollEnabled={isSyncScrollEnabled}
                            onToggleSyncScroll={toggleSyncScroll}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
