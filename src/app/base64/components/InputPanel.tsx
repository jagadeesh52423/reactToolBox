'use client';

import React from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import CodeEditor from '@/components/common/CodeEditor';

interface InputPanelProps {
    input: string;
    fileName: string | null;
    mode: 'encode' | 'decode';
    onInputChange: (value: string) => void;
}

/**
 * InputPanel Component
 *
 * Left panel containing the text input area with PanelHeader.
 * Uses the common CodeEditor component for consistent editing experience.
 */
export default function InputPanel({
    input,
    fileName,
    mode,
    onInputChange,
}: InputPanelProps) {
    const title = mode === 'encode' ? 'Plain Text Input' : 'Base64 Input';
    const placeholder = mode === 'encode'
        ? 'Enter text to encode to Base64...'
        : 'Enter Base64 string to decode...';

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
            <PanelHeader title={title}>
                {fileName && (
                    <span className="text-xs text-gray-400 dark:text-slate-500 truncate max-w-[150px]" title={`File: ${fileName}`}>
                        {fileName}
                    </span>
                )}
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                    {input.length} chars
                </span>
            </PanelHeader>
            <div className="flex-1 overflow-hidden min-h-0">
                <CodeEditor
                    value={input}
                    onChange={onInputChange}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
