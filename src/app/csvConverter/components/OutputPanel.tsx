'use client';

import React, { useState } from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import CodeEditor from '@/components/common/CodeEditor';
import TableView from './TableView';

type ViewMode = 'code' | 'table';

interface OutputPanelProps {
  value: string;
  headers: string[];
  rows: Record<string, string>[];
  error: string | null;
  onCopy: () => void;
}

/**
 * OutputPanel Component
 *
 * Right panel displaying converted output as code or a rendered table.
 * Includes a view toggle in the panel header.
 */
export default function OutputPanel({
  value,
  headers,
  rows,
  error,
  onCopy,
}: OutputPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('code');

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
      <PanelHeader title="Output">
        {/* View Toggle */}
        <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded overflow-hidden">
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === 'code'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
            title="Code view"
            aria-label="Code view"
          >
            Code
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
            title="Table view"
            aria-label="Table view"
          >
            Table
          </button>
        </div>

        {/* Copy Button */}
        <button
          onClick={onCopy}
          disabled={!value}
          className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Copy output"
          aria-label="Copy output to clipboard"
        >
          Copy
        </button>
      </PanelHeader>

      <div className="flex-1 overflow-hidden min-h-0">
        {error ? (
          <div className="p-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-500/30">
              <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
            </div>
          </div>
        ) : viewMode === 'code' ? (
          <CodeEditor
            value={value}
            onChange={() => {}}
            readOnly
            placeholder="Converted output will appear here..."
          />
        ) : (
          <TableView headers={headers} rows={rows} />
        )}
      </div>
    </div>
  );
}
