'use client';

import { SearchOptions } from '../models/JsonModels';
import { SearchIcon, XIcon, FilterIcon, LayersIcon } from './Icons';

interface SearchControlsProps {
    searchOptions: SearchOptions;
    onSearchTextChange: (text: string) => void;
    onSearchLevelChange: (level: string) => void;
    onFilterToggle: (enabled: boolean) => void;
    onFuzzyToggle: (enabled: boolean) => void;
    onSearch: () => void;
    matchCount?: number;
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
    onSearchTextChange,
    onSearchLevelChange,
    onFilterToggle,
    onFuzzyToggle,
    onSearch,
    matchCount
}: SearchControlsProps) {
    const { searchText, searchLevel, isFilterEnabled, isFuzzyEnabled } = searchOptions;

    const handleClear = () => {
        onSearchTextChange('');
    };

    return (
        <div className="p-3 bg-gray-100/30 dark:bg-slate-800/30 border-b border-gray-200/50 dark:border-slate-700/50">
            {/* Search Input Row */}
            <div className="flex items-center gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
                        <SearchIcon size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchText}
                        onChange={(e) => onSearchTextChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                        placeholder="Search keys and values..."
                        className="w-full pl-10 pr-10 py-2.5 bg-white/50 dark:bg-slate-900/50 border border-gray-300/50 dark:border-slate-600/50 rounded-lg text-gray-800 dark:text-slate-200 text-sm placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25 transition-all"
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

            {/* Options Row */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4">
                    {/* Fuzzy Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div
                            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                                isFuzzyEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-slate-600'
                            }`}
                            onClick={() => onFuzzyToggle(!isFuzzyEnabled)}
                        >
                            <div
                                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                                    isFuzzyEnabled ? 'translate-x-4' : 'translate-x-0.5'
                                }`}
                            />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-colors">
                            Fuzzy search
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-600">
                            (e.g. &quot;apl&quot; → &quot;apple&quot;)
                        </span>
                    </label>

                    {/* Filter Toggle */}
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div
                            className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${
                                isFilterEnabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                            }`}
                            onClick={() => onFilterToggle(!isFilterEnabled)}
                        >
                            <div
                                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                                    isFilterEnabled ? 'translate-x-4' : 'translate-x-0.5'
                                }`}
                            />
                        </div>
                        <FilterIcon size={14} className={isFilterEnabled ? 'text-blue-400' : 'text-gray-400 dark:text-slate-500'} />
                        <span className="text-sm text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-300 transition-colors">
                            Filter results
                        </span>
                    </label>
                </div>

                {/* Match Count */}
                {searchText && matchCount !== undefined && (
                    <div className="text-sm text-gray-500 dark:text-slate-500">
                        <span className="text-gray-700 dark:text-slate-300 font-medium">{matchCount}</span>
                        {' '}match{matchCount !== 1 ? 'es' : ''} found
                    </div>
                )}
            </div>
        </div>
    );
}
