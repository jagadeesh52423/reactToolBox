'use client';
import React, { useRef, useState } from 'react';
import CodeEditor from '@/components/common/CodeEditor';
import PanelHeader from '@/components/common/PanelHeader';
import {
  FolderOpenIcon,
  SparklesIcon,
  ChevronDownIcon,
  TrashIcon,
  AlertCircleIcon,
} from '@/components/shared/Icons';

interface HTMLInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onFileLoad: (content: string, filename: string) => void;
  onFormat: () => void;
  indentSize: number;
  onIndentSizeChange: (size: number) => void;
  currentFilename: string | null;
  error: string;
  disabled?: boolean;
}

const INDENT_SIZES = [2, 4, 6, 8];

/**
 * HTMLInput Component - Professional Redesign
 *
 * Features:
 * - Modern icon-based toolbar
 * - File upload integration
 * - Format options dropdown
 * - Clean panel design with PanelHeader
 */
export const HTMLInput: React.FC<HTMLInputProps> = ({
  value,
  onChange,
  onClear,
  onFileLoad,
  onFormat,
  indentSize,
  onIndentSizeChange,
  currentFilename,
  error,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showFormatOptions, setShowFormatOptions] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onFileLoad(content, file.name);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFormatClick = () => {
    onFormat();
    setShowFormatOptions(false);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
      {/* Header */}
      <PanelHeader title={currentFilename ? `HTML Input - ${currentFilename}` : 'HTML Input'}>
        {/* File Operations Group */}
        <div className="flex items-center gap-1 pr-2 border-r border-gray-300/50 dark:border-slate-600/50">
          <input
            type="file"
            ref={fileInputRef}
            accept=".html,.htm"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            onClick={triggerFileUpload}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-all duration-200"
            title="Import HTML file"
          >
            <FolderOpenIcon size={18} />
          </button>
          <button
            onClick={onClear}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-all duration-200"
            title="Clear input"
          >
            <TrashIcon size={18} />
          </button>
        </div>

        {/* Format Operations Group */}
        <div className="flex items-center gap-1 pl-2">
          {/* Format Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFormatOptions(!showFormatOptions)}
              disabled={disabled}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-white bg-orange-100/50 dark:bg-orange-600/20 hover:bg-orange-200/50 dark:hover:bg-orange-600/40 border border-orange-300/50 dark:border-orange-500/30 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Format HTML"
            >
              <SparklesIcon size={16} />
              <span className="text-sm font-medium">Format</span>
              <ChevronDownIcon
                size={14}
                className={`transition-transform duration-200 ${showFormatOptions ? 'rotate-180' : ''}`}
              />
            </button>

            {showFormatOptions && (
              <div className="absolute right-0 mt-2 z-20 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-xl p-3 min-w-[180px]">
                <div className="text-xs text-gray-500 dark:text-slate-400 mb-2 font-medium uppercase tracking-wide">
                  Indentation
                </div>
                <div className="flex gap-1 mb-3">
                  {INDENT_SIZES.map((size) => (
                    <button
                      key={size}
                      onClick={() => onIndentSizeChange(size)}
                      className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        indentSize === size
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleFormatClick}
                  disabled={disabled}
                  className="w-full px-3 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-medium text-sm transition-all duration-200"
                >
                  Format HTML
                </button>
              </div>
            )}
          </div>
        </div>
      </PanelHeader>

      {/* Code Editor */}
      <div className="flex-1 min-h-0">
        <CodeEditor
          value={value}
          onChange={onChange}
          placeholder="Paste your HTML code here..."
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200/50 dark:border-red-500/30 flex items-start gap-3">
          <AlertCircleIcon size={18} className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-600 dark:text-red-400 font-medium text-sm">Parse Error</div>
            <div className="text-red-500/80 dark:text-red-300/80 text-sm mt-0.5">{error}</div>
          </div>
        </div>
      )}
    </div>
  );
};
