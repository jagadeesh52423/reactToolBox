'use client';

import { forwardRef } from 'react';
import { JSONValue, JsonPath, SearchOptions, JsonTreeViewRef } from '../models/JsonModels';
import SearchControls from './SearchControls';
import JsonTreeView from './JsonTreeView';

interface JsonViewerPanelProps {
    parsedJson: JSONValue | null;
    error: string | null;
    searchOptions: SearchOptions;
    onSearchTextChange: (text: string) => void;
    onSearchLevelChange: (level: string) => void;
    onFilterToggle: (enabled: boolean) => void;
    onFuzzyToggle: (enabled: boolean) => void;
    onSearch: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onDelete: (path: JsonPath) => void;
    onUpdate: (path: JsonPath, value: JSONValue) => void;
}

/**
 * JsonViewerPanel Component
 *
 * Right panel containing the interactive JSON tree viewer and search controls.
 * Single responsibility - displays JSON tree and handles navigation.
 */
const JsonViewerPanel = forwardRef<JsonTreeViewRef, JsonViewerPanelProps>(
    (
        {
            parsedJson,
            error,
            searchOptions,
            onSearchTextChange,
            onSearchLevelChange,
            onFilterToggle,
            onFuzzyToggle,
            onSearch,
            onExpandAll,
            onCollapseAll,
            onDelete,
            onUpdate
        },
        ref
    ) => {
        return (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        JSON Viewer
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={onExpandAll}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors"
                        >
                            Expand All
                        </button>
                        <button
                            onClick={onCollapseAll}
                            className="px-3 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm transition-colors"
                        >
                            Collapse All
                        </button>
                    </div>
                </div>

                {/* Search Controls */}
                <SearchControls
                    searchOptions={searchOptions}
                    onSearchTextChange={onSearchTextChange}
                    onSearchLevelChange={onSearchLevelChange}
                    onFilterToggle={onFilterToggle}
                    onFuzzyToggle={onFuzzyToggle}
                    onSearch={onSearch}
                />

                {/* Tree View */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-auto bg-white dark:bg-gray-900 h-[calc(100vh-18rem)]">
                    {parsedJson ? (
                        <JsonTreeView
                            ref={ref}
                            data={parsedJson}
                            searchOptions={searchOptions}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            {error ? 'Fix JSON errors to view' : 'Enter valid JSON to visualize'}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

JsonViewerPanel.displayName = 'JsonViewerPanel';
export default JsonViewerPanel;
