'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { DiffOptions, DiffType } from '../models/DiffModels';
import { UnifiedDiffRow } from '../utils/unifiedDiffRows';
import { collapseUnchangedRuns } from '../utils/collapseRows';
import { buildHighlightSegments, SearchMatch } from '../hooks/useDiffSearch';
import { hunkAnchorId } from '../utils/hunks';
import { CopyIcon, CheckIcon } from '@/components/shared/Icons';

interface UnifiedDiffDisplayProps {
  rows: UnifiedDiffRow[];
  options: DiffOptions;
  matchesByRowId: Map<string, SearchMatch[]>;
  activeMatch: SearchMatch | null;
  forceExpandFolds: boolean;
  /** Copy text for each hunk, keyed by the pairIndex of that hunk's first row. */
  hunkTextByStartPairIndex: Map<number, string>;
  copiedPairIndex: number | null;
  onCopyHunk: (pairIndex: number, text: string) => void;
}

const ROW_STYLES: Record<UnifiedDiffRow['type'], { bg: string; text: string; marker: string }> = {
  [DiffType.ADDED]: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    marker: '+',
  },
  [DiffType.REMOVED]: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-800 dark:text-red-300',
    marker: '-',
  },
  [DiffType.UNCHANGED]: {
    bg: '',
    text: 'text-gray-800 dark:text-slate-200',
    marker: ' ',
  },
  [DiffType.MOVED]: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-800 dark:text-indigo-300',
    // Marker is picked per-row (below) since a MOVED row still represents either an
    // old-side removal or a new-side addition — oldLineNumber/newLineNumber tell which.
    marker: '±',
  },
};

const isUnchangedRow = (row: UnifiedDiffRow): boolean => row.type === DiffType.UNCHANGED;

/**
 * Single-column unified diff view: additions/removals/unchanged lines interleaved
 * in document order, with separate old/new line-number gutters (GitHub-style).
 */
export const UnifiedDiffDisplay: React.FC<UnifiedDiffDisplayProps> = ({
  rows,
  options,
  matchesByRowId,
  activeMatch,
  forceExpandFolds,
  hunkTextByStartPairIndex,
  copiedPairIndex,
  onCopyHunk,
}) => {
  const [expandedFoldIds, setExpandedFoldIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setExpandedFoldIds(new Set());
  }, [rows]);

  const effectiveContextLines = options.diffOnly ? 0 : options.contextLines ?? 3;

  const collapsed = useMemo(
    () => collapseUnchangedRuns(rows, isUnchangedRow, effectiveContextLines, expandedFoldIds),
    [rows, effectiveContextLines, expandedFoldIds]
  );

  // While a search is active, folds would hide matches from the user with no way to
  // reach them — force everything open for the duration of the search. The size
  // check makes this idempotent once fully expanded, so including expandedFoldIds
  // in the deps doesn't loop.
  useEffect(() => {
    if (forceExpandFolds && collapsed.foldIds.length > expandedFoldIds.size) {
      setExpandedFoldIds(new Set(collapsed.foldIds));
    }
  }, [forceExpandFolds, collapsed.foldIds, expandedFoldIds]);

  const expandAll = () => setExpandedFoldIds(new Set(collapsed.foldIds));

  // A CHANGED pair emits two unified rows sharing one pairIndex (old-as-removed then
  // new-as-added) — only the first one seen becomes the hunk's anchor/copy target.
  const seenPairIndices = new Set<number>();

  return (
    <div className="flex-1 min-h-0 flex flex-col border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
      <div className="flex-none bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 p-3 font-semibold border-b dark:border-slate-600 text-gray-800 dark:text-slate-100 flex items-center justify-between">
        <span>Unified Diff</span>
        {collapsed.foldIds.length > expandedFoldIds.size && (
          <button
            onClick={expandAll}
            className="px-2 py-1 text-xs font-medium rounded text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
          >
            Expand All
          </button>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        {collapsed.entries.map((entry) => {
          if (entry.kind === 'fold') {
            return (
              <button
                key={entry.id}
                onClick={() => setExpandedFoldIds((prev) => new Set(prev).add(entry.id))}
                className="w-full text-left px-2 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-b dark:border-slate-700 transition-colors"
              >
                ⋯ {entry.hiddenCount} unchanged line{entry.hiddenCount === 1 ? '' : 's'} — click to expand
              </button>
            );
          }

          const row = entry.row;
          const style = ROW_STYLES[row.type];
          // A MOVED row is still either an old-side removal or a new-side addition —
          // oldLineNumber is only ever set on the former, newLineNumber only on the
          // latter (same convention REMOVED/ADDED already use), so that alone picks
          // the correct -/+ marker without needing a separate "which side" flag.
          const marker = row.type === DiffType.MOVED ? (row.oldLineNumber !== undefined ? '-' : '+') : style.marker;
          const rowMatches = matchesByRowId.get(row.key) ?? [];
          const activeRange = activeMatch && activeMatch.rowId === row.key ? activeMatch : null;

          const isHunkStart = !seenPairIndices.has(row.pairIndex) && hunkTextByStartPairIndex.has(row.pairIndex);
          seenPairIndices.add(row.pairIndex);
          const hunkText = isHunkStart ? hunkTextByStartPairIndex.get(row.pairIndex) : undefined;

          return (
            <div
              key={row.key}
              data-hunk-anchor={hunkAnchorId(row.pairIndex)}
              className={`relative group py-1 ${style.bg} ${style.text} px-2 font-mono whitespace-pre-wrap break-all flex border-b dark:border-slate-700 last:border-b-0`}
            >
              <div className="w-9 flex-shrink-0 text-gray-500 dark:text-slate-500 text-xs mr-1 text-right pr-1 border-r border-gray-300 dark:border-slate-600">
                {row.oldLineNumber ?? ''}
              </div>
              <div className="w-9 flex-shrink-0 text-gray-500 dark:text-slate-500 text-xs mr-2 text-right pr-2 border-r border-gray-300 dark:border-slate-600">
                {row.newLineNumber ?? ''}
              </div>
              <div className="w-4 flex-shrink-0 font-bold select-none">{marker}</div>
              {hunkText !== undefined && (
                <button
                  type="button"
                  onClick={() => onCopyHunk(row.pairIndex, hunkText)}
                  title="Copy this change"
                  aria-label="Copy this change"
                  className="absolute top-1 right-1 p-1 rounded bg-white/90 dark:bg-slate-800/90 text-gray-400 dark:text-slate-500 opacity-0 group-hover:opacity-100 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-700 transition-opacity"
                >
                  {copiedPairIndex === row.pairIndex ? <CheckIcon size={12} /> : <CopyIcon size={12} />}
                </button>
              )}
              <div className="flex-grow">
                {row.type === DiffType.MOVED && row.movedCounterpartLineNumber !== undefined && (
                  <span className="mr-2 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-indigo-200 dark:bg-indigo-800 text-indigo-900 dark:text-indigo-100 align-middle">
                    moved ↔ line {row.movedCounterpartLineNumber}
                  </span>
                )}
                {rowMatches.length > 0 ? (
                  buildHighlightSegments(row.text, rowMatches, activeRange).map((segment, index) => (
                    <span
                      key={index}
                      data-active-match={segment.isActive || undefined}
                      className={
                        segment.isActive
                          ? 'bg-orange-400 dark:bg-orange-500 text-orange-950 dark:text-white font-semibold rounded ring-2 ring-orange-600 dark:ring-orange-300'
                          : segment.isMatch
                            ? 'bg-orange-200 dark:bg-orange-700/60 text-orange-950 dark:text-orange-50 rounded'
                            : ''
                      }
                    >
                      {segment.text}
                    </span>
                  ))
                ) : row.wordDiff ? (
                  row.wordDiff.map((word, wordIndex) => (
                    <span
                      key={wordIndex}
                      className={
                        word.type === 'changed'
                          ? 'bg-yellow-300 dark:bg-yellow-600 text-yellow-900 dark:text-yellow-100 font-semibold px-0.5 rounded'
                          : ''
                      }
                    >
                      {word.text}
                    </span>
                  ))
                ) : (
                  row.text || <span className="text-gray-400 dark:text-slate-500 italic">(empty line)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
