'use client';

import { useRef, useState } from 'react';
import { IndentLevel, INDENT_LEVELS } from '../models/JsonModels';
import {
    FolderOpenIcon,
    DownloadIcon,
    SparklesIcon,
    ClipboardIcon,
    ClipboardCheckIcon,
    ChevronDownIcon,
    AlertCircleIcon
} from './Icons';
import PanelHeader from '@/components/common/PanelHeader';
import ToggleVisibilityButton from '@/components/common/ToggleVisibilityButton';
import CodeEditor from '@/components/common/CodeEditor';

interface JsonInputPanelProps {
    jsonInput: string;
    error: string | null;
    indentLevel: IndentLevel;
    showPrettifyOptions: boolean;
    isVisible: boolean;
    onJsonChange: (value: string) => void;
    onPrettify: (indent: IndentLevel) => void;
    onTogglePrettify: () => void;
    onCopy: () => void;
    onFileUpload: (file: File) => void;
    onDownload: () => void;
    onToggleVisibility: () => void;
}

/**
 * JsonInputPanel Component - Professional Redesign
 *
 * Features:
 * - Line numbers in editor
 * - Modern icon-based toolbar
 * - Grouped actions with visual separators
 * - Smooth animations and hover effects
 */
export default function JsonInputPanel({
    jsonInput,
    error,
    indentLevel,
    showPrettifyOptions,
    isVisible,
    onJsonChange,
    onPrettify,
    onTogglePrettify,
    onCopy,
    onFileUpload,
    onDownload,
    onToggleVisibility
}: JsonInputPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [copied, setCopied] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onFileUpload(file);
            e.target.value = '';
        }
    };

    const handleCopyClick = () => {
        onCopy();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const triggerFileUpload = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            {/* Header */}
            <PanelHeader title="JSON Input">
                {/* Visibility Toggle */}
                <div className="flex items-center gap-1 pr-2 border-r border-gray-300/50 dark:border-slate-600/50">
                    <ToggleVisibilityButton
                        isVisible={isVisible}
                        onToggle={onToggleVisibility}
                    />
                </div>

                {/* File Operations Group */}
                <div className="flex items-center gap-1 pr-2 border-r border-gray-300/50 dark:border-slate-600/50">
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="application/json,.json"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <button
                            onClick={triggerFileUpload}
                            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                            title="Import JSON file"
                        >
                            <FolderOpenIcon size={18} />
                        </button>
                        <button
                            onClick={onDownload}
                            disabled={!jsonInput}
                            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Download JSON file"
                        >
                            <DownloadIcon size={18} />
                        </button>
                    </div>

                {/* Format Operations Group */}
                <div className="flex items-center gap-1 pl-2">
                    {/* Prettify Dropdown */}
                    <div className="relative">
                            <button
                                onClick={onTogglePrettify}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-indigo-700 dark:text-slate-300 hover:text-indigo-900 dark:hover:text-white bg-indigo-100/50 dark:bg-indigo-600/20 hover:bg-indigo-200/50 dark:hover:bg-indigo-600/40 border border-indigo-300/50 dark:border-indigo-500/30 transition-all duration-200"
                                title="Format JSON"
                            >
                                <SparklesIcon size={16} />
                                <span className="text-sm font-medium">Format</span>
                                <ChevronDownIcon
                                    size={14}
                                    className={`transition-transform duration-200 ${showPrettifyOptions ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {showPrettifyOptions && (
                                <div className="absolute right-0 mt-2 z-20 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-xl p-3 min-w-[180px]">
                                    <div className="text-xs text-gray-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">
                                        Indentation
                                    </div>
                                    <div className="flex gap-1">
                                        {INDENT_LEVELS.map((spaces) => (
                                            <button
                                                key={spaces}
                                                onClick={() => onPrettify(spaces)}
                                                className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                                    indentLevel === spaces
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-gray-100 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600/50'
                                                }`}
                                            >
                                                {spaces}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Copy Button */}
                        <button
                            onClick={handleCopyClick}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                                copied
                                    ? 'bg-emerald-100/50 dark:bg-emerald-600/30 text-emerald-600 dark:text-emerald-400 border border-emerald-300/50 dark:border-emerald-500/30'
                                    : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-gray-100/50 dark:bg-slate-700/30 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 border border-gray-300/50 dark:border-slate-600/30'
                            }`}
                            title="Copy to clipboard"
                        >
                            {copied ? (
                                <>
                                    <ClipboardCheckIcon size={16} />
                                    <span className="text-sm font-medium">Copied!</span>
                                </>
                            ) : (
                                <>
                                    <ClipboardIcon size={16} />
                                    <span className="text-sm font-medium">Copy</span>
                                </>
                            )}
                        </button>
                </div>
            </PanelHeader>

            {/* Code Editor */}
            <CodeEditor
                value={jsonInput}
                onChange={onJsonChange}
                placeholder="Paste your JSON here..."
            />

            {/* Error Display */}
            {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200/50 dark:border-red-500/30 flex items-start gap-3">
                    <AlertCircleIcon size={18} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="text-red-600 dark:text-red-400 font-medium text-sm">Parse Error</div>
                        <div className="text-red-500/80 dark:text-red-300/80 text-sm mt-0.5">{error}</div>
                    </div>
                </div>
            )}
        </div>
    );
}
