'use client';
import React from 'react';
import { DiffResult, DiffType } from '../models/DiffModels';
import { TextCompareService } from '../services/TextCompareService';
import { buildUnifiedDiffRows, UnifiedDiffRow } from '../utils/unifiedDiffRows';

interface UnifiedDiffDisplayProps {
  diffResult: DiffResult;
  compareService: TextCompareService;
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
};

/**
 * Single-column unified diff view: additions/removals/unchanged lines interleaved
 * in document order, with separate old/new line-number gutters (GitHub-style).
 */
export const UnifiedDiffDisplay: React.FC<UnifiedDiffDisplayProps> = ({ diffResult, compareService }) => {
  const rows = buildUnifiedDiffRows(diffResult, compareService);

  return (
    <div className="border dark:border-slate-700 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 p-3 font-semibold border-b dark:border-slate-600 text-gray-800 dark:text-slate-100">
        Unified Diff
      </div>
      <div className="overflow-auto">
        {rows.map((row) => {
          const style = ROW_STYLES[row.type];
          return (
            <div
              key={row.key}
              className={`py-1 ${style.bg} ${style.text} px-2 font-mono whitespace-pre-wrap break-all flex border-b dark:border-slate-700 last:border-b-0`}
            >
              <div className="w-9 flex-shrink-0 text-gray-500 dark:text-slate-500 text-xs mr-1 text-right pr-1 border-r border-gray-300 dark:border-slate-600">
                {row.oldLineNumber ?? ''}
              </div>
              <div className="w-9 flex-shrink-0 text-gray-500 dark:text-slate-500 text-xs mr-2 text-right pr-2 border-r border-gray-300 dark:border-slate-600">
                {row.newLineNumber ?? ''}
              </div>
              <div className="w-4 flex-shrink-0 font-bold select-none">{style.marker}</div>
              <div className="flex-grow">
                {row.wordDiff ? (
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
