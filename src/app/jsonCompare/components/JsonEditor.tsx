'use client';
import React from 'react';
import CodeEditor from '@/components/common/CodeEditor';

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const JsonEditor: React.FC<JsonEditorProps> = ({
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`h-64 border border-gray-200/50 dark:border-slate-700/50 rounded-lg bg-white dark:bg-slate-900 overflow-hidden ${className}`}>
      <CodeEditor
        value={value}
        onChange={onChange}
        placeholder="Paste JSON here..."
      />
    </div>
  );
};

export default JsonEditor;
