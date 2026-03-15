'use client';

import React, { useState, useCallback } from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import { useFileIO } from '@/hooks/useFileIO';
import { DownloadIcon } from '@/components/shared/Icons';

interface HistoryEntry {
  ids: string[];
  type: string;
  timestamp: number;
}

interface OutputPanelProps {
  generatedIds: string[];
  history: HistoryEntry[];
  copiedId: string | null;
  onCopyId: (id: string) => void;
  onCopyAll: () => void;
  onClear: () => void;
}

/**
 * OutputPanel Component
 *
 * Right panel displaying generated IDs with individual copy buttons,
 * copy-all and clear actions, and a collapsible history section.
 */
export default function OutputPanel({
  generatedIds,
  history,
  copiedId,
  onCopyId,
  onCopyAll,
  onClear,
}: OutputPanelProps) {
  const [showHistory, setShowHistory] = useState(false);
  const { downloadFile } = useFileIO();

  const handleDownload = useCallback(() => {
    if (generatedIds.length === 0) return;
    downloadFile(generatedIds.join('\n'), 'generated-ids.txt');
  }, [generatedIds, downloadFile]);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
      <PanelHeader title="Generated IDs">
        {generatedIds.length > 0 && (
          <>
            <button
              onClick={handleDownload}
              className="p-1.5 rounded hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-colors"
              title="Download generated IDs"
            >
              <DownloadIcon size={14} className="text-gray-500 dark:text-gray-400" />
            </button>
            <button
              onClick={onCopyAll}
              className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              title="Copy all generated IDs"
            >
              Copy All
            </button>
            <button
              onClick={onClear}
              className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700/50 text-gray-600 dark:text-slate-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              title="Clear generated IDs"
            >
              Clear
            </button>
          </>
        )}
      </PanelHeader>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Generated IDs List */}
        {generatedIds.length > 0 ? (
          <div className="space-y-2">
            {generatedIds.map((id, index) => (
              <div
                key={`${id}-${index}`}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-gray-200/50 dark:border-slate-700/50 group"
              >
                <span className="text-xs text-gray-400 dark:text-slate-500 w-6 text-right flex-shrink-0">
                  {index + 1}
                </span>
                <code className="flex-1 font-mono text-sm text-gray-900 dark:text-slate-100 truncate select-all">
                  {id}
                </code>
                <button
                  onClick={() => onCopyId(id)}
                  className={`flex-shrink-0 px-2 py-1 rounded text-xs transition-all ${
                    copiedId === id
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : 'bg-gray-100 dark:bg-slate-700/50 text-gray-500 dark:text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                  title={copiedId === id ? 'Copied' : 'Copy this ID'}
                  aria-label={copiedId === id ? 'Copied' : `Copy ID ${id}`}
                >
                  {copiedId === id ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-slate-500">
            <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            <p className="text-sm">No IDs generated yet</p>
            <p className="text-xs mt-1">Configure settings and click Generate</p>
          </div>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <div className="border-t border-gray-200/50 dark:border-slate-700/50 pt-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 transition-colors"
              title={showHistory ? 'Hide generation history' : 'Show generation history'}
              aria-label={showHistory ? 'Collapse history' : 'Expand history'}
            >
              <svg
                className={`w-4 h-4 transition-transform ${showHistory ? 'rotate-90' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              History ({history.length})
            </button>

            {showHistory && (
              <div className="mt-3 space-y-3">
                {history.map((entry, idx) => (
                  <div
                    key={entry.timestamp}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800/40 border border-gray-200/30 dark:border-slate-700/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600 dark:text-slate-300">
                        {entry.type} ({entry.ids.length})
                      </span>
                      <span className="text-xs text-gray-400 dark:text-slate-500">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {entry.ids.slice(0, 3).map((id, idIdx) => (
                        <div
                          key={`history-${idx}-${idIdx}`}
                          className="font-mono text-xs text-gray-500 dark:text-slate-400 truncate"
                        >
                          {id}
                        </div>
                      ))}
                      {entry.ids.length > 3 && (
                        <div className="text-xs text-gray-400 dark:text-slate-500">
                          ...and {entry.ids.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
