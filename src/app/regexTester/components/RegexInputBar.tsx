'use client';

import React from 'react';
import PresetsDropdown from './PresetsDropdown';

interface Flags {
    g: boolean;
    i: boolean;
    m: boolean;
    s: boolean;
}

interface RegexInputBarProps {
    pattern: string;
    flags: Flags;
    error: string | null;
    onPatternChange: (pattern: string) => void;
    onFlagToggle: (flag: keyof Flags) => void;
    onPresetSelect: (pattern: string) => void;
}

/**
 * RegexInputBar Component
 *
 * Top bar containing the regex pattern input field, flag toggle buttons,
 * and a presets dropdown for quick pattern selection.
 */
export default function RegexInputBar({
    pattern,
    flags,
    error,
    onPatternChange,
    onFlagToggle,
    onPresetSelect,
}: RegexInputBarProps) {
    const flagKeys: (keyof Flags)[] = ['g', 'i', 'm', 's'];
    const flagLabels: Record<keyof Flags, string> = {
        g: 'Global',
        i: 'Case Insensitive',
        m: 'Multiline',
        s: 'Dot All',
    };

    return (
        <div className="px-6 py-3 border-b border-gray-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-3 flex-wrap">
                {/* Regex delimiters and input */}
                <div className="flex items-center flex-1 min-w-0">
                    <span className="text-lg font-mono text-gray-400 dark:text-slate-500 mr-1">/</span>
                    <input
                        type="text"
                        value={pattern}
                        onChange={(e) => onPatternChange(e.target.value)}
                        placeholder="Enter regex pattern..."
                        className={`flex-1 min-w-0 px-3 py-1.5 font-mono text-sm bg-white dark:bg-slate-900 border rounded outline-none transition-colors ${
                            error
                                ? 'border-red-300 dark:border-red-600 focus:border-red-500 dark:focus:border-red-400'
                                : 'border-gray-200 dark:border-slate-700 focus:border-blue-400 dark:focus:border-blue-500'
                        } text-gray-900 dark:text-slate-100`}
                        spellCheck={false}
                        aria-label="Regular expression pattern"
                    />
                    <span className="text-lg font-mono text-gray-400 dark:text-slate-500 ml-1">/</span>
                </div>

                {/* Flag toggles */}
                <div className="flex items-center gap-1">
                    {flagKeys.map((flag) => (
                        <button
                            key={flag}
                            type="button"
                            onClick={() => onFlagToggle(flag)}
                            className={`w-8 h-8 rounded text-sm font-mono font-bold transition-colors ${
                                flags[flag]
                                    ? 'bg-blue-500 text-white shadow-sm'
                                    : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                            title={`${flagLabels[flag]} (${flag})`}
                            aria-label={`Toggle ${flagLabels[flag]} flag`}
                            aria-pressed={flags[flag]}
                        >
                            {flag}
                        </button>
                    ))}
                </div>

                {/* Presets dropdown */}
                <PresetsDropdown onSelect={onPresetSelect} />
            </div>

            {/* Error message */}
            {error && (
                <div className="mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-500/30">
                    <p className="text-xs text-red-500 dark:text-red-400 font-mono">{error}</p>
                </div>
            )}
        </div>
    );
}
