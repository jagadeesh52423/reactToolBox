'use client';
import React from 'react';
import { TextStats } from '../models/TextCaseType';

interface TextOutputProps {
  value: string;
  onCopy: () => void;
  stats: TextStats;
  emptyMessage?: string;
}

/**
 * Component for displaying converted text output
 * Follows Single Responsibility Principle - only handles output display
 */
export const TextOutput: React.FC<TextOutputProps> = ({
  value,
  onCopy,
  stats,
  emptyMessage = 'Converted text will appear here...',
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Output</h3>
        {value && (
          <button
            onClick={onCopy}
            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
            aria-label="Copy to clipboard"
          >
            Copy
          </button>
        )}
      </div>
      <div
        className="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 overflow-auto"
        aria-label="Text output area"
      >
        <pre className="whitespace-pre-wrap break-words">
          {value || emptyMessage}
        </pre>
      </div>
      <div className="text-sm text-gray-600">
        {stats.characterCount} characters, {stats.wordCount} words
      </div>
    </div>
  );
};
