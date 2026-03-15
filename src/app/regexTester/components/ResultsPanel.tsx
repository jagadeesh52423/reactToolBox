'use client';

import React, { useCallback } from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import { useFileIO } from '@/hooks/useFileIO';
import { DownloadIcon } from '@/components/shared/Icons';

interface MatchInfo {
    fullMatch: string;
    index: number;
    groups: Record<string, string> | null;
    captures: string[];
}

interface ResultsPanelProps {
    matches: MatchInfo[];
    pattern: string;
    testString: string;
}

/**
 * ResultsPanel Component
 *
 * Right panel displaying match results including full matches,
 * capture groups, and named groups in a scrollable card layout.
 */
export default function ResultsPanel({ matches, pattern, testString }: ResultsPanelProps) {
    const { downloadFile } = useFileIO();

    const handleDownload = useCallback(() => {
        const lines = matches.map((m, i) => {
            let entry = `Match ${i + 1}: "${m.fullMatch}" at index ${m.index}`;
            if (m.captures.length > 0) {
                entry += `\n  Captures: ${m.captures.map((c, j) => `$${j + 1}="${c}"`).join(', ')}`;
            }
            if (m.groups && Object.keys(m.groups).length > 0) {
                entry += `\n  Groups: ${Object.entries(m.groups).map(([k, v]) => `${k}="${v}"`).join(', ')}`;
            }
            return entry;
        });
        const report = [
            `Pattern: /${pattern}/`,
            `Total matches: ${matches.length}`,
            '',
            ...lines,
        ].join('\n');
        downloadFile(report, 'regex-matches.txt');
    }, [matches, pattern, downloadFile]);

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full">
            <PanelHeader title="Results">
                {matches.length > 0 && (
                    <>
                    <button
                        onClick={handleDownload}
                        className="p-1.5 rounded hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-colors"
                        title="Download matches"
                    >
                        <DownloadIcon size={14} className="text-gray-500 dark:text-gray-400" />
                    </button>
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {matches.length} match{matches.length !== 1 ? 'es' : ''}
                    </span>
                    </>
                )}
            </PanelHeader>

            <div className="flex-1 overflow-auto p-4 min-h-0">
                {/* Empty states */}
                {!pattern && !testString && (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-slate-500">
                        <div className="text-center">
                            <div className="text-4xl mb-3 opacity-50">.*</div>
                            <p className="text-sm">Enter a regex pattern and test string to see matches</p>
                        </div>
                    </div>
                )}

                {pattern && !testString && (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-slate-500">
                        <p className="text-sm">Enter a test string to see matches</p>
                    </div>
                )}

                {pattern && testString && matches.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-slate-500">
                        <div className="text-center">
                            <div className="text-2xl mb-2 opacity-50">No matches</div>
                            <p className="text-sm">The pattern does not match any part of the test string</p>
                        </div>
                    </div>
                )}

                {/* Match results */}
                {matches.length > 0 && (
                    <div className="space-y-3">
                        {matches.map((match, idx) => (
                            <div
                                key={`${match.index}-${idx}`}
                                className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-200/50 dark:border-gray-700/50"
                            >
                                {/* Match header */}
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Match {idx + 1}
                                    </span>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        Index: {match.index}
                                    </span>
                                </div>

                                {/* Full match */}
                                <div className="mb-2">
                                    <span className="font-mono text-sm bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 px-1.5 py-0.5 rounded">
                                        {match.fullMatch}
                                    </span>
                                </div>

                                {/* Capture groups */}
                                {match.captures.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Capture Groups
                                        </div>
                                        <div className="space-y-1">
                                            {match.captures.map((capture, capIdx) => (
                                                <div key={capIdx} className="flex items-center gap-2 text-xs">
                                                    <span className="text-gray-400 dark:text-gray-500 font-mono w-6 text-right">
                                                        ${capIdx + 1}
                                                    </span>
                                                    <span className="font-mono text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded">
                                                        {capture ?? 'undefined'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Named groups */}
                                {match.groups && Object.keys(match.groups).length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                            Named Groups
                                        </div>
                                        <div className="space-y-1">
                                            {Object.entries(match.groups).map(([name, value]) => (
                                                <div key={name} className="flex items-center gap-2 text-xs">
                                                    <span className="text-gray-400 dark:text-gray-500 font-mono">
                                                        {name}
                                                    </span>
                                                    <span className="font-mono text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                                                        {value ?? 'undefined'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
