'use client';
import React from 'react';
import { DiffResult, DiffType, DiffViewMode } from '../models/DiffModels';
import { DiffLineDisplay } from './DiffLineDisplay';
import { UnifiedDiffDisplay } from './UnifiedDiffDisplay';
import { TextCompareService } from '../services/TextCompareService';

interface DiffResultDisplayProps {
  diffResult: DiffResult;
  compareService: TextCompareService;
  viewMode: DiffViewMode;
  onViewModeChange: (mode: DiffViewMode) => void;
}

/**
 * Component for displaying the complete diff result
 * Follows Single Responsibility Principle
 */
export const DiffResultDisplay: React.FC<DiffResultDisplayProps> = ({
  diffResult,
  compareService,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Differences</h2>

        <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded overflow-hidden">
          <button
            onClick={() => onViewModeChange('side-by-side')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === 'side-by-side'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
            title="Side-by-side view"
            aria-label="Side-by-side view"
          >
            Side-by-Side
          </button>
          <button
            onClick={() => onViewModeChange('unified')}
            className={`px-3 py-1 text-xs font-medium transition-colors ${
              viewMode === 'unified'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
            title="Unified view"
            aria-label="Unified view"
          >
            Unified
          </button>
        </div>
      </div>

      {diffResult.notice && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm">
          {diffResult.notice}
        </div>
      )}

      {viewMode === 'unified' ? (
        <UnifiedDiffDisplay diffResult={diffResult} compareService={compareService} />
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
          {/* Left Side */}
          <div className="w-full lg:w-1/2 border-r dark:border-slate-700">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 p-3 font-semibold border-b dark:border-slate-600 text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Original Text
            </div>
            <div className="overflow-auto">
              {diffResult.left.map((line, index) => {
                // Compute word-level diff for changed lines
                const rightLine = diffResult.right[index];
                const wordDiff =
                  line.type === DiffType.CHANGED && rightLine?.text
                    ? compareService.compareWords(line.text, rightLine.text).left
                    : undefined;

                return (
                  <DiffLineDisplay
                    key={`left-${index}`}
                    line={line}
                    wordDiff={wordDiff}
                  />
                );
              })}
            </div>
          </div>

          {/* Right Side */}
          <div className="w-full lg:w-1/2">
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 p-3 font-semibold border-b dark:border-slate-600 text-gray-800 dark:text-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Modified Text
            </div>
            <div className="overflow-auto">
              {diffResult.right.map((line, index) => {
                // Compute word-level diff for changed lines
                const leftLine = diffResult.left[index];
                const wordDiff =
                  line.type === DiffType.CHANGED && leftLine?.text
                    ? compareService.compareWords(leftLine.text, line.text).right
                    : undefined;

                return (
                  <DiffLineDisplay
                    key={`right-${index}`}
                    line={line}
                    wordDiff={wordDiff}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-100 dark:bg-red-900/40 border border-red-300 dark:border-red-700 rounded"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Removed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Added</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-300 dark:border-yellow-700 rounded"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Modified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-300 dark:bg-yellow-600 border border-yellow-400 dark:border-yellow-500 rounded"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Word-level changes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
