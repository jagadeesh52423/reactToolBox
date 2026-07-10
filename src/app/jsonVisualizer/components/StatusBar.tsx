'use client';

import { useMemo } from 'react';
import { JSONValue } from '../models/JsonModels';
import { DatabaseIcon, LayersIcon, HashIcon, CheckIcon, AlertCircleIcon } from '@/components/shared/Icons';

interface JsonStats {
    size: string;
    nodeCount: number;
    depth: number;
    isValid: boolean;
}

interface StatusBarProps {
    jsonInput: string;
    parsedJson: JSONValue | null;
    error: string | null;
    canUndo?: boolean;
    canRedo?: boolean;
    onUndo?: () => void;
    onRedo?: () => void;
}

export default function StatusBar({ jsonInput, parsedJson, error, canUndo, canRedo, onUndo, onRedo }: StatusBarProps) {
    const stats = useMemo((): JsonStats => {
        const bytes = new Blob([jsonInput]).size;
        let size: string;
        if (bytes < 1024) {
            size = `${bytes} B`;
        } else if (bytes < 1024 * 1024) {
            size = `${(bytes / 1024).toFixed(1)} KB`;
        } else {
            size = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        }

        let nodeCount = 0;
        let maxDepth = 0;

        const countNodes = (value: JSONValue, depth: number): void => {
            if (depth > maxDepth) maxDepth = depth;

            if (value === null || typeof value !== 'object') {
                nodeCount++;
                return;
            }

            nodeCount++;
            const entries = Object.values(value);
            entries.forEach(v => countNodes(v, depth + 1));
        };

        if (parsedJson !== null) {
            countNodes(parsedJson, 1);
        }

        return {
            size,
            nodeCount,
            depth: maxDepth,
            isValid: !error && jsonInput.trim().length > 0
        };
    }, [jsonInput, parsedJson, error]);

    return (
        <div
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-4 py-2 border-t text-sm"
            style={{
                background: 'var(--jv-bg-secondary)',
                borderColor: 'var(--jv-border)',
                fontFamily: 'var(--jv-font-sans)',
            }}
        >
            <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                {/* Size */}
                <div className="flex items-center gap-2" style={{ color: 'var(--jv-text-muted)' }}>
                    <DatabaseIcon size={14} />
                    <span className="font-medium" style={{ color: 'var(--jv-text-secondary)' }}>{stats.size}</span>
                    <span>Size</span>
                </div>

                {/* Node Count */}
                <div className="flex items-center gap-2" style={{ color: 'var(--jv-text-muted)' }}>
                    <HashIcon size={14} />
                    <span className="font-medium" style={{ color: 'var(--jv-text-secondary)' }}>{stats.nodeCount}</span>
                    <span>Nodes</span>
                </div>

                {/* Depth */}
                <div className="flex items-center gap-2" style={{ color: 'var(--jv-text-muted)' }}>
                    <LayersIcon size={14} />
                    <span className="font-medium" style={{ color: 'var(--jv-text-secondary)' }}>{stats.depth}</span>
                    <span>Depth</span>
                </div>

                {/* Undo/Redo */}
                <div className="flex items-center gap-1">
                    {onUndo && (
                        <button
                            onClick={onUndo}
                            disabled={!canUndo}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all disabled:opacity-30"
                            style={{
                                color: 'var(--jv-text-secondary)',
                                fontFamily: 'var(--jv-font-sans)',
                            }}
                            title="Undo (⌘Z)"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 7v6h6" /><path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13" />
                            </svg>
                            <span>Undo</span>
                        </button>
                    )}
                    {onRedo && (
                        <button
                            onClick={onRedo}
                            disabled={!canRedo}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all disabled:opacity-30"
                            style={{
                                color: 'var(--jv-text-secondary)',
                                fontFamily: 'var(--jv-font-sans)',
                            }}
                            title="Redo (⌘⇧Z)"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 019-9 9 9 0 016 2.3L21 13" />
                            </svg>
                            <span>Redo</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Validity Status */}
            <div className="flex items-center gap-2">
                {stats.isValid ? (
                    <>
                        <span style={{ color: 'var(--jv-success)' }}><CheckIcon size={14} /></span>
                        <span className="font-medium" style={{ color: 'var(--jv-success)' }}>Valid JSON</span>
                    </>
                ) : error ? (
                    <>
                        <span style={{ color: 'var(--jv-danger)' }}><AlertCircleIcon size={14} /></span>
                        <span className="font-medium" style={{ color: 'var(--jv-danger)' }}>Invalid JSON</span>
                    </>
                ) : (
                    <>
                        <span style={{ color: 'var(--jv-text-muted)' }}><AlertCircleIcon size={14} /></span>
                        <span style={{ color: 'var(--jv-text-muted)' }}>No input</span>
                    </>
                )}
            </div>
        </div>
    );
}
