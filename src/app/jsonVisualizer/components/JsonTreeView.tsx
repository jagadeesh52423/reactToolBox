'use client';

import { forwardRef, useImperativeHandle, useState, useRef, useEffect, useCallback } from 'react';
import { JSONValue, JsonPath, SearchOptions, JsonTreeViewRef, JsonValueType } from '../models/JsonModels';
import { getJsonParserService } from '../services/JsonParserService';
import { getJsonSearchService } from '../services/JsonSearchService';
import JsonPrimitiveEditor from './JsonPrimitiveEditor';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    ExpandIcon,
    CollapseIcon,
    ClipboardIcon,
    TrashIcon,
    BracesIcon,
    BracketsIcon
} from './Icons';

interface JsonTreeViewProps {
    data: JSONValue;
    level?: number;
    path?: JsonPath;
    searchOptions: SearchOptions;
    onDelete: (path: JsonPath) => void;
    onUpdate: (path: JsonPath, value: JSONValue) => void;
}

/**
 * JsonTreeView Component - Professional Redesign
 *
 * Features:
 * - Smooth animations on expand/collapse
 * - Professional connector lines
 * - Type-colored badges
 * - Hover actions with icons
 * - Visual hierarchy with indentation
 */
const JsonTreeView = forwardRef<JsonTreeViewRef, JsonTreeViewProps>(
    ({ data, level = 1, path = [], searchOptions, onDelete, onUpdate }, ref) => {
        const [isExpanded, setIsExpanded] = useState(level === 1);
        const [isHighlighted, setIsHighlighted] = useState(false);
        const [isFiltered, setIsFiltered] = useState(false);
        const [showCopied, setShowCopied] = useState(false);

        const childrenRefs = useRef<{ [key: string]: JsonTreeViewRef }>({});
        const nodeRef = useRef<HTMLDivElement>(null);
        const isFirstRender = useRef(true);

        const parserService = getJsonParserService();
        const searchService = getJsonSearchService();

        useEffect(() => {
            childrenRefs.current = {};
            isFirstRender.current = true;
            return () => {
                childrenRefs.current = {};
            };
        }, [data]);

        const expandSubtree = useCallback(async (): Promise<void> => {
            if (!parserService.hasChildren(data)) return;
            setIsExpanded(true);
            await new Promise(resolve => setTimeout(resolve, 30));

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

            if (isFirstRender.current) {
                isFirstRender.current = false;
                await new Promise(resolve => setTimeout(resolve, 30));
                await Promise.all(
                    Object.values(childrenRefs.current).map(childRef => childRef?.expandAll())
                );
            }
        }, [data, parserService]);

        const collapseSubtree = useCallback(async (): Promise<void> => {
            setIsExpanded(false);
            Object.values(childrenRefs.current).forEach(childRef => {
                if (childRef?.collapseAll) {
                    childRef.collapseAll();
                }
            });
        }, []);

        const performSearch = useCallback((options: SearchOptions) => {
            const { searchText, isFilterEnabled, isFuzzyEnabled } = options;

            if (!searchText) {
                setIsHighlighted(false);
                setIsFiltered(false);
                Object.values(childrenRefs.current).forEach(childRef => {
                    if (childRef?.search) {
                        childRef.search(options);
                    }
                });
                return;
            }

            const hasAnyMatch = searchService.deepSearch(data, searchText, isFuzzyEnabled);
            const shouldHighlight = searchService.shouldHighlight(data, level, options);

            if (shouldHighlight) {
                setIsExpanded(true);
                setIsHighlighted(true);
                if (nodeRef.current) {
                    nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                setIsHighlighted(false);
            }

            if (isFilterEnabled) {
                setIsFiltered(!hasAnyMatch);
            } else {
                setIsFiltered(false);
            }

            if (hasAnyMatch && typeof data === 'object' && data !== null) {
                setIsExpanded(true);
            }

            if (typeof data === 'object' && data !== null) {
                Object.entries(data).forEach(([key]) => {
                    const childRef = childrenRefs.current[key];
                    if (childRef?.search) {
                        const keyMatches = searchService.matches(searchText, key, isFuzzyEnabled);
                        const childOptions = keyMatches
                            ? { ...options, isFilterEnabled: false }
                            : options;
                        childRef.search(childOptions);
                    }
                });
            }
        }, [data, level, searchService]);

        useImperativeHandle(ref, () => ({
            expandAll: () => expandSubtree(),
            collapseAll: () => collapseSubtree(),
            search: (options: SearchOptions) => performSearch(options)
        }));

        const toggleCurrentLevel = () => {
            setIsExpanded(!isExpanded);
        };

        const copySubtree = () => {
            try {
                const json = JSON.stringify(data, null, 2);
                navigator.clipboard.writeText(json);
                setShowCopied(true);
                setTimeout(() => setShowCopied(false), 1500);
            } catch (error) {
                console.error('Failed to copy:', error);
            }
        };

        const handleCopyPath = (key: string) => {
            const fullPath = [...path, key].join('.');
            navigator.clipboard.writeText(fullPath);
        };

        if (isFiltered) {
            return null;
        }

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
        const itemCount = items.length;

        // Get type badge color
        const getBadgeColor = () => {
            if (typeStyle.type === JsonValueType.ARRAY) {
                return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            }
            return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
        };

        return (
            <div
                ref={nodeRef}
                className={`relative ${level > 1 ? 'ml-4' : ''}`}
            >
                {/* Node Header */}
                <div
                    className={`
                        flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer
                        transition-all duration-150 group
                        ${isHighlighted
                            ? 'bg-yellow-500/20 ring-1 ring-yellow-500/40'
                            : 'hover:bg-gray-200/50 dark:hover:bg-slate-700/30'
                        }
                    `}
                    onClick={toggleCurrentLevel}
                >
                    {/* Expand/Collapse Icon */}
                    <button
                        className={`
                            w-5 h-5 flex items-center justify-center rounded
                            text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-300/50 dark:hover:bg-slate-600/50
                            transition-all duration-200
                        `}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleCurrentLevel();
                        }}
                    >
                        <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                            <ChevronDownIcon size={14} />
                        </div>
                    </button>

                    {/* Type Icon */}
                    <div className="text-gray-400 dark:text-slate-500">
                        {isArray ? <BracketsIcon size={14} /> : <BracesIcon size={14} />}
                    </div>

                    {/* Bracket and Preview */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-mono text-gray-500 dark:text-slate-400">
                            {isArray ? '[' : '{'}
                        </span>

                        {!isExpanded && (
                            <span className="text-gray-400 dark:text-slate-500 text-sm truncate">
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                        )}

                        {!isExpanded && (
                            <span className="font-mono text-gray-500 dark:text-slate-400">
                                {isArray ? ']' : '}'}
                            </span>
                        )}

                        {/* Type Badge */}
                        <span className={`
                            px-1.5 py-0.5 text-xs font-medium rounded border
                            ${getBadgeColor()}
                        `}>
                            {isArray ? 'Array' : 'Object'}
                        </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                expandSubtree();
                            }}
                            className="p-1 rounded text-gray-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="Expand all"
                        >
                            <ExpandIcon size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                collapseSubtree();
                            }}
                            className="p-1 rounded text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-300/50 dark:hover:bg-slate-600/50 transition-colors"
                            title="Collapse all"
                        >
                            <CollapseIcon size={14} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                copySubtree();
                            }}
                            className={`
                                p-1 rounded transition-colors
                                ${showCopied
                                    ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10'
                                    : 'text-gray-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10'
                                }
                            `}
                            title="Copy subtree"
                        >
                            <ClipboardIcon size={14} />
                        </button>
                    </div>
                </div>

                {/* Children */}
                {isExpanded && (
                    <div className="relative ml-3 mt-1">
                        {/* Connector Line */}
                        <div className="absolute left-0 top-0 bottom-4 w-px bg-gradient-to-b from-gray-300/50 dark:from-slate-600/50 to-transparent" />

                        {items.map(([key, value], index) => {
                            if (!searchService.shouldItemBeVisible(key, value, searchOptions)) {
                                return null;
                            }

                            const isLast = index === items.length - 1;
                            const childType = parserService.getValueType(value);
                            const isPrimitiveChild = parserService.isPrimitive(value);

                            return (
                                <div key={key} className="relative">
                                    {/* Horizontal Connector */}
                                    <div className="absolute left-0 top-4 w-3 h-px bg-gray-300/50 dark:bg-slate-600/50" />

                                    {/* Node Dot */}
                                    <div className="absolute left-[-2px] top-[13px] w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500" />

                                    <div className="ml-4 group/item">
                                        <div className={`
                                            flex items-center gap-2 py-1 px-2 rounded-lg
                                            transition-colors duration-150
                                            ${isPrimitiveChild ? 'hover:bg-gray-200/50 dark:hover:bg-slate-700/20' : ''}
                                        `}>
                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete([...path, key]);
                                                }}
                                                className="opacity-0 group-hover/item:opacity-100 p-1 rounded text-gray-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                title="Delete"
                                            >
                                                <TrashIcon size={12} />
                                            </button>

                                            {/* Key */}
                                            <button
                                                onClick={() => handleCopyPath(key)}
                                                className="flex items-center gap-1 group/key"
                                                title="Copy path"
                                            >
                                                <span className={`
                                                    font-medium transition-colors
                                                    ${isArray
                                                        ? 'text-gray-400 dark:text-slate-500 font-mono text-sm'
                                                        : 'text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300'
                                                    }
                                                `}>
                                                    {isArray ? `[${key}]` : key}
                                                </span>
                                                <span className="text-gray-400 dark:text-slate-600">:</span>
                                            </button>

                                            {/* Value */}
                                            <div className="flex-1 min-w-0">
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
                                    </div>
                                </div>
                            );
                        })}

                        {/* Closing Bracket */}
                        <div className="ml-4 py-1 px-2">
                            <span className="font-mono text-gray-500 dark:text-slate-400">
                                {isArray ? ']' : '}'}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

JsonTreeView.displayName = 'JsonTreeView';
export default JsonTreeView;
