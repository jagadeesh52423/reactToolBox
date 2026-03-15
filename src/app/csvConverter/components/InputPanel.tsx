'use client';

import React from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import CodeEditor from '@/components/common/CodeEditor';

interface InputPanelProps {
  value: string;
  onChange: (value: string) => void;
  inputFormat: string;
  onClear: () => void;
}

const PLACEHOLDER_MAP: Record<string, string> = {
  csv: 'name,age,city\nAlice,30,New York\nBob,25,London',
  json: '[\n  { "name": "Alice", "age": "30", "city": "New York" },\n  { "name": "Bob", "age": "25", "city": "London" }\n]',
  yaml: '- name: Alice\n  age: 30\n  city: New York\n- name: Bob\n  age: 25\n  city: London',
};

/**
 * InputPanel Component
 *
 * Left panel containing a code editor for entering CSV, JSON, or YAML input.
 */
export default function InputPanel({
  value,
  onChange,
  inputFormat,
  onClear,
}: InputPanelProps) {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
      <PanelHeader title="Input">
        <button
          onClick={onClear}
          className="px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 rounded text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          title="Clear input"
          aria-label="Clear input"
        >
          Clear
        </button>
      </PanelHeader>
      <div className="flex-1 overflow-hidden min-h-0">
        <CodeEditor
          value={value}
          onChange={onChange}
          placeholder={PLACEHOLDER_MAP[inputFormat] || 'Enter data here...'}
        />
      </div>
    </div>
  );
}
