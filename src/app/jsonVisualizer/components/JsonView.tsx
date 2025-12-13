'use client';
import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react';
import { JSONValue, JsonViewProps, JsonViewRef } from '../types';
import { hasChildren, getTypeStyles, matchesSearch } from '../utils/jsonHelpers';
import PrimitiveValue from './PrimitiveValue';

const JsonView = forwardRef<JsonViewRef, JsonViewProps>(({ data, level = 1, path = [], onDelete, onUpdate }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const [isFiltered, setIsFiltered] = useState(false);
    const [searchContext, setSearchContext] = useState<{
        searchText: string;
        isFilterEnabled: boolean;
        isFuzzyEnabled: boolean;
    }>({ searchText: '', isFilterEnabled: false, isFuzzyEnabled: false });
    const childrenRefs = useRef<{ [key: string]: JsonViewRef }>({});
    const isFirstRender = useRef(true);
    const nodeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        childrenRefs.current = {};
        isFirstRender.current = true;
        return () => {
            childrenRefs.current = {};
        };
    }, [data]);

    // Expand subtree function
    const expandSubtree = async (): Promise<void> => {
        if (!hasChildren(data)) return;

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

        if (isFirstRender.current) {
            isFirstRender.current = false;
            await new Promise(resolve => setTimeout(resolve, 50));
            await Promise.all(
                Object.values(childrenRefs.current).map(childRef => childRef?.expandAll())
            );
        }
    };

    // Collapse subtree function
    const collapseSubtree = async (): Promise<void> => {
        setIsExpanded(false);
        
        // Recursively collapse all children
        Object.values(childrenRefs.current).forEach(childRef => {
            if (childRef?.collapseAll) {
                childRef.collapseAll();
            }
        });
    };

    const toggleCurrentLevel = () => {
        setIsExpanded(!isExpanded);
    };

    // Function to copy subtree as JSON
    const copySubtree = () => {
        try {
            const json = JSON.stringify(data, null, 2);
            navigator.clipboard.writeText(json);
            // Show a brief visual feedback
            setIsHighlighted(true);
            setTimeout(() => setIsHighlighted(false), 300);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    // Path handling
    const handleCopyPath = (key: string) => {
        const fullPath = [...path, key].join('.');
        navigator.clipboard.writeText(fullPath);
    };

    // Expose functions via ref
    useImperativeHandle(ref, () => ({
        expandAll: () => expandSubtree(),
        collapseAll: () => collapseSubtree(),
        searchNodes: (searchText: string, searchLevel?: number, isFilterEnabled?: boolean, isFuzzyEnabled?: boolean) => {
            // Update search context for use in render
            setSearchContext({
                searchText,
                isFilterEnabled: isFilterEnabled || false,
                isFuzzyEnabled: isFuzzyEnabled || false
            });

            if (!searchText) {
                // Clear highlights and filters when search is empty
                setIsHighlighted(false);
                setIsFiltered(false);
                Object.values(childrenRefs.current).forEach(childRef => {
                    if (childRef?.searchNodes) {
                        childRef.searchNodes('', searchLevel, isFilterEnabled, isFuzzyEnabled);
                    }
                });
                return;
            }

            // Function to recursively check if data contains matches
            const deepSearch = (obj: JSONValue): boolean => {
                if (typeof obj !== 'object' || obj === null) {
                    // Check primitive values
                    return matchesSearch(searchText, String(obj), isFuzzyEnabled || false);
                }

                // Check keys and direct primitive values
                return Object.entries(obj).some(([key, value]) => {
                    const keyMatches = matchesSearch(searchText, key, isFuzzyEnabled || false);

                    if (typeof value === 'object' && value !== null) {
                        // Recursively search nested objects/arrays
                        return keyMatches || deepSearch(value);
                    } else {
                        // Check primitive values
                        const valueMatches = matchesSearch(searchText, String(value), isFuzzyEnabled || false);
                        return keyMatches || valueMatches;
                    }
                });
            };

            const hasAnyMatch = deepSearch(data);

            // Determine if current node should be highlighted (matches at this specific level)
            let currentMatches = false;
            if (typeof data !== 'object' || data === null) {
                currentMatches = matchesSearch(searchText, String(data), isFuzzyEnabled || false);
            } else {
                currentMatches = Object.entries(data).some(([key, value]) => {
                    const keyMatches = matchesSearch(searchText, key, isFuzzyEnabled || false);
                    if (typeof value !== 'object' && value !== null) {
                        const valueMatches = matchesSearch(searchText, String(value), isFuzzyEnabled || false);
                        return keyMatches || valueMatches;
                    }
                    return keyMatches;
                });
            }

            const shouldHighlight = (!searchLevel || level === searchLevel) && currentMatches;

            if (shouldHighlight) {
                setIsExpanded(true);
                setIsHighlighted(true);
                // Scroll into view if highlighted
                if (nodeRef.current) {
                    nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                setIsHighlighted(false);
            }

            // Handle filtering - hide nodes that don't contain any matches in their subtree
            if (isFilterEnabled) {
                setIsFiltered(!hasAnyMatch);
            } else {
                setIsFiltered(false);
            }

            // Expand parent nodes if they contain matches
            if (hasAnyMatch && typeof data === 'object' && data !== null) {
                setIsExpanded(true);
            }

            // Recursively search children after setting our own state
            if (typeof data === 'object' && data !== null) {
                Object.entries(data).forEach(([key, value]) => {
                    const childRef = childrenRefs.current[key];
                    if (childRef?.searchNodes) {
                        // If the current level key matches, disable filtering for its immediate children
                        const keyMatches = matchesSearch(searchText, key, isFuzzyEnabled || false);
                        const childFilterEnabled = keyMatches ? false : isFilterEnabled;
                        childRef.searchNodes(searchText, searchLevel, childFilterEnabled, isFuzzyEnabled);
                    }
                });
            }
        }
    }));

    // Don't render if filtered out
    if (isFiltered) {
        return null;
    }

    // Render primitive values
    if (typeof data !== 'object' || data === null) {
        return (
            <PrimitiveValue
                data={data}
                isHighlighted={isHighlighted}
                onUpdate={(newValue) => onUpdate && onUpdate(path, newValue)}
            />
        );
    }

    const isArray = Array.isArray(data);
    const items = Object.entries(data);
    const { icon } = getTypeStyles(data);

    return (
        <div 
            ref={nodeRef}
            style={{ marginLeft: level * 8 }} 
            className={`relative ${isHighlighted ? 'bg-yellow-200 dark:bg-yellow-800 rounded px-1' : ''}`}
        >
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
                    title={isExpanded ? "Collapse (Enter/Space)" : "Expand (Enter/Space)"}
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
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded opacity-70" title="Value type">
                        {icon}
                    </span>
                </div>
                
                {hasChildren(data) && (
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
            
            {isExpanded && (
                <div className="py-0.5 border-l-2 border-gray-200 dark:border-gray-700 my-1">
                    {items.map(([key, value]) => {
                        // Check if this specific key-value pair should be shown when filtering
                        const shouldShowItem = () => {
                            if (!searchContext.searchText || !searchContext.isFilterEnabled) return true;

                            // Check if the key matches
                            const keyMatches = matchesSearch(searchContext.searchText, key, searchContext.isFuzzyEnabled);

                            // If the key matches, always show the item (including its value)
                            if (keyMatches) return true;

                            // Check if the value matches (for primitives) or contains matches (for objects)
                            let valueMatches = false;
                            if (typeof value === 'object' && value !== null) {
                                // For nested objects/arrays, use deep search
                                valueMatches = deepSearch(value);
                            } else {
                                // For primitives, check direct match
                                valueMatches = matchesSearch(searchContext.searchText, String(value), searchContext.isFuzzyEnabled);
                            }

                            return valueMatches;
                        };

                        // Helper function for deep search (reuse the one from above)
                        const deepSearch = (obj: JSONValue): boolean => {
                            if (typeof obj !== 'object' || obj === null) {
                                return matchesSearch(searchContext.searchText, String(obj), searchContext.isFuzzyEnabled);
                            }

                            return Object.entries(obj).some(([k, v]) => {
                                const kMatches = matchesSearch(searchContext.searchText, k, searchContext.isFuzzyEnabled);
                                if (typeof v === 'object' && v !== null) {
                                    return kMatches || deepSearch(v);
                                } else {
                                    const vMatches = matchesSearch(searchContext.searchText, String(v), searchContext.isFuzzyEnabled);
                                    return kMatches || vMatches;
                                }
                            });
                        };

                        if (!shouldShowItem()) {
                            return null; // Hide this item when filtering
                        }

                        return (
                            <div
                                key={key}
                                className="flex items-start gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded py-1 px-2 group"
                            >
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
                                <div className="flex items-center gap-1 flex-grow">
                                    <button
                                        onClick={() => handleCopyPath(key)}
                                        className="text-blue-500 hover:text-blue-700 text-xs opacity-50 hover:opacity-100"
                                        title="Copy path"
                                    >
                                        📋
                                    </button>
                                    <span className={`${isArray ? 'text-gray-500' : 'text-blue-600'} font-medium`}>
                                        {isArray ? `[${key}]` : key}:
                                    </span>
                                    <JsonView
                                        ref={ref => {
                                            if (ref) {
                                                childrenRefs.current[key] = ref;
                                            }
                                        }}
                                        data={value}
                                        level={level + 1}
                                        path={[...path, key]}
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
});

JsonView.displayName = 'JsonView';
export default JsonView;
