'use client';

import { forwardRef, useImperativeHandle, useState, useRef, useEffect, useCallback } from 'react';
import { JSONValue, JsonPath, SearchOptions, JsonTreeViewRef, JsonValueType } from '../models/JsonModels';
import { getJsonParserService } from '../services/JsonParserService';
import { getJsonSearchService } from '../services/JsonSearchService';
import JsonPrimitiveEditor from './JsonPrimitiveEditor';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import HighlightedText from './HighlightedText';
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

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
}

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
        // Auto-expand all levels by default
        const [isExpanded, setIsExpanded] = useState(true);
        const [isHighlighted, setIsHighlighted] = useState(false);
        const [isFiltered, setIsFiltered] = useState(false);
        const [showCopied, setShowCopied] = useState(false);
        const [contextMenu, setContextMenu] = useState<ContextMenuState>({
            visible: false,
            x: 0,
            y: 0,
            items: []
        });

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
            const { searchText, isFilterEnabled, isFuzzyEnabled, isCaseSensitive, isRegexEnabled, isKeysOnly } = options;

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

            const hasAnyMatch = searchService.deepSearch(data, searchText, isFuzzyEnabled, isCaseSensitive, isRegexEnabled, isKeysOnly);
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
                        const keyMatches = searchService.matches(searchText, key, isFuzzyEnabled, isCaseSensitive, isRegexEnabled);
                        const childOptions = keyMatches
                            ? { ...options, isFilterEnabled: false }
                            : options;
                        childRef.search(childOptions);
                    }
                });
            }
        }, [data, level, searchService]);

        const toggle = useCallback(() => {
            setIsExpanded(prev => !prev);
        }, []);

        useImperativeHandle(ref, () => ({
            expandAll: () => expandSubtree(),
            collapseAll: () => collapseSubtree(),
            search: (options: SearchOptions) => performSearch(options),
            toggle: () => toggle()
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

        const handleContextMenu = (e: React.MouseEvent, key: string, value: JSONValue) => {
            e.preventDefault();
            e.stopPropagation();

            const fullPath = [...path, key].join('.');
            const valueStr = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
            const fieldJson = JSON.stringify({ [key]: value }, null, 2);

            const items: ContextMenuItem[] = [
                { label: 'Copy Key', value: key },
                { label: 'Copy Value', value: valueStr },
                { label: 'Copy Field', value: fieldJson },
                { label: 'Copy Path', value: fullPath },
            ];

            setContextMenu({
                visible: true,
                x: e.clientX,
                y: e.clientY,
                items
            });
        };

        const closeContextMenu = () => {
            setContextMenu(prev => ({ ...prev, visible: false }));
        };

        if (isFiltered) {
            return null;
        }

        if (parserService.isPrimitive(data)) {
            return (
                <JsonPrimitiveEditor
                    value={data}
                    isHighlighted={isHighlighted}
                    searchOptions={searchOptions}
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
                className={`relative ${level > 1 ? 'ml-2' : ''}`}
            >
                {/* Node Header - Key at top-left */}
                <div
                    className={`
                        inline-flex items-center gap-1 py-0.5 px-1.5 rounded cursor-pointer
                        transition-all duration-150 group
                        ${isHighlighted
                            ? 'bg-yellow-500/20 ring-1 ring-yellow-500/40'
                            : 'hover:bg-gray-200/60 dark:hover:bg-slate-700/40'
                        }
                    `}
                    onClick={toggleCurrentLevel}
                >
                    {/* Expand/Collapse Icon */}
                    <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}>
                        <ChevronRightIcon size={12} />
                    </div>

                    {/* Bracket */}
                    <span className="font-mono text-sm text-gray-500 dark:text-slate-400">
                        {isArray ? '[' : '{'}
                    </span>

                    {/* Item count when collapsed */}
                    {!isExpanded && (
                        <>
                            <span className="text-gray-400 dark:text-slate-500 text-xs">
                                {itemCount}
                            </span>
                            <span className="font-mono text-sm text-gray-500 dark:text-slate-400">
                                {isArray ? ']' : '}'}
                            </span>
                        </>
                    )}

                    {/* Type Badge */}
                    <span className={`
                        px-1 py-0 text-xs font-medium rounded border
                        ${getBadgeColor()}
                    `}>
                        {isArray ? 'Array' : 'Object'}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                expandSubtree();
                            }}
                            className="p-0.5 rounded text-gray-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="Expand all"
                        >
                            <ExpandIcon size={12} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                collapseSubtree();
                            }}
                            className="p-0.5 rounded text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-300/50 dark:hover:bg-slate-600/50 transition-colors"
                            title="Collapse all"
                        >
                            <CollapseIcon size={12} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                copySubtree();
                            }}
                            className={`
                                p-0.5 rounded transition-colors
                                ${showCopied
                                    ? 'text-emerald-500 dark:text-emerald-400 bg-emerald-500/10'
                                    : 'text-gray-400 dark:text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10'
                                }
                            `}
                            title="Copy subtree"
                        >
                            <ClipboardIcon size={12} />
                        </button>
                    </div>
                </div>

                {/* Children */}
                {isExpanded && (
                    <div className="relative ml-2 mt-0.5">
                        {/* Vertical Connector Line - from top to last child */}
                        <div className="absolute left-1.5 top-0 bottom-6 w-px bg-gray-300 dark:bg-slate-600" />

                        {items.map(([key, value], index) => {
                            if (!searchService.shouldItemBeVisible(key, value, searchOptions)) {
                                return null;
                            }

                            const isPrimitiveChild = parserService.isPrimitive(value);
                            const isObjectChild = !isPrimitiveChild;

                            return (
                                <div key={key} className="relative group/item">
                                    {/* Horizontal Connector - connects vertical line to node */}
                                    <div className="absolute left-1.5 top-3 w-2 h-px bg-gray-300 dark:bg-slate-600" />

                                    {/* Key Row - positioned at top-left */}
                                    <div className="ml-4 flex items-center gap-1">
                                        <div
                                            className={`
                                                flex items-center gap-1.5 py-0.5 px-1.5 rounded cursor-context-menu
                                                transition-colors duration-150
                                                hover:bg-gray-200/40 dark:hover:bg-slate-700/20
                                            `}
                                            onContextMenu={(e) => handleContextMenu(e, key, value)}
                                        >
                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete([...path, key]);
                                                }}
                                                className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded text-gray-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 transition-all"
                                                title="Delete"
                                            >
                                                <TrashIcon size={10} />
                                            </button>

                                            {/* Key */}
                                            <span
                                                className={`
                                                    font-medium text-sm transition-colors select-none
                                                    ${isArray
                                                        ? 'text-gray-500 dark:text-slate-500 font-mono'
                                                        : 'text-blue-600 dark:text-blue-400'
                                                    }
                                                `}
                                            >
                                                {isArray ? (
                                                    `[${key}]`
                                                ) : searchOptions.searchText ? (
                                                    <HighlightedText
                                                        text={key}
                                                        searchOptions={searchOptions}
                                                    />
                                                ) : (
                                                    key
                                                )}
                                            </span>
                                            <span className="text-gray-400 dark:text-slate-600">:</span>

                                            {/* Copy Path Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyPath(key);
                                                }}
                                                className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded text-gray-400 dark:text-slate-600 hover:text-cyan-500 dark:hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                                                title={`Copy path: ${[...path, key].join('.')}`}
                                            >
                                                <ClipboardIcon size={10} />
                                            </button>

                                            {/* Inline value for primitives */}
                                            {isPrimitiveChild && (
                                                <div className="flex-shrink min-w-0">
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
                                            )}
                                        </div>
                                    </div>

                                    {/* Child object/array - rendered below the key */}
                                    {isObjectChild && (
                                        <div className="ml-4">
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
                                    )}
                                </div>
                            );
                        })}

                        {/* Closing Bracket */}
                        <div className="ml-4 py-0.5 px-1.5">
                            <span className="font-mono text-gray-500 dark:text-slate-400 text-sm">
                                {isArray ? ']' : '}'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Context Menu */}
                {contextMenu.visible && (
                    <ContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        items={contextMenu.items}
                        onSelect={() => {}}
                        onClose={closeContextMenu}
                    />
                )}
            </div>
        );
    }
);

JsonTreeView.displayName = 'JsonTreeView';
export default JsonTreeView;
