'use client';

import React, { RefObject } from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import CodeEditor from '@/components/common/CodeEditor';
import MarkdownToolbar from './MarkdownToolbar';

interface EditorPanelProps {
    markdown: string;
    onMarkdownChange: (value: string) => void;
    onToggleVisibility: () => void;
    onClear: () => void;
    textareaRef: RefObject<HTMLTextAreaElement | null>;
    onEditorScroll: () => void;
}

/**
 * EditorPanel Component
 *
 * Left panel containing the markdown editor with CodeEditor, a formatting toolbar,
 * a toggle visibility button, and a clear button in the header.
 */
export default function EditorPanel({
    markdown,
    onMarkdownChange,
    onToggleVisibility,
    onClear,
    textareaRef,
    onEditorScroll,
}: EditorPanelProps) {
    return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full">
            <PanelHeader title="Markdown Editor">
                <button
                    onClick={onClear}
                    title="Clear editor"
                    aria-label="Clear editor"
                    className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                >
                    Clear
                </button>
                <button
                    onClick={onToggleVisibility}
                    title="Hide editor"
                    aria-label="Hide editor"
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                    Hide Editor
                </button>
            </PanelHeader>

            <MarkdownToolbar textareaRef={textareaRef} onChange={onMarkdownChange} />

            <div className="flex-1 overflow-hidden min-h-0">
                <CodeEditor
                    ref={textareaRef}
                    value={markdown}
                    onChange={onMarkdownChange}
                    onScroll={onEditorScroll}
                    placeholder="Enter markdown here..."
                />
            </div>
        </div>
    );
}
