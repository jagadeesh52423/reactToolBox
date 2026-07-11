'use client';
import React, { useCallback, useState } from 'react';
import CodeEditor from '@/components/common/CodeEditor';
import { useFileIO } from '@/hooks/useFileIO';
import { CopyIcon, CheckIcon, TrashIcon, UploadIcon } from '@/components/shared/Icons';

interface TextInputPanelProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const COPY_FEEDBACK_MS = 2000;
const DROP_ERROR_DISPLAY_MS = 4000;
// Dropped files are read fully into memory as text; cap size to avoid freezing the
// tab on an accidental huge/binary drop.
const MAX_DROP_FILE_SIZE_BYTES = 5 * 1024 * 1024;

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
  const { uploadFile, readFile } = useFileIO();
  const [copied, setCopied] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);

  const handleCopy = useCallback(async () => {
    if (!value || !navigator.clipboard) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
    } catch {
      // Clipboard write failed (permissions/insecure context) — no-op.
    }
  }, [value]);

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  const handleUploadClick = useCallback(async () => {
    try {
      const content = await uploadFile('.txt,.md,.json,.csv,.log,*');
      onChange(content);
    } catch {
      // User cancelled the file picker — no-op.
    }
  }, [uploadFile, onChange]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragOver(false);
      const file = event.dataTransfer.files?.[0];
      if (!file) return;

      if (file.size > MAX_DROP_FILE_SIZE_BYTES) {
        setDropError(`File too large (max ${MAX_DROP_FILE_SIZE_BYTES / (1024 * 1024)}MB)`);
        setTimeout(() => setDropError(null), DROP_ERROR_DISPLAY_MS);
        return;
      }

      try {
        const content = await readFile(file);
        onChange(content);
      } catch {
        setDropError('Failed to read the dropped file');
        setTimeout(() => setDropError(null), DROP_ERROR_DISPLAY_MS);
      }
    },
    [readFile, onChange]
  );

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-slate-200">{title}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={handleUploadClick}
            title="Upload a file"
            aria-label="Upload a file"
            className="p-1.5 rounded text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200 transition-colors"
          >
            <UploadIcon size={16} />
          </button>
          <button
            onClick={handleCopy}
            disabled={!value}
            title="Copy text"
            aria-label="Copy text"
            className="p-1.5 rounded text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
          </button>
          <button
            onClick={handleClear}
            disabled={!value}
            title="Clear text"
            aria-label="Clear text"
            className="p-1.5 rounded text-gray-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>
      {dropError && (
        <div className="mb-2 px-2 py-1 rounded text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          {dropError}
        </div>
      )}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`h-60 border rounded-lg overflow-hidden bg-white dark:bg-slate-900 transition-colors ${
          isDragOver
            ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/30'
            : 'border-gray-300 dark:border-slate-700'
        }`}
      >
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
