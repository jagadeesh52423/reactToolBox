'use client';

import { forwardRef, useImperativeHandle, useState, useRef, useEffect, useCallback } from 'react';
import { JSONValue, JsonPath, SearchOptions, JsonTreeViewRef } from '../models/JsonModels';
import { getJsonParserService } from '../services/JsonParserService';
import { getJsonSearchService } from '../services/JsonSearchService';
import JsonPrimitiveEditor from './JsonPrimitiveEditor';

interface JsonTreeViewProps {
    data: JSONValue;
    level?: number;
    path?: JsonPath;
    searchOptions: SearchOptions;
    onDelete: (path: JsonPath) => void;
    onUpdate: (path: JsonPath, value: JSONValue) => void;
}

/**
 * JsonTreeView Component
 *
 * Recursive component that renders JSON data as an interactive tree.
 * Supports expand/collapse, search highlighting, filtering, and inline editing.
 */
const JsonTreeView = forwardRef<JsonTreeViewRef, JsonTreeViewProps>(
    ({ data, level = 1, path = [], searchOptions, onDelete, onUpdate }, ref) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const [isHighlighted, setIsHighlighted] = useState(false);
        const [isFiltered, setIsFiltered] = useState(false);

        const childrenRefs = useRef<{ [key: string]: JsonTreeViewRef }>({});
        const nodeRef = useRef<HTMLDivElement>(null);
        const isFirstRender = useRef(true);

        const parserService = getJsonParserService();
        const searchService = getJsonSearchService();

        // Reset refs when data changes
        useEffect(() => {
            childrenRefs.current = {};
            isFirstRender.current = true;
            return () => {
                childrenRefs.current = {};
            };
        }, [data]);

        // Expand subtree
        const expandSubtree = useCallback(async (): Promise<void> => {
            if (!parserService.hasChildren(data)) return;

            setIsExpanded(true);
            await new Promise(resolve => setTimeout(resolve, 50));

            const expandPromises = Object.values(childrenRefs.current).map(async (childRef) => {
                if (childRef?.expandAll) {
                    try {
                        await childRef.expandAll();
                    } catch (error) {
                        console.error('Error expanding child:', error);
                    }
                }
            });

            await Promise.all(expandPromises);

            // Handle first render edge case
            if (isFirstRender.current) {
                isFirstRender.current = false;
                await new Promise(resolve => setTimeout(resolve, 50));
                await Promise.all(
                    Object.values(childrenRefs.current).map(childRef => childRef?.expandAll())
                );
            }
        }, [data, parserService]);

        // Collapse subtree
        const collapseSubtree = useCallback(async (): Promise<void> => {
            setIsExpanded(false);
            Object.values(childrenRefs.current).forEach(childRef => {
                if (childRef?.collapseAll) {
                    childRef.collapseAll();
                }
            });
        }, []);

        // Search handler
        const performSearch = useCallback((options: SearchOptions) => {
            const { searchText, searchLevel, isFilterEnabled, isFuzzyEnabled } = options;

            if (!searchText) {
                // Clear highlights and filters
                setIsHighlighted(false);
                setIsFiltered(false);
                Object.values(childrenRefs.current).forEach(childRef => {
                    if (childRef?.search) {
                        childRef.search(options);
                    }
                });
                return;
            }

            // Check if this node has any matches in its subtree
            const hasAnyMatch = searchService.deepSearch(data, searchText, isFuzzyEnabled);

            // Check if this specific node should be highlighted
            const shouldHighlight = searchService.shouldHighlight(data, level, options);

            if (shouldHighlight) {
                setIsExpanded(true);
                setIsHighlighted(true);
                // Scroll into view
                if (nodeRef.current) {
                    nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                setIsHighlighted(false);
            }

            // Handle filtering
            if (isFilterEnabled) {
                setIsFiltered(!hasAnyMatch);
            } else {
                setIsFiltered(false);
            }

            // Expand if contains matches
            if (hasAnyMatch && typeof data === 'object' && data !== null) {
                setIsExpanded(true);
            }

            // Recursively search children
            if (typeof data === 'object' && data !== null) {
                Object.entries(data).forEach(([key]) => {
                    const childRef = childrenRefs.current[key];
                    if (childRef?.search) {
                        // If key matches, don't filter its immediate children
                        const keyMatches = searchService.matches(searchText, key, isFuzzyEnabled);
                        const childOptions = keyMatches
                            ? { ...options, isFilterEnabled: false }
                            : options;
                        childRef.search(childOptions);
                    }
                });
            }
        }, [data, level, searchService]);

        // Expose methods via ref
        useImperativeHandle(ref, () => ({
            expandAll: () => expandSubtree(),
            collapseAll: () => collapseSubtree(),
            search: (options: SearchOptions) => performSearch(options)
        }));

        // Toggle current level only
        const toggleCurrentLevel = () => {
            setIsExpanded(!isExpanded);
        };

        // Copy subtree as JSON
        const copySubtree = () => {
            try {
                const json = JSON.stringify(data, null, 2);
                navigator.clipboard.writeText(json);
                // Visual feedback via highlight
                setIsHighlighted(true);
                setTimeout(() => setIsHighlighted(false), 300);
            } catch (error) {
                console.error('Failed to copy:', error);
            }
        };

        // Copy path
        const handleCopyPath = (key: string) => {
            const fullPath = [...path, key].join('.');
            navigator.clipboard.writeText(fullPath);
        };

        // Don't render if filtered out
        if (isFiltered) {
            return null;
        }

        // Render primitive values
        if (parserService.isPrimitive(data)) {
            return (
                <JsonPrimitiveEditor
                    value={data}
                    isHighlighted={isHighlighted}
                    onUpdate={(newValue) => onUpdate(path, newValue)}
                />
            );
        }

        const isArray = Array.isArray(data);
        const items = Object.entries(data as Record<string, JSONValue>);
        const typeStyle = parserService.getTypeStyle(data);

        return (
            <div
                ref={nodeRef}
                style={{ marginLeft: level * 8 }}
                className={`relative ${isHighlighted ? 'bg-yellow-200 dark:bg-yellow-800 rounded px-1' : ''}`}
            >
                {/* Node Header */}
                <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 py-1 px-1 rounded flex items-center gap-1">
                    <button
                        onClick={toggleCurrentLevel}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                toggleCurrentLevel();
                            }
                        }}
                        className="w-4 h-4 inline-flex items-center justify-center text-gray-500 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                        title={isExpanded ? 'Collapse (Enter/Space)' : 'Expand (Enter/Space)'}
                        tabIndex={0}
                    >
                        {isExpanded ? '▼' : '▶'}
                    </button>

                    <div className="flex-grow flex items-center gap-1">
                        <span className="font-mono">{isArray ? '[' : '{'}</span>
                        {!isExpanded && (
                            <>
                                <span className="opacity-50 text-sm">
                                    {items.length} {items.length === 1 ? 'item' : 'items'}
                                </span>
                                <span className="font-mono">{isArray ? ']' : '}'}</span>
                            </>
                        )}
                        <span
                            className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded opacity-70"
                            title={typeStyle.label}
                        >
                            {typeStyle.icon}
                        </span>
                    </div>

                    {/* Control Buttons */}
                    {parserService.hasChildren(data) && (
                        <div className="flex items-center space-x-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    expandSubtree();
                                }}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-800 text-blue-600"
                                title="Expand all"
                            >
                                <span className="text-lg">⊞</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    collapseSubtree();
                                }}
                                className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600"
                                title="Collapse all"
                            >
                                <span className="text-lg">⊟</span>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    copySubtree();
                                }}
                                className="px-2 py-0.5 text-xs bg-cyan-500 text-white rounded hover:bg-cyan-600"
                                title="Copy this subtree as JSON"
                            >
                                Copy
                            </button>
                        </div>
                    )}
                </div>

                {/* Children */}
                {isExpanded && (
                    <div className="py-0.5 border-l-2 border-gray-200 dark:border-gray-700 my-1">
                        {items.map(([key, value]) => {
                            // Check if item should be visible when filtering
                            if (!searchService.shouldItemBeVisible(key, value, searchOptions)) {
                                return null;
                            }

                            return (
                                <div
                                    key={key}
                                    className="flex items-start gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded py-1 px-2 group"
                                >
                                    {/* Delete Button */}
                                    <div className="flex items-center gap-1 min-w-[24px]">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete([...path, key]);
                                            }}
                                            className="text-red-500 hover:text-red-700 text-xs w-6 h-6 flex items-center justify-center opacity-50 hover:opacity-100 rounded-full hover:bg-red-100 dark:hover:bg-red-900"
                                            title="Delete this item"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    {/* Key and Value */}
                                    <div className="flex items-center gap-1 flex-grow">
                                        <button
                                            onClick={() => handleCopyPath(key)}
                                            className="text-blue-500 hover:text-blue-700 text-xs opacity-50 hover:opacity-100"
                                            title="Copy path"
                                        >
                                            &#128203;
                                        </button>
                                        <span className={`${isArray ? 'text-gray-500' : 'text-blue-600'} font-medium`}>
                                            {isArray ? `[${key}]` : key}:
                                        </span>
                                        <JsonTreeView
                                            ref={(r) => {
                                                if (r) {
                                                    childrenRefs.current[key] = r;
                                                }
                                            }}
                                            data={value}
                                            level={level + 1}
                                            path={[...path, key]}
                                            searchOptions={searchOptions}
                                            onDelete={onDelete}
                                            onUpdate={onUpdate}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        <div className="ml-2 font-mono py-1">
                            {isArray ? ']' : '}'}
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

JsonTreeView.displayName = 'JsonTreeView';
export default JsonTreeView;
