'use client';
import React from 'react';
import { DiffOptions } from '../models/DiffModels';

interface CompareControlsProps {
  onCompare: () => void;
  onSwap: () => void;
  onReset: () => void;
  options: DiffOptions;
  onOptionsChange: (options: Partial<DiffOptions>) => void;
  disabled?: boolean;
  isAutoDiffPaused?: boolean;
}

/**
 * Component for comparison controls
 * Follows Single Responsibility Principle
 */
export const CompareControls: React.FC<CompareControlsProps> = ({
  onCompare,
  onSwap,
  onReset,
  options,
  onOptionsChange,
  disabled = false,
  isAutoDiffPaused = false,
}) => {
  return (
    <div className="flex flex-col gap-4 bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-600 rounded-lg p-4">
      {/* Options */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.ignoreWhitespace || false}
            onChange={(e) => onOptionsChange({ ignoreWhitespace: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Ignore Whitespace</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.ignoreCase || false}
            onChange={(e) => onOptionsChange({ ignoreCase: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Ignore Case</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Context Lines</span>
          <input
            type="number"
            min={0}
            max={50}
            value={options.contextLines ?? 3}
            onChange={(e) => onOptionsChange({ contextLines: Math.max(0, Number(e.target.value) || 0) })}
            className="w-16 px-2 py-1 text-sm rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            title="Unchanged lines beyond this count fold into a collapsible section"
          />
        </label>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Granularity</span>
          <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded overflow-hidden">
            <button
              onClick={() => onOptionsChange({ granularity: 'word' })}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                (options.granularity ?? 'word') === 'word'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
              title="Highlight changes by word"
              aria-label="Word-level granularity"
            >
              Word
            </button>
            <button
              onClick={() => onOptionsChange({ granularity: 'char' })}
              className={`px-3 py-1 text-xs font-medium transition-colors ${
                options.granularity === 'char'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
              }`}
              title="Highlight changes by character"
              aria-label="Character-level granularity"
            >
              Char
            </button>
          </div>
        </div>
      </div>

      {isAutoDiffPaused && (
        <div className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-2">
          Input is large — live diffing is paused. Click Compare to update.
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onCompare}
          disabled={disabled}
          className={`flex items-center gap-2 disabled:bg-gray-400 font-semibold py-2 px-6 rounded-lg transition-colors ${
            isAutoDiffPaused
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200'
          }`}
          title={isAutoDiffPaused ? 'Compare now (auto-diff paused for large input)' : 'Diff updates automatically — click to force a refresh'}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Compare Text
        </button>

        <button
          onClick={onSwap}
          disabled={disabled}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Swap
        </button>

        <button
          onClick={onReset}
          disabled={disabled}
          className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
      </div>
    </div>
  );
};
