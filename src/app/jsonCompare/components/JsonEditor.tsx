'use client';
import React from 'react';
import MonacoJsonEditor from '@/components/common/MonacoJsonEditor';

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
    <div className={`flex-1 min-h-0 flex flex-col border border-gray-200/50 dark:border-slate-700/50 rounded-lg bg-white dark:bg-slate-900 overflow-hidden ${className}`}>
      <MonacoJsonEditor value={value} onChange={onChange} />
    </div>
  );
};

export default JsonEditor;
