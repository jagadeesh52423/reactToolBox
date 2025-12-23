'use client';
import React from 'react';
import CodeEditor from '@/components/common/CodeEditor';

interface TextInputPanelProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Component for text input panel
 * Follows Single Responsibility Principle
 */
export const TextInputPanel: React.FC<TextInputPanelProps> = ({
  title,
  value,
  onChange,
  placeholder = 'Enter text here...',
}) => {
  return (
    <div className="w-full">
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200">{title}</h2>
      </div>
      <div className="h-60 border border-gray-300 dark:border-slate-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
        <CodeEditor
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>
      <div className="text-sm text-gray-600 dark:text-slate-400 mt-1">
        {value.split('\n').length} lines, {value.length} characters
      </div>
    </div>
  );
};
