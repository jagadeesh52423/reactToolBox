'use client';
import React, { useMemo, useState, useCallback } from 'react';
import {
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    BracesIcon,
    BracketsIcon,
    ExpandIcon,
    CollapseIcon,
    FilterIcon,
    LayersIcon
} from './Icons';

interface StructuredDiffViewerProps {
    left: string;
    right: string;
}

type DiffType = 'added' | 'removed' | 'changed' | 'unchanged';

interface DiffResult {
    type: DiffType;
    leftValue?: unknown;
    rightValue?: unknown;
    children?: Record<string, DiffResult>;
}

type ViewMode = 'diffs' | 'full';

const StructuredDiffViewer: React.FC<StructuredDiffViewerProps> = ({ left, right }) => {
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']));
    const [viewMode, setViewMode] = useState<ViewMode>('diffs');

    // Build diff tree
    const diffTree = useMemo(() => {
        try {
            const leftObj = JSON.parse(left);
            const rightObj = JSON.parse(right);
            return buildDiff(leftObj, rightObj);
        } catch (error) {
            console.error("Error parsing JSON:", error);
            return null;
        }
    }, [left, right]);

    // Initially expand all paths with changes
    useMemo(() => {
        if (diffTree) {
            const pathsToExpand = new Set<string>(['root']);
            const collectChangedPaths = (diff: DiffResult, path: string) => {
                if (diff.children) {
                    Object.entries(diff.children).forEach(([key, child]) => {
                        const childPath = path ? `${path}.${key}` : key;
                        if (hasChanges(child)) {
                            pathsToExpand.add(path);
                            pathsToExpand.add(childPath);
                            collectChangedPaths(child, childPath);
                        }
                    });
                }
            };
            collectChangedPaths(diffTree, 'root');
            setExpandedPaths(pathsToExpand);
        }
    }, [diffTree]);

    function buildDiff(left: unknown, right: unknown): DiffResult {
        // Both are the same
        if (left === right) {
            return { type: 'unchanged', leftValue: left, rightValue: right };
        }

        // One is undefined
        if (left === undefined) {
            return { type: 'added', rightValue: right };
        }
        if (right === undefined) {
            return { type: 'removed', leftValue: left };
        }

        // Different types
        if (typeof left !== typeof right || Array.isArray(left) !== Array.isArray(right)) {
            return { type: 'changed', leftValue: left, rightValue: right };
        }

        // Both are objects/arrays
        if (typeof left === 'object' && left !== null && typeof right === 'object' && right !== null) {
            const leftObj = left as Record<string, unknown>;
            const rightObj = right as Record<string, unknown>;
            const allKeys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]);
            const children: Record<string, DiffResult> = {};

            allKeys.forEach(key => {
                children[key] = buildDiff(leftObj[key], rightObj[key]);
            });

            return { type: 'unchanged', leftValue: left, rightValue: right, children };
        }

        // Primitives that differ
        return { type: 'changed', leftValue: left, rightValue: right };
    }

    function hasChanges(diff: DiffResult): boolean {
        if (diff.type !== 'unchanged') return true;
        if (diff.children) {
            return Object.values(diff.children).some(child => hasChanges(child));
        }
        return false;
    }

    const toggleExpanded = useCallback((path: string) => {
        setExpandedPaths(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    }, []);

    const expandAll = useCallback(() => {
        if (!diffTree) return;
        const allPaths = new Set<string>(['root']);
        const collectPaths = (diff: DiffResult, path: string) => {
            if (diff.children) {
                Object.entries(diff.children).forEach(([key, child]) => {
                    const childPath = path ? `${path}.${key}` : key;
                    allPaths.add(childPath);
                    collectPaths(child, childPath);
                });
            }
        };
        collectPaths(diffTree, 'root');
        setExpandedPaths(allPaths);
    }, [diffTree]);

    const collapseAll = useCallback(() => {
        setExpandedPaths(new Set(['root']));
    }, []);

    // Get diff indicator color
    const getDiffBorderColor = (type: DiffType): string => {
        switch (type) {
            case 'added': return 'border-l-emerald-500 dark:border-l-emerald-400';
            case 'removed': return 'border-l-red-500 dark:border-l-red-400';
            case 'changed': return 'border-l-amber-500 dark:border-l-amber-400';
            case 'unchanged': return viewMode === 'full' ? 'border-l-gray-300 dark:border-l-slate-600' : 'border-l-transparent';
            default: return 'border-l-transparent';
        }
    };

    const getDiffBgColor = (type: DiffType): string => {
        switch (type) {
            case 'added': return 'bg-emerald-50/30 dark:bg-emerald-900/10';
            case 'removed': return 'bg-red-50/30 dark:bg-red-900/10';
            case 'changed': return 'bg-amber-50/30 dark:bg-amber-900/10';
            case 'unchanged': return viewMode === 'full' ? 'bg-gray-50/20 dark:bg-slate-800/20' : '';
            default: return '';
        }
    };

    const getDiffBadge = (type: DiffType): React.ReactNode => {
        if (type === 'unchanged') return null;
        const colors = {
            added: 'bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-600/50',
            removed: 'bg-red-100 dark:bg-red-800/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-600/50',
            changed: 'bg-amber-100 dark:bg-amber-800/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-600/50'
        };
        return (
            <span className={`ml-2 px-1.5 py-0.5 text-xs font-medium rounded border ${colors[type]}`}>
                {type}
            </span>
        );
    };

    // Format primitive value with type coloring
    const formatValue = (value: unknown): React.ReactNode => {
        if (value === null) {
            return <span className="text-gray-500 dark:text-gray-400 italic">null</span>;
        }
        if (typeof value === 'string') {
            return <span className="text-green-600 dark:text-green-400">&quot;{value}&quot;</span>;
        }
        if (typeof value === 'number') {
            return <span className="text-blue-600 dark:text-blue-400">{value}</span>;
        }
        if (typeof value === 'boolean') {
            return <span className="text-purple-600 dark:text-purple-400">{value.toString()}</span>;
        }
        return <span>{String(value)}</span>;
    };

    // Render a tree node
    const renderNode = (
        key: string,
        diff: DiffResult,
        path: string,
        level: number,
        isArrayItem: boolean = false,
        isLast: boolean = false
    ): React.ReactNode => {
        const currentPath = path ? `${path}.${key}` : key;
        const isExpanded = expandedPaths.has(currentPath);
        const hasChildren = diff.children && Object.keys(diff.children).length > 0;
        const value = diff.type === 'removed' ? diff.leftValue : diff.rightValue ?? diff.leftValue;
        const isArray = Array.isArray(value);
        const isObject = typeof value === 'object' && value !== null;
        const itemCount = isObject ? Object.keys(value).length : 0;

        // For changed values, show before/after
        const renderChangedValue = () => (
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-100/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-500/30">
                    <span className="text-xs text-red-500 dark:text-red-400 font-medium">−</span>
                    <span className="font-mono text-sm">{formatValue(diff.leftValue)}</span>
                </div>
                <span className="text-gray-400 dark:text-slate-500">→</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100/50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-500/30">
                    <span className="text-xs text-emerald-500 dark:text-emerald-400 font-medium">+</span>
                    <span className="font-mono text-sm">{formatValue(diff.rightValue)}</span>
                </div>
            </div>
        );

        return (
            <div key={currentPath} className="relative">
                {/* Horizontal connector */}
                {level > 0 && (
                    <div className="absolute left-0 top-4 w-3 h-px bg-gray-300/50 dark:bg-slate-600/50" />
                )}

                {/* Node dot */}
                {level > 0 && (
                    <div className="absolute left-[-2px] top-[13px] w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500" />
                )}

                <div className={`ml-${level > 0 ? 4 : 0}`}>
                    <div
                        className={`
                            flex items-center gap-2 py-1.5 px-2 rounded-lg
                            border-l-2 ${getDiffBorderColor(diff.type)} ${getDiffBgColor(diff.type)}
                            transition-colors duration-150 group
                            ${hasChildren ? 'cursor-pointer hover:bg-gray-100/50 dark:hover:bg-slate-700/30' : ''}
                        `}
                        onClick={hasChildren ? () => toggleExpanded(currentPath) : undefined}
                    >
                        {/* Expand/Collapse Icon for objects/arrays */}
                        {hasChildren ? (
                            <button
                                className="w-5 h-5 flex items-center justify-center rounded text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-300/50 dark:hover:bg-slate-600/50 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleExpanded(currentPath);
                                }}
                            >
                                <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                                    <ChevronDownIcon size={14} />
                                </div>
                            </button>
                        ) : (
                            <span className="w-5" />
                        )}

                        {/* Key name */}
                        <span className={`font-medium ${isArrayItem ? 'text-gray-400 dark:text-slate-500 font-mono text-sm' : 'text-blue-600 dark:text-blue-400'}`}>
                            {isArrayItem ? `[${key}]` : key}
                        </span>
                        <span className="text-gray-400 dark:text-slate-600">:</span>

                        {/* Value */}
                        <div className="flex-1 flex items-center gap-2 min-w-0">
                            {diff.type === 'changed' && !hasChildren ? (
                                renderChangedValue()
                            ) : hasChildren ? (
                                <>
                                    {/* Type Icon */}
                                    <div className="text-gray-400 dark:text-slate-500">
                                        {isArray ? <BracketsIcon size={14} /> : <BracesIcon size={14} />}
                                    </div>
                                    <span className="font-mono text-gray-500 dark:text-slate-400">
                                        {isArray ? '[' : '{'}
                                    </span>
                                    {!isExpanded && (
                                        <>
                                            <span className="text-gray-400 dark:text-slate-500 text-sm">
                                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                            </span>
                                            <span className="font-mono text-gray-500 dark:text-slate-400">
                                                {isArray ? ']' : '}'}
                                            </span>
                                        </>
                                    )}
                                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded border ${
                                        isArray
                                            ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                            : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                                    }`}>
                                        {isArray ? 'Array' : 'Object'}
                                    </span>
                                </>
                            ) : (
                                <span className="font-mono text-sm">{formatValue(value)}</span>
                            )}
                        </div>

                        {/* Diff badge for non-container types */}
                        {!hasChildren && getDiffBadge(diff.type)}
                    </div>

                    {/* Children */}
                    {hasChildren && isExpanded && (
                        <div className="relative ml-3 mt-1">
                            {/* Vertical connector line */}
                            <div className="absolute left-0 top-0 bottom-4 w-px bg-gradient-to-b from-gray-300/50 dark:from-slate-600/50 to-transparent" />

                            {Object.entries(diff.children!).map(([childKey, childDiff], index, arr) => {
                                // Skip unchanged children unless they have changed descendants (only in diffs mode)
                                if (viewMode === 'diffs' && childDiff.type === 'unchanged' && !hasChanges(childDiff)) {
                                    return null;
                                }
                                return renderNode(
                                    childKey,
                                    childDiff,
                                    currentPath,
                                    level + 1,
                                    isArray,
                                    index === arr.length - 1
                                );
                            })}

                            {/* Closing bracket */}
                            <div className="ml-4 py-1 px-2">
                                <span className="font-mono text-gray-500 dark:text-slate-400">
                                    {isArray ? ']' : '}'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Check if there are any differences
    const hasDifferences = diffTree && hasChanges(diffTree);

    if (!diffTree || !hasDifferences) {
        return (
            <div className="p-6 text-center bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
                <CheckCircleIcon size={32} className="mx-auto mb-2 text-emerald-500 dark:text-emerald-400" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    JSON objects are identical!
                </span>
            </div>
        );
    }

    const rootValue = diffTree.rightValue ?? diffTree.leftValue;
    const isRootArray = Array.isArray(rootValue);

    return (
        <div className="rounded-lg bg-white dark:bg-slate-800/30 border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50">
                {/* Legend */}
                <div className="flex items-center gap-4 text-xs">
                    <span className="text-gray-500 dark:text-slate-400">Legend:</span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded border-l-2 border-emerald-500 bg-emerald-100 dark:bg-emerald-900/30" />
                        <span className="text-emerald-600 dark:text-emerald-400">Added</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded border-l-2 border-red-500 bg-red-100 dark:bg-red-900/30" />
                        <span className="text-red-600 dark:text-red-400">Removed</span>
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded border-l-2 border-amber-500 bg-amber-100 dark:bg-amber-900/30" />
                        <span className="text-amber-600 dark:text-amber-400">Changed</span>
                    </span>
                    {viewMode === 'full' && (
                        <span className="flex items-center gap-1">
                            <span className="w-3 h-3 rounded border-l-2 border-gray-300 dark:border-slate-600 bg-gray-100 dark:bg-slate-800/30" />
                            <span className="text-gray-500 dark:text-slate-400">Unchanged</span>
                        </span>
                    )}
                </div>

                {/* View Mode Toggle + Expand/Collapse buttons */}
                <div className="flex items-center gap-2">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-gray-100/50 dark:bg-slate-700/30 rounded-lg p-0.5">
                        <button
                            onClick={() => setViewMode('diffs')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                                viewMode === 'diffs'
                                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                            }`}
                            title="Show only differences"
                        >
                            <FilterIcon size={12} />
                            <span>Diffs Only</span>
                        </button>
                        <button
                            onClick={() => setViewMode('full')}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
                                viewMode === 'full'
                                    ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                            }`}
                            title="Show full tree with all values"
                        >
                            <LayersIcon size={12} />
                            <span>Full Tree</span>
                        </button>
                    </div>

                    {/* Separator */}
                    <div className="w-px h-5 bg-gray-300/50 dark:bg-slate-600/50" />

                    {/* Expand/Collapse buttons */}
                    <div className="flex items-center gap-1">
                    <button
                        onClick={expandAll}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-colors"
                        title="Expand all"
                    >
                        <ExpandIcon size={12} />
                        <span>Expand</span>
                    </button>
                    <button
                        onClick={collapseAll}
                        className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-colors"
                        title="Collapse all"
                    >
                        <CollapseIcon size={12} />
                        <span>Collapse</span>
                    </button>
                    </div>
                </div>
            </div>

            {/* Tree content */}
            <div className="p-4">
                {/* Root node */}
                <div className="relative">
                    <div
                        className="flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer hover:bg-gray-100/50 dark:hover:bg-slate-700/30 transition-colors group"
                        onClick={() => toggleExpanded('root')}
                    >
                        <button
                            className="w-5 h-5 flex items-center justify-center rounded text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-300/50 dark:hover:bg-slate-600/50 transition-all"
                        >
                            <div className={`transition-transform duration-200 ${expandedPaths.has('root') ? 'rotate-0' : '-rotate-90'}`}>
                                <ChevronDownIcon size={14} />
                            </div>
                        </button>
                        <div className="text-gray-400 dark:text-slate-500">
                            {isRootArray ? <BracketsIcon size={14} /> : <BracesIcon size={14} />}
                        </div>
                        <span className="font-mono text-gray-500 dark:text-slate-400">
                            {isRootArray ? '[' : '{'}
                        </span>
                        {!expandedPaths.has('root') && (
                            <>
                                <span className="text-gray-400 dark:text-slate-500 text-sm">
                                    {Object.keys(rootValue as object).length} items
                                </span>
                                <span className="font-mono text-gray-500 dark:text-slate-400">
                                    {isRootArray ? ']' : '}'}
                                </span>
                            </>
                        )}
                        <span className={`px-1.5 py-0.5 text-xs font-medium rounded border ${
                            isRootArray
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border-cyan-500/30'
                        }`}>
                            {isRootArray ? 'Array' : 'Object'}
                        </span>
                    </div>

                    {/* Root children */}
                    {expandedPaths.has('root') && diffTree.children && (
                        <div className="relative ml-3 mt-1">
                            {/* Vertical connector line */}
                            <div className="absolute left-0 top-0 bottom-4 w-px bg-gradient-to-b from-gray-300/50 dark:from-slate-600/50 to-transparent" />

                            {Object.entries(diffTree.children).map(([key, childDiff], index, arr) => {
                                // Skip unchanged children (only in diffs mode)
                                if (viewMode === 'diffs' && childDiff.type === 'unchanged' && !hasChanges(childDiff)) {
                                    return null;
                                }
                                return renderNode(key, childDiff, 'root', 1, isRootArray, index === arr.length - 1);
                            })}

                            {/* Closing bracket */}
                            <div className="ml-4 py-1 px-2">
                                <span className="font-mono text-gray-500 dark:text-slate-400">
                                    {isRootArray ? ']' : '}'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer with type colors */}
            <div className="flex items-center justify-end gap-4 px-4 py-2 bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-200/50 dark:border-slate-700/50 text-xs text-gray-400 dark:text-slate-500">
                <span className="text-green-600 dark:text-green-400">&quot;string&quot;</span>
                <span className="text-blue-600 dark:text-blue-400">number</span>
                <span className="text-purple-600 dark:text-purple-400">boolean</span>
                <span className="text-gray-500 dark:text-gray-400 italic">null</span>
            </div>
        </div>
    );
};

export default StructuredDiffViewer;
