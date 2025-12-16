'use client';
import React from 'react';

interface HTMLOutputProps {
  highlightedHTML: string;
  onCopy: () => void;
  stats: {
    characters: number;
    lines: number;
    tags: number;
  };
}

/**
 * Component for displaying formatted HTML output
 * Follows Single Responsibility Principle
 */
export const HTMLOutput: React.FC<HTMLOutputProps> = ({
  highlightedHTML,
  onCopy,
  stats,
}) => {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold">Formatted HTML</h2>
        <button
          onClick={onCopy}
          className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
          aria-label="Copy formatted HTML to clipboard"
        >
          Copy to Clipboard
        </button>
      </div>

      <div className="relative">
        <pre className="p-4 whitespace-pre-wrap overflow-auto max-h-96 font-mono text-sm leading-relaxed bg-gray-50 border border-gray-300 rounded-lg">
          <div dangerouslySetInnerHTML={{ __html: highlightedHTML }} />
        </pre>
      </div>

      <div className="text-sm text-gray-600 flex gap-4 mt-2">
        <span>{stats.characters} characters</span>
        <span>{stats.lines} lines</span>
        <span>{stats.tags} tags</span>
      </div>
    </div>
  );
};
