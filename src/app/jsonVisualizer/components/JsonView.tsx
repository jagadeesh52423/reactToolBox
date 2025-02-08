'use client';
import { forwardRef, useImperativeHandle, useState, useRef, useEffect } from 'react';

type JSONValue = string | number | boolean | null | JSONValue[] | { [key: string]: JSONValue };

interface JsonViewProps {
    data: JSONValue;
    level?: number;
    path?: string[];
    onDelete: (path: string[]) => void;
}

export interface JsonViewRef {
    expandAll: () => void;
    searchNodes: (searchText: string, level?: number) => void;
}

const JsonView = forwardRef<JsonViewRef, JsonViewProps>(({ data, level = 1, path = [], onDelete }, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHighlighted, setIsHighlighted] = useState(false);
    const childrenRefs = useRef<{ [key: string]: JsonViewRef }>({});
    const isFirstRender = useRef(true);

    useEffect(() => {
        childrenRefs.current = {};
        isFirstRender.current = true;
        return () => {
            childrenRefs.current = {};
        };
    }, [data]);

    // New function to check if node has children
    const hasChildren = (node: JSONValue): boolean => {
        return typeof node === 'object' && node !== null && Object.keys(node).length > 0;
    };

    // Modified expandSubtree function
    const expandSubtree = async (): Promise<void> => {
        if (!hasChildren(data)) return;

        // First, expand the current node
        setIsExpanded(true);

        // Wait for the state update and refs to be available
        await new Promise(resolve => setTimeout(resolve, 50));

        // Get all children and create an array of promises
        const expandPromises = Object.values(childrenRefs.current).map(async (childRef) => {
            if (childRef?.expandAll) {
                try {
                    await childRef.expandAll();
                } catch (error) {
                    console.error('Error expanding child:', error);
                }
            }
        });

        // Wait for all children to expand
        await Promise.all(expandPromises);

        // If this is the first render, we need to expand again to catch any late-binding refs
        if (isFirstRender.current) {
            isFirstRender.current = false;
            await new Promise(resolve => setTimeout(resolve, 50));
            await Promise.all(
                Object.values(childrenRefs.current).map(childRef => childRef?.expandAll())
            );
        }
    };

    // Toggle only current level
    const toggleCurrentLevel = () => {
        setIsExpanded(!isExpanded);
    };

    useImperativeHandle(ref, () => ({
        expandAll: () => expandSubtree(),
        searchNodes: (searchText: string, searchLevel?: number) => {
            if (!searchText) return;

            const currentMatches = Object.entries(data).some(([key, value]) => {
                return key.toLowerCase().includes(searchText.toLowerCase()) ||
                    (typeof value === 'string' && value.toLowerCase().includes(searchText.toLowerCase()));
            });

            if ((!searchLevel || level === searchLevel) && currentMatches) {
                setIsExpanded(true);
                setIsHighlighted(true);
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

    const handleCopyPath = (key: string) => {
        const fullPath = [...path, key].join('.');
        navigator.clipboard.writeText(fullPath);
    };

    if (typeof data !== 'object' || data === null) {
        return <span className={`text-green-600 ${isHighlighted ? 'bg-yellow-200 dark:bg-yellow-800' : ''}`}>
            {JSON.stringify(data)}
        </span>;
    }

    const isArray = Array.isArray(data);
    const items = Object.entries(data);

    return (
        <div style={{ marginLeft: level * 16 }} className={isHighlighted ? 'bg-yellow-200 dark:bg-yellow-800 rounded' : ''}>
            <div className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 py-0.5 px-1 rounded flex items-center gap-1">
                <span onClick={toggleCurrentLevel} className="w-4 inline-block">
                    {isExpanded ? '▼' : '▶'}
                </span>
                <span>{isArray ? '[' : '{'}</span>
                {!isExpanded && (
                    <>
                        <span className="opacity-50">
                            {items.length} {items.length ===1 ? 'item' : 'items'}
                        </span>
                        <span>{isArray ? ']' : '}'}</span>
                    </>
                )}
                {hasChildren(data) && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            expandSubtree();
                        }}
                        className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        title="Expand full subtree"
                    >
                        ⤵
                    </button>
                )}
            </div>
            
            {isExpanded && (
                <div className="py-0.5">
                    {items.map(([key, value]) => (
                        <div key={key} className="flex items-start gap-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded py-0.5 px-1">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete([...path, key]);
                                }}
                                className="text-red-500 hover:text-red-700 text-xs w-4 h-4 flex items-center justify-center"
                            >
                                ×
                            </button>
                            <button
                                onClick={() => handleCopyPath(key)}
                                className="text-blue-500 hover:text-blue-700 text-xs"
                                title="Copy path"
                            >
                                📋
                            </button>
                            <span className="text-blue-600">{key}:</span>
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
                            />
                        </div>
                    ))}
                    <div style={{ marginLeft: level * 16 }}>
                        {isArray ? ']' : '}'}
                    </div>
                </div>
            )}
        </div>
    );
});

JsonView.displayName = 'JsonView';
export default JsonView;
