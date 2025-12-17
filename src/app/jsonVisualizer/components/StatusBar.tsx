'use client';

import { useMemo } from 'react';
import { JSONValue } from '../models/JsonModels';
import { DatabaseIcon, LayersIcon, HashIcon, CheckIcon, AlertCircleIcon } from './Icons';

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
}

/**
 * StatusBar Component
 *
 * Displays JSON statistics: size, node count, depth, validity status.
 * Professional design with icons and subtle styling.
 */
export default function StatusBar({ jsonInput, parsedJson, error }: StatusBarProps) {
    const stats = useMemo((): JsonStats => {
        // Calculate size
        const bytes = new Blob([jsonInput]).size;
        let size: string;
        if (bytes < 1024) {
            size = `${bytes} B`;
        } else if (bytes < 1024 * 1024) {
            size = `${(bytes / 1024).toFixed(1)} KB`;
        } else {
            size = `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
        }

        // Calculate node count and depth
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
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-800/50 to-slate-900/50 dark:from-slate-800 dark:to-slate-900 border-t border-slate-700/50 text-sm">
            <div className="flex items-center gap-6">
                {/* Size */}
                <div className="flex items-center gap-2 text-slate-400">
                    <DatabaseIcon size={14} className="text-slate-500" />
                    <span className="font-medium text-slate-300">{stats.size}</span>
                    <span className="text-slate-500">Size</span>
                </div>

                {/* Node Count */}
                <div className="flex items-center gap-2 text-slate-400">
                    <HashIcon size={14} className="text-slate-500" />
                    <span className="font-medium text-slate-300">{stats.nodeCount}</span>
                    <span className="text-slate-500">Nodes</span>
                </div>

                {/* Depth */}
                <div className="flex items-center gap-2 text-slate-400">
                    <LayersIcon size={14} className="text-slate-500" />
                    <span className="font-medium text-slate-300">{stats.depth}</span>
                    <span className="text-slate-500">Depth</span>
                </div>
            </div>

            {/* Validity Status */}
            <div className="flex items-center gap-2">
                {stats.isValid ? (
                    <>
                        <CheckIcon size={14} className="text-emerald-400" />
                        <span className="text-emerald-400 font-medium">Valid JSON</span>
                    </>
                ) : error ? (
                    <>
                        <AlertCircleIcon size={14} className="text-red-400" />
                        <span className="text-red-400 font-medium">Invalid JSON</span>
                    </>
                ) : (
                    <>
                        <AlertCircleIcon size={14} className="text-slate-500" />
                        <span className="text-slate-500">No input</span>
                    </>
                )}
            </div>
        </div>
    );
}
