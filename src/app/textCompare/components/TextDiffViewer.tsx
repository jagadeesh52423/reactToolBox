'use client';
import React, { useCallback, useState } from 'react';
import { useTextCompare } from '../hooks/useTextCompare';
import { DiffViewMode } from '../models/DiffModels';
import { useFileIO } from '@/hooks/useFileIO';
import { TextInputPanel } from './TextInputPanel';
import { CompareControls } from './CompareControls';
import { DiffStatisticsDisplay } from './DiffStatisticsDisplay';
import { DiffResultDisplay } from './DiffResultDisplay';
import { ExportMenu, ExportFormat } from './ExportMenu';
import { LinkIcon, ClipboardCheckIcon } from '@/components/shared/Icons';
import { buildDiffReport } from '../utils/diffReportBuilder';
import { buildMarkdownReport, buildHtmlReport, buildUnifiedPatch } from '../utils/exporters';
import { encodeShareState, buildShareUrl } from '../utils/shareLink';

type ShareStatus = 'idle' | 'copied' | 'too-large' | 'unsupported' | 'error';

const SHARE_FEEDBACK_MS = 2500;

const SHARE_ERROR_MESSAGES: Partial<Record<ShareStatus, string>> = {
  'too-large': 'Input too large to share.',
  unsupported: "Sharing isn't supported in this browser.",
  error: 'Could not copy the link — copy it from the address bar instead.',
};

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
              <div className="absolute top-2 right-2 flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                  title="Copy a shareable link to this diff"
                >
                  {shareStatus === 'copied' ? <ClipboardCheckIcon size={16} /> : <LinkIcon size={16} />}
                  <span>{shareStatus === 'copied' ? 'Link Copied!' : 'Share'}</span>
                </button>
                <ExportMenu onExport={handleExport} />
              </div>
              {SHARE_ERROR_MESSAGES[shareStatus] && (
                <div className="absolute top-11 right-2 text-xs text-red-600 dark:text-red-400 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-700 rounded px-2 py-1 shadow-sm z-10">
                  {SHARE_ERROR_MESSAGES[shareStatus]}
                </div>
              )}
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
