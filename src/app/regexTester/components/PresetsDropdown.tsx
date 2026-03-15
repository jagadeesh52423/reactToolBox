'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Preset {
    name: string;
    pattern: string;
    description: string;
}

const PRESETS: Preset[] = [
    { name: 'Email', pattern: '[\\w.-]+@[\\w.-]+\\.\\w+', description: 'Email addresses' },
    { name: 'URL', pattern: 'https?://[^\\s]+', description: 'URLs starting with http/https' },
    { name: 'IP Address', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b', description: 'IPv4 addresses' },
    { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-.\\s]?\\d{3}[-.\\s]?\\d{4}', description: 'US phone numbers' },
    { name: 'Hex Color', pattern: '#[0-9a-fA-F]{3,8}', description: 'Hex color codes' },
    { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', description: 'ISO date format' },
    { name: 'HTML Tag', pattern: '<[^>]+>', description: 'HTML tags' },
    { name: 'Quoted String', pattern: '"[^"]*"|\'[^\']*\'', description: 'Single or double quoted strings' },
];

interface PresetsDropdownProps {
    onSelect: (pattern: string) => void;
}

/**
 * PresetsDropdown Component
 *
 * Dropdown menu of common regex patterns for quick selection.
 */
export default function PresetsDropdown({ onSelect }: PresetsDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-sm hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                title="Common regex presets"
                aria-label="Open regex presets"
            >
                Presets
                <svg
                    className={`inline-block ml-1 w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
                    <div className="px-3 py-2 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-600">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Common Patterns
                        </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                        {PRESETS.map((preset) => (
                            <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                    onSelect(preset.pattern);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2.5 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-100 dark:border-slate-700/50 last:border-b-0"
                                title={`Use ${preset.name} pattern`}
                            >
                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {preset.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    {preset.description}
                                </div>
                                <div className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                                    {preset.pattern}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
