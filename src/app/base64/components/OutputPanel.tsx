'use client';

import React from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import CodeEditor from '@/components/common/CodeEditor';

interface OutputPanelProps {
    output: string;
    error: string | null;
    mode: 'encode' | 'decode';
    onCopy: () => void;
}

/**
 * OutputPanel Component
 *
 * Right panel displaying the encoded/decoded output.
 * Uses CodeEditor in readOnly mode with a copy button in the header.
 */
export default function OutputPanel({
    output,
    error,
    mode,
    onCopy,
}: OutputPanelProps) {
    const title = mode === 'encode' ? 'Base64 Output' : 'Decoded Text Output';

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
            <PanelHeader title={title}>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                    {output.length} chars
                </span>
                <button
                    onClick={onCopy}
                    disabled={!output}
                    className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Copy output to clipboard"
                    aria-label="Copy output"
                >
                    <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                </button>
            </PanelHeader>
            <div className="flex-1 overflow-hidden min-h-0">
                {error ? (
                    <div className="p-4">
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-500/30">
                            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    </div>
                ) : output ? (
                    <CodeEditor
                        value={output}
                        onChange={() => {}}
                        readOnly={true}
                        placeholder="Output will appear here..."
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-slate-500 text-sm">
                        <p>Enter text in the input panel to see the result here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
