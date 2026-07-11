'use client';
import React, { useCallback, useState } from 'react';
import { useTextCompare } from '../hooks/useTextCompare';
import { DiffViewMode } from '../models/DiffModels';
import { useFileIO } from '@/hooks/useFileIO';
import { TextInputPanel } from './TextInputPanel';
import { DiffResultDisplay, ShareStatus } from './DiffResultDisplay';
import { ExportFormat } from './ExportMenu';
import { ArrowsRightLeftIcon, RefreshIcon } from '@/components/shared/Icons';
import { buildDiffReport } from '../utils/diffReportBuilder';
import { buildMarkdownReport, buildHtmlReport, buildUnifiedPatch } from '../utils/exporters';
import { encodeShareState, buildShareUrl } from '../utils/shareLink';

const SHARE_FEEDBACK_MS = 2500;

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
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');

  const { downloadFile } = useFileIO();

  const handleExport = useCallback(
    (format: ExportFormat) => {
      if (!statistics || !diffResult) return;
      switch (format) {
        case 'txt':
          downloadFile(buildDiffReport(diffResult, statistics), 'text-compare-report.txt');
          break;
        case 'md':
          downloadFile(buildMarkdownReport(diffResult, statistics), 'text-compare-report.md', 'text/markdown');
          break;
        case 'html':
          downloadFile(buildHtmlReport(diffResult, statistics), 'text-compare-report.html', 'text/html');
          break;
        case 'diff':
          downloadFile(buildUnifiedPatch(diffResult, options.contextLines ?? 3), 'text-compare.diff', 'text/x-patch');
          break;
      }
    },
    [statistics, diffResult, options.contextLines, downloadFile]
  );

  const handleShare = useCallback(async () => {
    const result = await encodeShareState({ leftText, rightText, options });
    if (!result.ok) {
      setShareStatus(result.reason);
      setTimeout(() => setShareStatus('idle'), SHARE_FEEDBACK_MS);
      return;
    }

    window.location.hash = result.hash;
    try {
      await navigator.clipboard?.writeText(buildShareUrl(result.hash));
      setShareStatus('copied');
    } catch {
      setShareStatus('error');
    }
    setTimeout(() => setShareStatus('idle'), SHARE_FEEDBACK_MS);
  }, [leftText, rightText, options]);

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

  const diffIsShown = showDiff && !!diffResult && !!statistics;

  return (
    <div className="h-[var(--tool-content-height)] flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <main className="flex-1 flex flex-col min-h-0 p-4 gap-3">
        {/* Input region: header row (auto-diff-paused affordance + swap/reset) + panels */}
        <div className={`flex flex-col gap-2 min-h-0 ${diffIsShown ? 'flex-none' : 'flex-1'}`}>
          <div className="flex flex-wrap items-center gap-2">
            {isAutoDiffPaused && (
              <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg px-3 py-1.5">
                <span>Input is large — live diffing is paused.</span>
                <button
                  onClick={computeDiff}
                  className="px-2 py-1 text-xs font-semibold rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                >
                  Compare
                </button>
              </div>
            )}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={swapTexts}
                disabled={!leftText && !rightText}
                title="Swap original and modified text"
                aria-label="Swap texts"
                className="p-1.5 rounded text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowsRightLeftIcon size={16} />
              </button>
              <button
                onClick={resetTexts}
                disabled={!leftText && !rightText}
                title="Reset both texts"
                aria-label="Reset texts"
                className="p-1.5 rounded text-gray-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshIcon size={16} />
              </button>
            </div>
          </div>

          <div
            className={`flex flex-col lg:flex-row gap-4 min-h-0 ${
              diffIsShown ? 'h-[clamp(120px,20vh,150px)]' : 'flex-1'
            }`}
          >
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
        </div>

        {/* Diff Result (toolbar, stats, output) — fills remaining space, scrolls internally */}
        {showDiff && diffResult && statistics && (
          <DiffResultDisplay
            diffResult={diffResult}
            compareService={compareService}
            statistics={statistics}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            options={options}
            onOptionsChange={updateOptions}
            onCopyDiff={handleCopyDiff}
            onShare={handleShare}
            shareStatus={shareStatus}
            onExport={handleExport}
          />
        )}
      </main>
    </div>
  );
};

export default TextDiffViewer;
