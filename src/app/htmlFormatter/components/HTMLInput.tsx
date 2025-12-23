'use client';
import React from 'react';
import CodeEditor from '@/components/common/CodeEditor';

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
        <label className="font-medium text-lg dark:text-slate-200">HTML Input</label>
        <button
          onClick={onClear}
          className="px-3 py-1 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded text-sm transition-colors"
          aria-label="Clear input"
        >
          Clear
        </button>
      </div>

      <div className="h-64 border border-gray-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
        <CodeEditor
          value={value}
          onChange={onChange}
          placeholder="Paste your HTML code here..."
        />
      </div>

      <div className="text-sm text-gray-600 dark:text-slate-400 flex gap-4">
        <span>{stats.characters} characters</span>
        <span>{stats.lines} lines</span>
        <span>{stats.tags} tags</span>
      </div>
    </div>
  );
};
