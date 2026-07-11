'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { DiffLine, DiffOptions, DiffResult, DiffType, DiffViewMode } from '../models/DiffModels';
import { DiffLineDisplay } from './DiffLineDisplay';
import { UnifiedDiffDisplay } from './UnifiedDiffDisplay';
import { TextCompareService } from '../services/TextCompareService';
import { collapseUnchangedRuns } from '../utils/collapseRows';
import { buildUnifiedDiffRows } from '../utils/unifiedDiffRows';
import { useDiffSearch, SearchableRow } from '../hooks/useDiffSearch';
import { CopyIcon, CheckIcon, SearchIcon, XIcon } from '@/components/shared/Icons';

interface DiffResultDisplayProps {
  diffResult: DiffResult;
  compareService: TextCompareService;
  viewMode: DiffViewMode;
  onViewModeChange: (mode: DiffViewMode) => void;
  options: DiffOptions;
  onCopyDiff: () => Promise<boolean>;
}

interface PairedLine {
  index: number;
  left: DiffLine;
  right: DiffLine;
}

const isUnchangedPair = (pair: PairedLine): boolean =>
  pair.left.type === DiffType.UNCHANGED && pair.right.type === DiffType.UNCHANGED;

const COPY_FEEDBACK_MS = 2000;

/**
 * Component for displaying the complete diff result
 * Follows Single Responsibility Principle
 */
export const DiffResultDisplay: React.FC<DiffResultDisplayProps> = ({
  diffResult,
  compareService,
  viewMode,
  onViewModeChange,
  options,
  onCopyDiff,
}) => {
  const [expandedFoldIds, setExpandedFoldIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  // A fold's identity only makes sense for the diff it was computed from — reset on
  // every new diff result rather than carry stale expansion state across recomputes.
  useEffect(() => {
    setExpandedFoldIds(new Set());
  }, [diffResult]);

  const pairs = useMemo<PairedLine[]>(
    () =>
      diffResult.left.map((left, index) => ({
        index,
        left,
        right: diffResult.right[index],
      })),
    [diffResult]
  );

  // Computed once here (not inside UnifiedDiffDisplay) so both the unified renderer
  // and the search index share the same row list regardless of which view is active.
  const unifiedRows = useMemo(
    () => buildUnifiedDiffRows(diffResult, compareService, options.granularity),
    [diffResult, compareService, options.granularity]
  );

  const searchableRows = useMemo<SearchableRow[]>(() => {
    if (viewMode === 'unified') {
      return unifiedRows.map((row) => ({ id: row.key, text: row.text, isChange: row.type !== DiffType.UNCHANGED }));
    }
    const rows: SearchableRow[] = [];
    for (const pair of pairs) {
      if (pair.left.type !== DiffType.PLACEHOLDER) {
        rows.push({ id: `left-${pair.index}`, text: pair.left.text, isChange: pair.left.type !== DiffType.UNCHANGED });
      }
      if (pair.right.type !== DiffType.PLACEHOLDER) {
        rows.push({ id: `right-${pair.index}`, text: pair.right.text, isChange: pair.right.type !== DiffType.UNCHANGED });
      }
    }
    return rows;
  }, [viewMode, unifiedRows, pairs]);

  const search = useDiffSearch(searchableRows);

  const effectiveContextLines = options.diffOnly ? 0 : options.contextLines ?? 3;

  const collapsed = useMemo(
    () => collapseUnchangedRuns(pairs, isUnchangedPair, effectiveContextLines, expandedFoldIds),
    [pairs, effectiveContextLines, expandedFoldIds]
  );

  // While a search is active, folds would hide matches with no way to reach them —
  // force everything open for the duration of the search (side-by-side view).
  useEffect(() => {
    if (search.isActive && collapsed.foldIds.length > expandedFoldIds.size) {
      setExpandedFoldIds(new Set(collapsed.foldIds));
    }
  }, [search.isActive, collapsed.foldIds, expandedFoldIds]);

  // Keep the active match scrolled into view as the user steps through results.
  useEffect(() => {
    if (!search.currentMatch) return;
    const el = document.querySelector('[data-active-match="true"]');
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [search.currentMatch, viewMode]);

  const expandFold = useCallback((foldId: string) => {
    setExpandedFoldIds((prev) => new Set(prev).add(foldId));
  }, []);

  const expandAll = useCallback(() => {
    setExpandedFoldIds(new Set(collapsed.foldIds));
  }, [collapsed.foldIds]);

  const handleCopyDiff = useCallback(async () => {
    const success = await onCopyDiff();
    if (!success) return;
    setCopied(true);
    setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  }, [onCopyDiff]);

  const renderFoldRow = (foldId: string, hiddenCount: number) => (
    <button
      key={foldId}
      onClick={() => expandFold(foldId)}
      className="w-full text-left px-2 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-b dark:border-slate-700 transition-colors"
    >
      ⋯ {hiddenCount} unchanged line{hiddenCount === 1 ? '' : 's'} — click to expand
    </button>
  );

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">Differences</h2>

        <div className="flex flex-wrap items-center gap-2">
          {collapsed.foldIds.length > expandedFoldIds.size && (
            <button
              onClick={expandAll}
              className="px-3 py-1.5 text-xs font-medium rounded text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
            >
              Expand All
            </button>
          )}
          <button
            onClick={handleCopyDiff}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            title="Copy diff report to clipboard"
          >
            {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            <span>{copied ? 'Copied!' : 'Copy Diff'}</span>
          </button>
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
      </div>

      {/* Find bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-2">
        <SearchIcon size={16} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
        <input
          type="text"
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
          placeholder="Search within the diff..."
          className="flex-1 min-w-[160px] px-2 py-1 text-sm rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        {search.query && (
          <button
            onClick={() => search.setQuery('')}
            title="Clear search"
            aria-label="Clear search"
            className="p-1 rounded text-gray-400 dark:text-slate-500 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
          >
            <XIcon size={14} />
          </button>
        )}
        <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={search.isRegex}
            onChange={(e) => search.setIsRegex(e.target.checked)}
            className="w-3.5 h-3.5 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
          />
          Regex
        </label>
        <label className="flex items-center gap-1 text-xs text-gray-600 dark:text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={search.scopeToChanges}
            onChange={(e) => search.setScopeToChanges(e.target.checked)}
            className="w-3.5 h-3.5 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
          />
          Changes only
        </label>
        {search.isActive && (
          <div className="flex items-center gap-1">
            <button
              onClick={search.goToPrevious}
              disabled={search.matchCount === 0}
              title="Previous match"
              aria-label="Previous match"
              className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ↑
            </button>
            <button
              onClick={search.goToNext}
              disabled={search.matchCount === 0}
              title="Next match"
              aria-label="Next match"
              className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ↓
            </button>
            <span className="text-xs text-gray-600 dark:text-slate-300 tabular-nums">
              {search.matchCount > 0 ? `${search.currentIndex + 1} / ${search.matchCount}` : '0 matches'}
            </span>
          </div>
        )}
        {search.error && <span className="text-xs text-red-600 dark:text-red-400">{search.error}</span>}
      </div>

      {diffResult.notice && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-sm">
          {diffResult.notice}
        </div>
      )}

      {viewMode === 'unified' ? (
        <UnifiedDiffDisplay
          rows={unifiedRows}
          options={options}
          matchesByRowId={search.matchesByRowId}
          activeMatch={search.currentMatch}
          forceExpandFolds={search.isActive}
        />
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
              {collapsed.entries.map((entry) =>
                entry.kind === 'fold' ? (
                  renderFoldRow(entry.id, entry.hiddenCount)
                ) : (
                  (() => {
                    const { left, right, index } = entry.row;
                    const rowId = `left-${index}`;
                    const rowMatches = search.matchesByRowId.get(rowId) ?? [];
                    const activeRange = search.currentMatch && search.currentMatch.rowId === rowId ? search.currentMatch : null;
                    const wordDiff =
                      rowMatches.length === 0 && left.type === DiffType.CHANGED && right?.text
                        ? compareService.compareWords(left.text, right.text, options.granularity).left
                        : undefined;
                    return (
                      <DiffLineDisplay
                        key={rowId}
                        line={left}
                        wordDiff={wordDiff}
                        searchMatches={rowMatches}
                        activeMatchRange={activeRange}
                      />
                    );
                  })()
                )
              )}
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
              {collapsed.entries.map((entry) =>
                entry.kind === 'fold' ? (
                  renderFoldRow(entry.id, entry.hiddenCount)
                ) : (
                  (() => {
                    const { left, right, index } = entry.row;
                    const rowId = `right-${index}`;
                    const rowMatches = search.matchesByRowId.get(rowId) ?? [];
                    const activeRange = search.currentMatch && search.currentMatch.rowId === rowId ? search.currentMatch : null;
                    const wordDiff =
                      rowMatches.length === 0 && right.type === DiffType.CHANGED && left?.text
                        ? compareService.compareWords(left.text, right.text, options.granularity).right
                        : undefined;
                    return (
                      <DiffLineDisplay
                        key={rowId}
                        line={right}
                        wordDiff={wordDiff}
                        searchMatches={rowMatches}
                        activeMatchRange={activeRange}
                      />
                    );
                  })()
                )
              )}
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
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-200 dark:bg-orange-700/60 border border-orange-300 dark:border-orange-600 rounded"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Search match</span>
          </div>
        </div>
      </div>
    </div>
  );
};
