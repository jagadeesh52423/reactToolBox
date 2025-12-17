'use client';

import { SearchOptions } from '../models/JsonModels';

interface SearchControlsProps {
    searchOptions: SearchOptions;
    onSearchTextChange: (text: string) => void;
    onSearchLevelChange: (level: string) => void;
    onFilterToggle: (enabled: boolean) => void;
    onFuzzyToggle: (enabled: boolean) => void;
    onSearch: () => void;
}

/**
 * SearchControls Component
 *
 * Provides search input and options for filtering JSON tree.
 * Single responsibility - handles search UI only.
 */
export default function SearchControls({
    searchOptions,
    onSearchTextChange,
    onSearchLevelChange,
    onFilterToggle,
    onFuzzyToggle,
    onSearch
}: SearchControlsProps) {
    const { searchText, searchLevel, isFilterEnabled, isFuzzyEnabled } = searchOptions;

    return (
        <div className="mb-3 bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
            {/* Search Inputs */}
            <div className="flex gap-2 items-center flex-wrap">
                <input
                    type="text"
                    value={searchText}
                    onChange={(e) => onSearchTextChange(e.target.value)}
                    placeholder="Search keys and values..."
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1.5 rounded flex-grow min-w-[160px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                />
                <input
                    type="number"
                    value={searchLevel ?? ''}
                    onChange={(e) => onSearchLevelChange(e.target.value)}
                    placeholder="Level"
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 p-1.5 rounded w-20 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-gray-100"
                    min="1"
                    title="Filter by nesting level (1 = root)"
                />
                <button
                    onClick={onSearch}
                    className="px-3 py-1.5 bg-green-500 text-white rounded hover:bg-green-600 text-sm transition-colors"
                >
                    Search
                </button>
            </div>

            {/* Search Options */}
            <div className="flex gap-4 items-center text-sm flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isFilterEnabled}
                        onChange={(e) => onFilterToggle(e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                        Filter (hide non-matching)
                    </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isFuzzyEnabled}
                        onChange={(e) => onFuzzyToggle(e.target.checked)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                        Fuzzy search (e.g. &quot;apl&quot; → &quot;apple&quot;)
                    </span>
                </label>
            </div>
        </div>
    );
}
