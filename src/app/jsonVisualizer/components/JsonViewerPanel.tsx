'use client';

import { forwardRef } from 'react';
import { JSONValue, JsonPath, SearchOptions, JsonTreeViewRef, BreadcrumbSegment, PathSuggestion } from '../models/JsonModels';
import SearchControls from './SearchControls';
import CommandPalette from './CommandPalette';
import BreadcrumbNav from './BreadcrumbNav';
import JsonTreeView from './JsonTreeView';
import { ExpandIcon, CollapseIcon, BracesIcon } from '@/components/shared/Icons';
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
    // New optional props
    breadcrumbSegments?: BreadcrumbSegment[];
    onBreadcrumbNavigate?: (path: JsonPath) => void;
    commandPaletteOpen?: boolean;
    commandPaletteMode?: 'search' | 'filter' | 'navigate';
    onCommandPaletteClose?: () => void;
    onCommandPaletteModeChange?: (mode: 'search' | 'filter' | 'navigate') => void;
    onCommandPaletteOpen?: () => void;
    onAdd?: (parentPath: JsonPath, key: string, value: JSONValue) => void;
    focusedPath?: JsonPath | null;
    onFocusChange?: (path: JsonPath | null) => void;
    // Navigate mode props
    navigateText?: string;
    suggestions?: PathSuggestion[];
    selectedSuggestionIndex?: number;
    onNavigateTextChange?: (text: string) => void;
    onSuggestionSelect?: (path: JsonPath) => void;
    onSuggestionIndexChange?: (index: number) => void;
}

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
            onToggleEditorVisibility,
            breadcrumbSegments,
            onBreadcrumbNavigate,
            commandPaletteOpen,
            commandPaletteMode,
            onCommandPaletteClose,
            onCommandPaletteModeChange,
            onCommandPaletteOpen,
            onAdd,
            focusedPath,
            onFocusChange,
            navigateText,
            suggestions,
            selectedSuggestionIndex,
            onNavigateTextChange,
            onSuggestionSelect,
            onSuggestionIndexChange,
        },
        ref
    ) => {
        return (
            <div
                className="flex flex-col h-full rounded-xl border shadow-xl overflow-hidden"
                style={{ background: 'var(--jv-bg-panel)', borderColor: 'var(--jv-border)' }}
            >
                {/* Header */}
                <PanelHeader title="JSON Viewer">
                    {/* Show Editor Button (only when editor is hidden) */}
                    {!isEditorVisible && (
                        <button
                            onClick={onToggleEditorVisibility}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 mr-1 border"
                            style={{
                                color: 'var(--jv-accent)',
                                background: 'var(--jv-bg-active)',
                                borderColor: 'var(--jv-border)',
                            }}
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
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200"
                        style={{
                            color: 'var(--jv-text-secondary)',
                            background: 'var(--jv-bg-secondary)',
                            borderColor: 'var(--jv-border)',
                        }}
                        title="Expand all nodes"
                    >
                        <ExpandIcon size={14} />
                        <span className="text-sm">Expand</span>
                    </button>
                    <button
                        onClick={onCollapseAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200"
                        style={{
                            color: 'var(--jv-text-secondary)',
                            background: 'var(--jv-bg-secondary)',
                            borderColor: 'var(--jv-border)',
                        }}
                        title="Collapse all nodes"
                    >
                        <CollapseIcon size={14} />
                        <span className="text-sm">Collapse</span>
                    </button>
                </PanelHeader>

                {/* Breadcrumb Navigation */}
                {breadcrumbSegments && breadcrumbSegments.length > 1 && onBreadcrumbNavigate && (
                    <BreadcrumbNav
                        segments={breadcrumbSegments}
                        onNavigate={onBreadcrumbNavigate}
                    />
                )}

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
                    onOpenPalette={() => {
                        onCommandPaletteOpen?.();
                    }}
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
                            focusedPath={focusedPath}
                            onFocusChange={onFocusChange}
                            onAdd={onAdd}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full" style={{ color: 'var(--jv-text-muted)' }}>
                            <BracesIcon size={48} className="mb-4 opacity-30" />
                            <p className="text-lg font-medium">
                                {error ? 'Fix JSON errors to view' : 'No JSON to display'}
                            </p>
                            <p className="text-sm mt-1" style={{ color: 'var(--jv-text-muted)' }}>
                                {error ? 'Check the input panel for error details' : 'Paste or import JSON in the input panel'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Command Palette */}
                {commandPaletteOpen !== undefined && onCommandPaletteClose && (
                    <CommandPalette
                        isOpen={commandPaletteOpen}
                        onClose={onCommandPaletteClose}
                        searchText={searchOptions.searchText}
                        onSearchTextChange={onSearchTextChange}
                        mode={commandPaletteMode || 'search'}
                        onModeChange={(newMode) => {
                            onCommandPaletteModeChange?.(newMode);
                            // Sync filter mode with searchOptions.isFilterEnabled
                            onFilterToggle(newMode === 'filter');
                        }}
                        matchCount={matchCount}
                        searchOptions={searchOptions}
                        onSearchOptionsChange={(opts) => {
                            if (opts.isCaseSensitive !== undefined) onCaseSensitiveToggle(opts.isCaseSensitive);
                            if (opts.isRegexEnabled !== undefined) onRegexToggle(opts.isRegexEnabled);
                            if (opts.isFuzzyEnabled !== undefined) onFuzzyToggle(opts.isFuzzyEnabled);
                            if (opts.isKeysOnly !== undefined) onKeysOnlyToggle(opts.isKeysOnly);
                            if (opts.isFilterEnabled !== undefined) onFilterToggle(opts.isFilterEnabled);
                        }}
                        navigateText={navigateText}
                        suggestions={suggestions}
                        selectedSuggestionIndex={selectedSuggestionIndex}
                        onNavigateTextChange={onNavigateTextChange}
                        onSuggestionSelect={onSuggestionSelect}
                        onSuggestionIndexChange={onSuggestionIndexChange}
                    />
                )}
            </div>
        );
    }
);

JsonViewerPanel.displayName = 'JsonViewerPanel';
export default JsonViewerPanel;
