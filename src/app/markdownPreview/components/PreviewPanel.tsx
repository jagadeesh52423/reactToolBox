'use client';

import React, { RefObject } from 'react';
import PanelHeader from '@/components/common/PanelHeader';

interface PreviewPanelProps {
    renderedHtml: string;
    isEditorVisible: boolean;
    onToggleEditorVisibility: () => void;
    onExportHtml: () => void;
    scrollContainerRef: RefObject<HTMLDivElement | null>;
    onPreviewScroll: () => void;
    isSyncScrollEnabled: boolean;
    onToggleSyncScroll: () => void;
}

/**
 * PreviewPanel Component
 *
 * Right panel that renders the parsed HTML output with Tailwind prose styling.
 * Includes a "Show Editor" button when the editor is hidden, a scroll-sync toggle,
 * and an "Export HTML" button.
 */
export default function PreviewPanel({
    renderedHtml,
    isEditorVisible,
    onToggleEditorVisibility,
    onExportHtml,
    scrollContainerRef,
    onPreviewScroll,
    isSyncScrollEnabled,
    onToggleSyncScroll,
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
                    onClick={onToggleSyncScroll}
                    title={isSyncScrollEnabled ? 'Disable synced scroll' : 'Enable synced scroll'}
                    aria-label={isSyncScrollEnabled ? 'Disable synced scroll' : 'Enable synced scroll'}
                    aria-pressed={isSyncScrollEnabled}
                    className={`px-3 py-1.5 rounded text-sm transition-colors ${
                        isSyncScrollEnabled
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                            : 'bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                >
                    Sync Scroll
                </button>
                <button
                    onClick={onExportHtml}
                    title="Export as HTML file"
                    aria-label="Export as HTML file"
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                >
                    Export HTML
                </button>
            </PanelHeader>

            <div
                ref={scrollContainerRef}
                onScroll={onPreviewScroll}
                className="flex-1 overflow-auto min-h-0"
            >
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
