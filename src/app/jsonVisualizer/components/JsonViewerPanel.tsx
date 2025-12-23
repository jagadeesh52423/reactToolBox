'use client';

import { forwardRef } from 'react';
import { JSONValue, JsonPath, SearchOptions, JsonTreeViewRef } from '../models/JsonModels';
import SearchControls from './SearchControls';
import JsonTreeView from './JsonTreeView';
import { ExpandIcon, CollapseIcon, BracesIcon } from './Icons';
import PanelHeader from '@/components/common/PanelHeader';

interface JsonViewerPanelProps {
    parsedJson: JSONValue | null;
    error: string | null;
    searchOptions: SearchOptions;
    matchCount: number;
    isEditorVisible: boolean;
    onSearchTextChange: (text: string) => void;
    onSearchLevelChange: (level: string) => void;
    onFilterToggle: (enabled: boolean) => void;
    onFuzzyToggle: (enabled: boolean) => void;
    onCaseSensitiveToggle: (enabled: boolean) => void;
    onRegexToggle: (enabled: boolean) => void;
    onKeysOnlyToggle: (enabled: boolean) => void;
    onSearch: () => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onDelete: (path: JsonPath) => void;
    onUpdate: (path: JsonPath, value: JSONValue) => void;
    onToggleEditorVisibility: () => void;
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
            matchCount,
            isEditorVisible,
            onSearchTextChange,
            onSearchLevelChange,
            onFilterToggle,
            onFuzzyToggle,
            onCaseSensitiveToggle,
            onRegexToggle,
            onKeysOnlyToggle,
            onSearch,
            onExpandAll,
            onCollapseAll,
            onDelete,
            onUpdate,
            onToggleEditorVisibility
        },
        ref
    ) => {
        return (
            <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
                {/* Header */}
                <PanelHeader title="JSON Viewer">
                    {/* Show Editor Button (only when editor is hidden) */}
                    {!isEditorVisible && (
                        <button
                            onClick={onToggleEditorVisibility}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-600/20 hover:bg-indigo-200/50 dark:hover:bg-indigo-600/40 border border-indigo-300/30 dark:border-indigo-500/30 transition-all duration-200 mr-1"
                            title="Show editor"
                        >
                            <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="text-sm">Show Editor</span>
                        </button>
                    )}

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
                </PanelHeader>

                {/* Search Controls */}
                <SearchControls
                    searchOptions={searchOptions}
                    matchCount={matchCount}
                    onSearchTextChange={onSearchTextChange}
                    onSearchLevelChange={onSearchLevelChange}
                    onFilterToggle={onFilterToggle}
                    onFuzzyToggle={onFuzzyToggle}
                    onCaseSensitiveToggle={onCaseSensitiveToggle}
                    onRegexToggle={onRegexToggle}
                    onKeysOnlyToggle={onKeysOnlyToggle}
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
