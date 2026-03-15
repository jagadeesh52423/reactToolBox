'use client';

import React, { useRef } from 'react';

interface ControlBarProps {
    mode: 'encode' | 'decode';
    autoDetect: boolean;
    fileName: string | null;
    onModeChange: (mode: 'encode' | 'decode') => void;
    onAutoDetectToggle: () => void;
    onFileUpload: (file: File) => void;
    onClear: () => void;
}

/**
 * ControlBar Component
 *
 * Horizontal bar with mode toggle, auto-detect indicator,
 * file upload button, and clear action.
 */
export default function ControlBar({
    mode,
    autoDetect,
    fileName,
    onModeChange,
    onAutoDetectToggle,
    onFileUpload,
    onClear,
}: ControlBarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
            // Reset so the same file can be uploaded again
            e.target.value = '';
        }
    };

    return (
        <div className="px-6 py-3 flex items-center gap-4 border-b border-gray-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/30">
            {/* Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                    onClick={() => onModeChange('encode')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        mode === 'encode'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                            : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                    title="Encode text to Base64"
                    aria-label="Encode mode"
                >
                    Encode
                </button>
                <button
                    onClick={() => onModeChange('decode')}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        mode === 'decode'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                            : 'text-gray-600 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                    }`}
                    title="Decode Base64 to text"
                    aria-label="Decode mode"
                >
                    Decode
                </button>
            </div>

            {/* Auto-detect Toggle */}
            <button
                onClick={onAutoDetectToggle}
                className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                    autoDetect
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                }`}
                title="Toggle auto-detection of encode/decode mode"
                aria-label={`Auto-detect is ${autoDetect ? 'on' : 'off'}`}
            >
                <span className={`w-2 h-2 rounded-full ${autoDetect ? 'bg-green-500' : 'bg-gray-400'}`} />
                Auto-detect
            </button>

            {/* Separator */}
            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700" />

            {/* File Upload */}
            <button
                onClick={handleFileClick}
                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                title="Upload a file to encode as Base64"
                aria-label="Upload file"
            >
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload File
            </button>
            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                aria-hidden="true"
            />

            {/* File Name Display */}
            {fileName && (
                <span className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-[200px]" title={fileName}>
                    {fileName}
                </span>
            )}

            {/* Spacer */}
            <div className="flex-1" />

            {/* Clear Button */}
            <button
                onClick={onClear}
                className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                title="Clear all input and output"
                aria-label="Clear all"
            >
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear
            </button>
        </div>
    );
}
