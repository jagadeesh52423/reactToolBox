'use client';
import React from 'react';
import { TextStats } from '../models/TextCaseType';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onPaste: () => void;
  onClear: () => void;
  stats: TextStats;
  placeholder?: string;
}

/**
 * Component for text input with action buttons and statistics
 * Follows Single Responsibility Principle - only handles text input UI
 */
export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  onPaste,
  onClear,
  stats,
  placeholder = 'Enter your text here...',
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Input Text</h3>
        <div className="space-x-2">
          <button
            onClick={onPaste}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
            aria-label="Paste from clipboard"
          >
            Paste
          </button>
          <button
            onClick={onClear}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
            aria-label="Clear input"
          >
            Clear
          </button>
        </div>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Text input area"
      />
      <div className="text-sm text-gray-600">
        {stats.characterCount} characters, {stats.wordCount} words
      </div>
    </div>
  );
};
