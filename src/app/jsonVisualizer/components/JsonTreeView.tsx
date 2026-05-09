'use client';

import { forwardRef, useImperativeHandle, useState, useRef, useEffect, useCallback } from 'react';
import { JSONValue, JsonPath, SearchOptions, JsonTreeViewRef, JsonValueType } from '../models/JsonModels';
import { getJsonParserService } from '../services/JsonParserService';
import { getJsonSearchService } from '../services/JsonSearchService';
import JsonPrimitiveEditor from './JsonPrimitiveEditor';
import ContextMenu, { ContextMenuItem } from './ContextMenu';
import HighlightedText from './HighlightedText';
import AddNodeForm from './AddNodeForm';
import {
    ChevronDownIcon,
    ChevronRightIcon,
    ExpandIcon,
    CollapseIcon,
    ClipboardIcon,
    TrashIcon,
    BracesIcon,
    BracketsIcon
} from '@/components/shared/Icons';

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    items: ContextMenuItem[];
    contextKey?: string;
}

interface JsonTreeViewProps {
    data: JSONValue;
    level?: number;
    path?: JsonPath;
    searchOptions: SearchOptions;
    onDelete: (path: JsonPath) => void;
    onUpdate: (path: JsonPath, value: JSONValue) => void;
    focusedPath?: JsonPath | null;
    onFocusChange?: (path: JsonPath | null) => void;
    onAdd?: (parentPath: JsonPath, key: string, value: JSONValue) => void;
}

const JsonTreeView = forwardRef<JsonTreeViewRef, JsonTreeViewProps>(
    ({ data, level = 1, path = [], searchOptions, onDelete, onUpdate, focusedPath, onFocusChange, onAdd }, ref) => {
        const [isExpanded, setIsExpanded] = useState(true);
        const [isHighlighted, setIsHighlighted] = useState(false);
        const [isFiltered, setIsFiltered] = useState(false);
        const [showCopied, setShowCopied] = useState(false);
        const [showAddForm, setShowAddForm] = useState(false);
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

        const isFocused = focusedPath && path.join('.') === focusedPath.join('.');

        // Auto-expand if this node is an ancestor of the focused path
        useEffect(() => {
            if (focusedPath && focusedPath.length > path.length) {
                const isAncestor = path.length === 0
                    ? true
                    : path.every((p, i) => focusedPath[i] === p);
                if (isAncestor) {
                    setIsExpanded(true);
                }
            }
        }, [focusedPath, path]);

        // Auto-scroll when this node becomes focused (e.g. from Navigate mode)
        useEffect(() => {
            if (isFocused && nodeRef.current) {
                nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, [isFocused]);

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
                    } catch {
                        // Silently handle expand errors
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
                items,
                contextKey: key
            });
        };

        const closeContextMenu = useCallback(() => {
            setContextMenu(prev => ({ ...prev, visible: false }));
        }, []);

        if (isFiltered) {
            return null;
        }

        if (parserService.isPrimitive(data)) {
            return (
                <span
                    ref={nodeRef}
                    className={`inline-flex rounded transition-all duration-150 ${isFocused ? 'ring-2 jv-focus-ring' : ''}`}
                    style={isFocused ? { background: 'var(--jv-bg-active)' } : undefined}
                >
                    <JsonPrimitiveEditor
                        value={data}
                        isHighlighted={isHighlighted}
                        searchOptions={searchOptions}
                        onUpdate={(newValue) => onUpdate(path, newValue)}
                    />
                </span>
            );
        }

        const isArray = Array.isArray(data);
        const items = Object.entries(data as Record<string, JSONValue>);
        const typeStyle = parserService.getTypeStyle(data);
        const itemCount = items.length;

        // Get type badge style using CSS variables
        const getBadgeStyle = () => {
            if (typeStyle.type === JsonValueType.ARRAY) {
                return {
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: 'var(--jv-bracket)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                };
            }
            return {
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--jv-bracket)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
            };
        };

        return (
            <div
                ref={nodeRef}
                className={`relative ${level > 1 ? 'ml-2' : ''}`}
                role={level === 1 ? 'tree' : 'group'}
            >
                {/* Node Header */}
                <div
                    className={`
                        inline-flex items-center gap-1 py-0.5 px-1.5 rounded cursor-pointer
                        transition-all duration-150 group
                        ${isFocused ? 'ring-2 jv-focus-ring' : ''}
                    `}
                    style={{
                        background: isHighlighted
                            ? 'var(--jv-search-highlight)'
                            : isFocused
                            ? 'var(--jv-bg-active)'
                            : undefined,
                        ...(isHighlighted ? { boxShadow: '0 0 0 1px rgba(250, 204, 21, 0.4)' } : {}),
                    }}
                    onClick={toggleCurrentLevel}
                    onMouseEnter={(e) => {
                        if (!isHighlighted && !isFocused) {
                            e.currentTarget.style.background = 'var(--jv-bg-hover)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (!isHighlighted && !isFocused) {
                            e.currentTarget.style.background = '';
                        }
                    }}
                    role="treeitem"
                    aria-expanded={isExpanded}
                >
                    {/* Expand/Collapse Icon */}
                    <div
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : 'rotate-0'}`}
                        style={{ color: 'var(--jv-text-muted)' }}
                    >
                        <ChevronRightIcon size={12} />
                    </div>

                    {/* Bracket */}
                    <span className="text-sm" style={{ color: 'var(--jv-bracket)', fontFamily: 'var(--jv-font-mono)' }}>
                        {isArray ? '[' : '{'}
                    </span>

                    {/* Item count when collapsed */}
                    {!isExpanded && (
                        <>
                            <span className="text-xs" style={{ color: 'var(--jv-text-muted)' }}>
                                {itemCount}
                            </span>
                            <span className="text-sm" style={{ color: 'var(--jv-bracket)', fontFamily: 'var(--jv-font-mono)' }}>
                                {isArray ? ']' : '}'}
                            </span>
                        </>
                    )}

                    {/* Type Badge */}
                    <span
                        className="px-1 py-0 text-xs font-medium rounded"
                        style={getBadgeStyle()}
                    >
                        {isArray ? 'Array' : 'Object'}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                expandSubtree();
                            }}
                            className="p-0.5 rounded transition-colors"
                            style={{ color: 'var(--jv-text-muted)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--jv-accent)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--jv-text-muted)'}
                            title="Expand all"
                        >
                            <ExpandIcon size={12} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                collapseSubtree();
                            }}
                            className="p-0.5 rounded transition-colors"
                            style={{ color: 'var(--jv-text-muted)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--jv-text-primary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--jv-text-muted)'}
                            title="Collapse all"
                        >
                            <CollapseIcon size={12} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                copySubtree();
                            }}
                            className="p-0.5 rounded transition-colors"
                            style={{ color: showCopied ? 'var(--jv-success)' : 'var(--jv-text-muted)' }}
                            onMouseEnter={(e) => { if (!showCopied) e.currentTarget.style.color = 'var(--jv-accent)'; }}
                            onMouseLeave={(e) => { if (!showCopied) e.currentTarget.style.color = 'var(--jv-text-muted)'; }}
                            title="Copy subtree"
                        >
                            <ClipboardIcon size={12} />
                        </button>
                        {onAdd && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddForm(true);
                                }}
                                className="p-0.5 rounded transition-colors"
                                style={{ color: 'var(--jv-success)' }}
                                title="Add child node"
                            >
                                <span className="text-sm font-bold">+</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Children */}
                {isExpanded && (
                    <div className="relative ml-2 mt-0.5">
                        {/* Vertical Connector Line */}
                        <div
                            className="absolute left-1.5 top-0 bottom-6 w-px"
                            style={{ background: 'var(--jv-connector)' }}
                        />

                        {items.map(([key, value], index) => {
                            if (!searchService.shouldItemBeVisible(key, value, searchOptions)) {
                                return null;
                            }

                            const isPrimitiveChild = parserService.isPrimitive(value);
                            const isObjectChild = !isPrimitiveChild;

                            return (
                                <div key={key} className="relative group/item jv-animate-fade-in">
                                    {/* Horizontal Connector */}
                                    <div
                                        className="absolute left-1.5 top-3 w-2 h-px"
                                        style={{ background: 'var(--jv-connector)' }}
                                    />

                                    {/* Key Row */}
                                    <div className="ml-4 flex items-center gap-1">
                                        <div
                                            className="flex items-center gap-1.5 py-0.5 px-1.5 rounded cursor-context-menu transition-colors duration-150"
                                            onContextMenu={(e) => handleContextMenu(e, key, value)}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--jv-bg-hover)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = ''}
                                            role="treeitem"
                                        >
                                            {/* Delete Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete([...path, key]);
                                                }}
                                                className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded transition-all"
                                                style={{ color: 'var(--jv-text-muted)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--jv-danger)'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--jv-text-muted)'}
                                                title="Delete"
                                            >
                                                <TrashIcon size={10} />
                                            </button>

                                            {/* Key */}
                                            <span
                                                className="font-medium text-sm transition-colors select-none"
                                                style={{
                                                    color: isArray ? 'var(--jv-text-muted)' : 'var(--jv-key)',
                                                    fontFamily: isArray ? 'var(--jv-font-mono)' : undefined,
                                                }}
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
                                            <span style={{ color: 'var(--jv-text-muted)' }}>:</span>

                                            {/* Copy Path Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCopyPath(key);
                                                }}
                                                className="opacity-0 group-hover/item:opacity-100 p-0.5 rounded transition-all"
                                                style={{ color: 'var(--jv-text-muted)' }}
                                                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--jv-accent)'}
                                                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--jv-text-muted)'}
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
                                                        focusedPath={focusedPath}
                                                        onFocusChange={onFocusChange}
                                                        onAdd={onAdd}
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
                                                focusedPath={focusedPath}
                                                onFocusChange={onFocusChange}
                                                onAdd={onAdd}
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Add Node Form */}
                        {showAddForm && onAdd && (
                            <AddNodeForm
                                parentPath={path}
                                isArray={isArray}
                                onAdd={(key, value) => {
                                    onAdd(path, key, value);
                                    setShowAddForm(false);
                                }}
                                onCancel={() => setShowAddForm(false)}
                            />
                        )}

                        {/* Closing Bracket */}
                        <div className="ml-4 py-0.5 px-1.5">
                            <span className="text-sm" style={{ color: 'var(--jv-bracket)', fontFamily: 'var(--jv-font-mono)' }}>
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
                        onAddChild={onAdd ? () => setShowAddForm(true) : undefined}
                    />
                )}
            </div>
        );
    }
);

JsonTreeView.displayName = 'JsonTreeView';
export default JsonTreeView;
