'use client';

import { IndentLevel, INDENT_LEVELS } from '../models/JsonModels';

interface PrettifyDropdownProps {
    isOpen: boolean;
    currentIndent: IndentLevel;
    onToggle: () => void;
    onPrettify: (indent: IndentLevel) => void;
}

/**
 * PrettifyDropdown Component
 *
 * Dropdown for selecting JSON prettify indentation level.
 * Single responsibility - handles prettify options only.
 */
export default function PrettifyDropdown({
    isOpen,
    currentIndent,
    onToggle,
    onPrettify
}: PrettifyDropdownProps) {
    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className="px-3 py-1.5 bg-indigo-500 text-white rounded hover:bg-indigo-600 text-sm flex items-center gap-1"
                title="Format JSON with proper indentation"
            >
                Prettify
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded shadow-lg p-3">
                    <div className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                        Indentation spaces:
                    </div>
                    <div className="flex gap-2">
                        {INDENT_LEVELS.map((spaces) => (
                            <button
                                key={spaces}
                                onClick={() => onPrettify(spaces)}
                                className={`px-3 py-1 rounded text-sm transition-colors ${
                                    currentIndent === spaces
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200'
                                }`}
                            >
                                {spaces}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
