'use client';
import React from 'react';

interface HTMLInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  stats: {
    characters: number;
    lines: number;
    tags: number;
  };
}

/**
 * Component for HTML code input
 * Follows Single Responsibility Principle
 */
export const HTMLInput: React.FC<HTMLInputProps> = ({
  value,
  onChange,
  onClear,
  stats,
}) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="font-medium text-lg">HTML Input</label>
        <button
          onClick={onClear}
          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
          aria-label="Clear input"
        >
          Clear
        </button>
      </div>

      <textarea
        className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste your HTML code here..."
        aria-label="HTML input textarea"
      />

      <div className="text-sm text-gray-600 flex gap-4">
        <span>{stats.characters} characters</span>
        <span>{stats.lines} lines</span>
        <span>{stats.tags} tags</span>
      </div>
    </div>
  );
};
