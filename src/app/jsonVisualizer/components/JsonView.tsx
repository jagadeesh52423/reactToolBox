'use client';
import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react';
import { JSONValue, JsonViewProps, JsonViewRef } from '../types';
import { hasChildren, getTypeStyles } from '../utils/jsonHelpers';
import PrimitiveValue from './PrimitiveValue';

const JsonView = forwardRef<JsonViewRef, JsonViewProps>(({ data, level = 1, path = [], onDelete, onUpdate }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);
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
        searchNodes: (searchText: string, searchLevel?: number) => {
            if (!searchText) return;

            let currentMatches = false;
            
            if (typeof data !== 'object' || data === null) {
                // Handle primitive values
                const stringValue = String(data).toLowerCase();
                currentMatches = stringValue.includes(searchText.toLowerCase());
            } else {
                // Handle objects and arrays
                currentMatches = Object.entries(data).some(([key, value]) => {
                    const stringValue = typeof value === 'string' ? value : 
                                      typeof value === 'number' || typeof value === 'boolean' ? 
                                      String(value) : '';
                    return key.toLowerCase().includes(searchText.toLowerCase()) ||
                        stringValue.toLowerCase().includes(searchText.toLowerCase());
                });
            }

            if ((!searchLevel || level === searchLevel) && currentMatches) {
                setIsExpanded(true);
                setIsHighlighted(true);
                // Scroll into view if highlighted
                if (nodeRef.current) {
                    nodeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            } else {
                setIsHighlighted(false);
            }

            if ((!searchLevel || level < searchLevel || !searchLevel) && typeof data === 'object' && data !== null) {
                setIsExpanded(true);
                Object.values(childrenRefs.current).forEach(childRef => {
                    childRef.searchNodes(searchText, searchLevel);
                });
            }
        }
    }));

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
                    className="w-4 h-4 inline-flex items-center justify-center text-gray-500 hover:text-blue-500"
                    title={isExpanded ? "Collapse" : "Expand"}
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
                    {items.map(([key, value]) => (
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
                    ))}
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
