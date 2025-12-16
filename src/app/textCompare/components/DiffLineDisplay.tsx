'use client';
import React from 'react';
import { DiffLine, DiffType, WordDiff } from '../models/DiffModels';

interface DiffLineDisplayProps {
  line: DiffLine;
  wordDiff?: WordDiff[];
}

/**
 * Component for displaying a single diff line
 * Follows Single Responsibility Principle
 */
export const DiffLineDisplay: React.FC<DiffLineDisplayProps> = ({ line, wordDiff }) => {
  const getBackgroundColor = (type: DiffType): string => {
    switch (type) {
      case DiffType.ADDED:
        return 'bg-green-100';
      case DiffType.REMOVED:
        return 'bg-red-100';
      case DiffType.CHANGED:
        return 'bg-yellow-100';
      case DiffType.PLACEHOLDER:
        return 'bg-gray-50';
      default:
        return '';
    }
  };

  const getTextColor = (type: DiffType): string => {
    switch (type) {
      case DiffType.ADDED:
        return 'text-green-800';
      case DiffType.REMOVED:
        return 'text-red-800';
      case DiffType.CHANGED:
        return 'text-yellow-800';
      default:
        return 'text-gray-800';
    }
  };

  const bgColor = getBackgroundColor(line.type);
  const textColor = getTextColor(line.type);

  return (
    <div className={`py-1 ${bgColor} ${textColor} px-2 font-mono whitespace-pre-wrap break-all flex border-b last:border-b-0`}>
      {line.lineNumber > 0 && (
        <div className="w-10 flex-shrink-0 text-gray-500 text-xs mr-2 text-right pr-2 border-r border-gray-300">
          {line.lineNumber}
        </div>
      )}
      <div className="flex-grow">
        {wordDiff ? (
          // Render word-level diff
          wordDiff.map((word, index) => (
            <span
              key={index}
              className={
                word.type === 'changed'
                  ? 'bg-yellow-300 text-yellow-900 font-semibold px-0.5 rounded'
                  : ''
              }
            >
              {word.text}
            </span>
          ))
        ) : (
          // Render plain line
          line.text || <span className="text-gray-400 italic">(empty line)</span>
        )}
      </div>
    </div>
  );
};
