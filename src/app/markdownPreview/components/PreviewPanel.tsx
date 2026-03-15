'use client';

import React from 'react';
import PanelHeader from '@/components/common/PanelHeader';

interface PreviewPanelProps {
    renderedHtml: string;
    isEditorVisible: boolean;
    onToggleEditorVisibility: () => void;
    onExportHtml: () => void;
}

/**
 * PreviewPanel Component
 *
 * Right panel that renders the parsed HTML output with Tailwind prose styling.
 * Includes a "Show Editor" button when the editor is hidden and an "Export HTML" button.
 */
export default function PreviewPanel({
    renderedHtml,
    isEditorVisible,
    onToggleEditorVisibility,
    onExportHtml,
}: PreviewPanelProps) {
    return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full">
            <PanelHeader title="Preview">
                {!isEditorVisible && (
                    <button
                        onClick={onToggleEditorVisibility}
                        title="Show editor"
                        aria-label="Show editor"
                        className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                        Show Editor
                    </button>
                )}
                <button
                    onClick={onExportHtml}
                    title="Export as HTML file"
                    aria-label="Export as HTML file"
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                    Export HTML
                </button>
            </PanelHeader>

            <div className="flex-1 overflow-auto min-h-0">
                {renderedHtml ? (
                    <div
                        className="prose dark:prose-invert max-w-none p-6 overflow-auto"
                        dangerouslySetInnerHTML={{ __html: renderedHtml }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-slate-500 text-sm">
                        Start typing markdown to see a live preview
                    </div>
                )}
            </div>
        </div>
    );
}
