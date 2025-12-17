'use client';

import { useRef } from 'react';
import { IndentLevel } from '../models/JsonModels';
import PrettifyDropdown from './PrettifyDropdown';

interface JsonInputPanelProps {
    jsonInput: string;
    error: string | null;
    indentLevel: IndentLevel;
    showPrettifyOptions: boolean;
    onJsonChange: (value: string) => void;
    onPrettify: (indent: IndentLevel) => void;
    onTogglePrettify: () => void;
    onCopy: () => void;
    onFileUpload: (file: File) => void;
    onDownload: () => void;
}

/**
 * JsonInputPanel Component
 *
 * Left panel containing JSON text input, file operations, and formatting options.
 * Single responsibility - handles JSON input/output only.
 */
export default function JsonInputPanel({
    jsonInput,
    error,
    indentLevel,
    showPrettifyOptions,
    onJsonChange,
    onPrettify,
    onTogglePrettify,
    onCopy,
    onFileUpload,
    onDownload
}: JsonInputPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
            // Reset input so same file can be selected again
            e.target.value = '';
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    JSON Input
                </h2>
                <div className="flex gap-2">
                    <PrettifyDropdown
                        isOpen={showPrettifyOptions}
                        currentIndent={indentLevel}
                        onToggle={onTogglePrettify}
                        onPrettify={onPrettify}
                    />
                    <button
                        onClick={onCopy}
                        className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors"
                        title="Copy JSON to clipboard"
                    >
                        Copy
                    </button>
                </div>
            </div>

            {/* Text Area */}
            <textarea
                className="w-full h-[calc(100vh-14rem)] p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                value={jsonInput}
                onChange={(e) => onJsonChange(e.target.value)}
                placeholder="Paste your JSON here..."
                spellCheck={false}
            />

            {/* Error Display */}
            {error && (
                <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300 text-sm">
                    {error}
                </div>
            )}

            {/* File Operations */}
            <div className="flex gap-2 mt-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="application/json,.json"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <button
                    onClick={triggerFileUpload}
                    className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex-grow transition-colors"
                >
                    Import JSON
                </button>
                <button
                    onClick={onDownload}
                    className="px-3 py-1.5 bg-cyan-500 text-white rounded hover:bg-cyan-600 text-sm flex-grow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!jsonInput}
                >
                    Download JSON
                </button>
            </div>
        </div>
    );
}
