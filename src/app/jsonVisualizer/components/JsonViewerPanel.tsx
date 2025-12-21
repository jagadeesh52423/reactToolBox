'use client';

import { forwardRef } from 'react';
import { JSONValue, JsonPath, SearchOptions, JsonTreeViewRef } from '../models/JsonModels';
import SearchControls from './SearchControls';
import JsonTreeView from './JsonTreeView';
import { ExpandIcon, CollapseIcon, BracesIcon } from './Icons';

interface JsonViewerPanelProps {
    parsedJson: JSONValue | null;
    error: string | null;
    searchOptions: SearchOptions;
    onSearchTextChange: (text: string) => void;
    onSearchLevelChange: (level: string) => void;
    onFilterToggle: (enabled: boolean) => void;
    onFuzzyToggle: (enabled: boolean) => void;
    onCaseSensitiveToggle: (enabled: boolean) => void;
    onRegexToggle: (enabled: boolean) => void;
    onSearch: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onDelete: (path: JsonPath) => void;
    onUpdate: (path: JsonPath, value: JSONValue) => void;
}

/**
 * JsonViewerPanel Component - Professional Redesign
 *
 * Right panel containing the interactive JSON tree viewer and search controls.
 * Features modern styling, integrated search, and tree controls.
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
            onCaseSensitiveToggle,
            onRegexToggle,
            onSearch,
            onExpandAll,
            onCollapseAll,
            onDelete,
            onUpdate
        },
        ref
    ) => {
        return (
            <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                        <span className="ml-3 text-sm font-medium text-gray-600 dark:text-slate-300">JSON Viewer</span>
                    </div>

                    {/* Tree Controls */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={onExpandAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-gray-100/50 dark:bg-slate-700/30 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 border border-gray-300/30 dark:border-slate-600/30 transition-all duration-200"
                            title="Expand all nodes"
                        >
                            <ExpandIcon size={14} />
                            <span className="text-sm">Expand</span>
                        </button>
                        <button
                            onClick={onCollapseAll}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-gray-100/50 dark:bg-slate-700/30 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 border border-gray-300/30 dark:border-slate-600/30 transition-all duration-200"
                            title="Collapse all nodes"
                        >
                            <CollapseIcon size={14} />
                            <span className="text-sm">Collapse</span>
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
                    onCaseSensitiveToggle={onCaseSensitiveToggle}
                    onRegexToggle={onRegexToggle}
                    onSearch={onSearch}
                />

                {/* Tree View */}
                <div className="flex-1 overflow-auto p-4">
                    {parsedJson !== null ? (
                        <JsonTreeView
                            ref={ref}
                            data={parsedJson}
                            searchOptions={searchOptions}
                            onDelete={onDelete}
                            onUpdate={onUpdate}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500">
                            <BracesIcon size={48} className="mb-4 opacity-30" />
                            <p className="text-lg font-medium">
                                {error ? 'Fix JSON errors to view' : 'No JSON to display'}
                            </p>
                            <p className="text-sm mt-1 text-gray-500 dark:text-slate-600">
                                {error ? 'Check the input panel for error details' : 'Paste or import JSON in the input panel'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

JsonViewerPanel.displayName = 'JsonViewerPanel';
export default JsonViewerPanel;
