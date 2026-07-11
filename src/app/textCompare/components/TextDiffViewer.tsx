'use client';
import React, { useCallback, useState } from 'react';
import { useTextCompare } from '../hooks/useTextCompare';
import { DiffViewMode } from '../models/DiffModels';
import { useFileIO } from '@/hooks/useFileIO';
import { TextInputPanel } from './TextInputPanel';
import { CompareControls } from './CompareControls';
import { DiffStatisticsDisplay } from './DiffStatisticsDisplay';
import { DiffResultDisplay } from './DiffResultDisplay';
import { DownloadIcon } from '@/components/shared/Icons';
import { buildDiffReport } from '../utils/diffReportBuilder';

const DEFAULT_TEXT_LEFT = `This is a sample text.
It has multiple lines.
We will compare this with another text.
This line will be removed.
This line will stay the same.`;

const DEFAULT_TEXT_RIGHT = `This is a sample text.
It has multiple lines with some changes.
We will compare this with another text.
This line will stay the same.
This is a new line added to the right text.`;

/**
 * Main Text Diff Viewer Component (Refactored)
 *
 * Refactored following SOLID principles and design patterns:
 *
 * - Single Responsibility: Component only orchestrates sub-components
 * - Open/Closed: Easy to extend with new diff algorithms
 * - Dependency Inversion: Depends on abstractions (hook, services)
 * - Strategy Pattern: Different diff algorithms (currently LineDiff)
 * - Service Layer: Business logic separated from UI
 * - Separation of Concerns: Algorithm, Service, Hook, Components are separate
 *
 * Architecture:
 * - Algorithm: LineDiffAlgorithm with look-ahead optimization
 * - WordDiffProcessor: LCS-based word-level diff (O(m*n) dynamic programming)
 * - Service: TextCompareService coordinates diff operations
 * - Hook: useTextCompare manages state and business logic
 * - Components: Focused UI components with single responsibilities
 */
const TextDiffViewer: React.FC = () => {
  const {
    leftText,
    rightText,
    diffResult,
    statistics,
    showDiff,
    options,
    isAutoDiffPaused,
    setLeftText,
    setRightText,
    computeDiff,
    resetTexts,
    updateOptions,
    swapTexts,
    compareService,
  } = useTextCompare(DEFAULT_TEXT_LEFT, DEFAULT_TEXT_RIGHT);

  const [viewMode, setViewMode] = useState<DiffViewMode>('side-by-side');

  const { downloadFile } = useFileIO();

  const handleDownloadDiff = useCallback(() => {
    if (!statistics || !diffResult) return;
    downloadFile(buildDiffReport(diffResult, statistics), 'text-compare-report.txt');
  }, [statistics, diffResult, downloadFile]);

  const handleCopyDiff = useCallback(async (): Promise<boolean> => {
    if (!statistics || !diffResult) return false;
    if (!navigator.clipboard) return false;
    try {
      await navigator.clipboard.writeText(buildDiffReport(diffResult, statistics));
      return true;
    } catch {
      return false;
    }
  }, [statistics, diffResult]);

  return (
    <div className="h-[var(--tool-content-height)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <main className="flex-1 p-6 overflow-auto min-h-0">
        <div className="flex flex-col gap-4">
          {/* Input Panels */}
          <div className="flex flex-col lg:flex-row gap-4">
            <TextInputPanel
              title="Original Text"
              value={leftText}
              onChange={setLeftText}
              placeholder="Enter original text here..."
            />
            <TextInputPanel
              title="Modified Text"
              value={rightText}
              onChange={setRightText}
              placeholder="Enter modified text here..."
            />
          </div>

          {/* Controls */}
          <CompareControls
            onCompare={computeDiff}
            onSwap={swapTexts}
            onReset={resetTexts}
            options={options}
            onOptionsChange={updateOptions}
            disabled={!leftText && !rightText}
            isAutoDiffPaused={isAutoDiffPaused}
          />

          {/* Statistics */}
          {showDiff && statistics && (
            <div className="relative">
              <DiffStatisticsDisplay statistics={statistics} />
              <button
                onClick={handleDownloadDiff}
                className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                title="Download diff report"
              >
                <DownloadIcon size={16} />
                <span>Export</span>
              </button>
            </div>
          )}

          {/* Diff Result */}
          {showDiff && diffResult && (
            <DiffResultDisplay
              diffResult={diffResult}
              compareService={compareService}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              options={options}
              onCopyDiff={handleCopyDiff}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default TextDiffViewer;
