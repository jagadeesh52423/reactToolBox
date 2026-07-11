'use client';
import React from 'react';
import { DiffLine, DiffType, WordDiff } from '../models/DiffModels';
import { buildHighlightSegments } from '../hooks/useDiffSearch';

interface DiffLineDisplayProps {
  line: DiffLine;
  wordDiff?: WordDiff[];
  searchMatches?: { start: number; end: number }[];
  activeMatchRange?: { start: number; end: number } | null;
}

/**
 * Component for displaying a single diff line
 * Follows Single Responsibility Principle
 */
export const DiffLineDisplay: React.FC<DiffLineDisplayProps> = ({ line, wordDiff, searchMatches, activeMatchRange }) => {
  const getBackgroundColor = (type: DiffType): string => {
    switch (type) {
      case DiffType.ADDED:
        return 'bg-green-100 dark:bg-green-900/30';
      case DiffType.REMOVED:
        return 'bg-red-100 dark:bg-red-900/30';
      case DiffType.CHANGED:
        return 'bg-yellow-100 dark:bg-yellow-900/30';
      case DiffType.PLACEHOLDER:
        return 'bg-gray-50 dark:bg-slate-800';
      default:
        return '';
    }
  };

  const getTextColor = (type: DiffType): string => {
    switch (type) {
      case DiffType.ADDED:
        return 'text-green-800 dark:text-green-300';
      case DiffType.REMOVED:
        return 'text-red-800 dark:text-red-300';
      case DiffType.CHANGED:
        return 'text-yellow-800 dark:text-yellow-300';
      default:
        return 'text-gray-800 dark:text-slate-200';
    }
  };

  const bgColor = getBackgroundColor(line.type);
  const textColor = getTextColor(line.type);

  return (
    <div className={`py-1 ${bgColor} ${textColor} px-2 font-mono whitespace-pre-wrap break-all flex border-b last:border-b-0`}>
      {line.lineNumber > 0 && (
        <div className="w-10 flex-shrink-0 text-gray-500 dark:text-slate-500 text-xs mr-2 text-right pr-2 border-r border-gray-300 dark:border-slate-600">
          {line.lineNumber}
        </div>
      )}
      <div className="flex-grow">
        {searchMatches && searchMatches.length > 0 ? (
          // Search highlighting takes precedence over word-diff highlighting for this
          // row — layering both would need nested-span math disproportionate to a
          // nice-to-have search feature; the row's type background color still applies.
          buildHighlightSegments(line.text, searchMatches, activeMatchRange ?? null).map((segment, index) => (
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
        ) : wordDiff ? (
          // Render word-level diff
          wordDiff.map((word, index) => (
            <span
              key={index}
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
          // Render plain line
          line.text || <span className="text-gray-400 dark:text-slate-500 italic">(empty line)</span>
        )}
      </div>
    </div>
  );
};
