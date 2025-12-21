'use client';

import { SearchOptions } from '../models/JsonModels';
import { SearchIcon, XIcon, FilterIcon, LayersIcon } from './Icons';

interface SearchControlsProps {
    searchOptions: SearchOptions;
    matchCount: number;
    onSearchTextChange: (text: string) => void;
    onSearchLevelChange: (level: string) => void;
    onFilterToggle: (enabled: boolean) => void;
    onFuzzyToggle: (enabled: boolean) => void;
    onCaseSensitiveToggle: (enabled: boolean) => void;
    onRegexToggle: (enabled: boolean) => void;
    onKeysOnlyToggle: (enabled: boolean) => void;
    onSearch: () => void;
}

/**
 * SearchControls Component - Professional Redesign
 *
 * Features:
 * - Integrated search bar with icon
 * - Toggle switches for options
 * - Level selector dropdown
 * - Match count display
 */
export default function SearchControls({
    searchOptions,
    matchCount,
    onSearchTextChange,
    onSearchLevelChange,
    onFilterToggle,
    onFuzzyToggle,
    onCaseSensitiveToggle,
    onRegexToggle,
    onKeysOnlyToggle,
    onSearch
}: SearchControlsProps) {
    const { searchText, searchLevel, isFilterEnabled, isFuzzyEnabled, isCaseSensitive, isRegexEnabled, isKeysOnly, regexError } = searchOptions;

    const handleClear = () => {
        onSearchTextChange('');
    };

    return (
        <div className="p-3 bg-gray-100/30 dark:bg-slate-800/30 border-b border-gray-200/50 dark:border-slate-700/50">
            {/* Search Input Row */}
            <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <div className={`absolute left-3 top-1/2 -translate-y-1/2 ${regexError ? 'text-red-500' : 'text-gray-400 dark:text-slate-500'}`}>
                        <SearchIcon size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => onSearchTextChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                        placeholder="Search keys and values..."
                        className={`w-full pl-10 pr-10 py-2.5 bg-white/50 dark:bg-slate-900/50 border rounded-lg text-gray-800 dark:text-slate-200 text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none transition-all ${
                            regexError
                                ? 'border-red-400 dark:border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/25'
                                : 'border-gray-300/50 dark:border-slate-600/50 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25'
                        }`}
                    />
                    {searchText && (
                        <button
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <XIcon size={16} />
                        </button>
                    )}
                </div>

                {/* Level Selector */}
                <div className="relative">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">
                        <LayersIcon size={14} />
                    </div>
                    <select
                        value={searchLevel ?? ''}
                        onChange={(e) => onSearchLevelChange(e.target.value)}
                        className="appearance-none pl-8 pr-8 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-gray-300/50 dark:border-slate-600/50 rounded-lg text-gray-700 dark:text-slate-300 text-sm focus:outline-none focus:border-indigo-500/50 cursor-pointer"
                        title="Filter by nesting level"
                    >
                        <option value="">All levels</option>
                        <option value="1">Level 1</option>
                        <option value="2">Level 2</option>
                        <option value="3">Level 3</option>
                        <option value="4">Level 4</option>
                        <option value="5">Level 5+</option>
                    </select>
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>
                </div>

                {/* Search Button */}
                <button
                    onClick={onSearch}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <SearchIcon size={16} />
                    <span>Search</span>
                </button>
            </div>

            {/* Regex Error Message */}
            {regexError && (
                <div className="mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>{regexError}</span>
                    </p>
                </div>
            )}

            {/* Options Row */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Match Case Toggle */}
                    <button
                        onClick={() => onCaseSensitiveToggle(!isCaseSensitive)}
                        className={`
                            px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all
                            ${isCaseSensitive
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/40'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                            }
                        `}
                        title="Match Case: Enable case-sensitive search. Works with Regex and Keys Only modes."
                    >
                        <span className="font-mono">Aa</span>
                    </button>

                    {/* Regex Toggle */}
                    <button
                        onClick={() => onRegexToggle(!isRegexEnabled)}
                        className={`
                            px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all
                            ${isRegexEnabled
                                ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/40'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                            }
                        `}
                        title="Regex: Use regular expression patterns (e.g., ^user.*, [0-9]+). Combine with Match Case for case-sensitive regex. Disables Fuzzy mode."
                    >
                        <span className="font-mono">.*</span>
                    </button>

                    {/* Keys Only Toggle */}
                    <button
                        onClick={() => onKeysOnlyToggle(!isKeysOnly)}
                        className={`
                            px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all
                            ${isKeysOnly
                                ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/40'
                                : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                            }
                        `}
                        title="Keys Only: Search only property names, ignore values. Works with all other modes."
                    >
                        <span className="font-mono">{'{k}'}</span>
                    </button>

                    <div className="w-px h-5 bg-gray-300 dark:bg-slate-600" />

                    {/* Fuzzy Toggle */}
                    <label
                        className="flex items-center gap-2 cursor-pointer group"
                        title="Fuzzy: Matches typos (e.g., 'emial' finds 'email') and subsequences (e.g., 'usr' finds 'user'). Cannot be combined with Regex mode."
                    >
                        <div
                            className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
                                isFuzzyEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-600'
                            }`}
                            onClick={() => onFuzzyToggle(!isFuzzyEnabled)}
                        >
                            <div
                                className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${
                                    isFuzzyEnabled ? 'translate-x-4' : 'translate-x-0.5'
                                }`}
                            />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-colors">
                            Fuzzy
                        </span>
                    </label>

                    {/* Filter Toggle */}
                    <label
                        className="flex items-center gap-2 cursor-pointer group"
                        title="Filter: Hides all non-matching branches from view. Only nodes containing matches remain visible. Works with all search modes."
                    >
                        <div
                            className={`relative w-8 h-4 rounded-full transition-colors duration-200 ${
                                isFilterEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                            }`}
                            onClick={() => onFilterToggle(!isFilterEnabled)}
                        >
                            <div
                                className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform duration-200 ${
                                    isFilterEnabled ? 'translate-x-4' : 'translate-x-0.5'
                                }`}
                            />
                        </div>
                        <FilterIcon size={12} className={isFilterEnabled ? 'text-blue-400' : 'text-gray-400 dark:text-slate-500'} />
                        <span className="text-xs text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-colors">
                            Filter
                        </span>
                    </label>
                </div>

                {/* Match Count */}
                {searchText && !regexError && (
                    <div className="text-sm text-gray-500 dark:text-slate-500">
                        <span className="text-gray-700 dark:text-slate-300 font-medium">{matchCount}</span>
                        {' '}match{matchCount !== 1 ? 'es' : ''} found
                    </div>
                )}
            </div>
        </div>
    );
}
