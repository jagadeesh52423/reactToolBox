'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DownloadIcon, ChevronDownIcon } from '@/components/shared/Icons';

export type ExportFormat = 'txt' | 'md' | 'html' | 'diff';

interface ExportOption {
  format: ExportFormat;
  label: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  { format: 'txt', label: 'Text Report (.txt)' },
  { format: 'md', label: 'Markdown (.md)' },
  { format: 'html', label: 'HTML (.html)' },
  { format: 'diff', label: 'Unified Diff (.diff)' },
];

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void;
}

/**
 * Dropdown menu for picking the diff export format.
 * Follows Single Responsibility Principle
 */
export const ExportMenu: React.FC<ExportMenuProps> = ({ onExport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = useCallback(
    (format: ExportFormat) => {
      onExport(format);
      setIsOpen(false);
    },
    [onExport]
  );

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
        title="Export diff report"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <DownloadIcon size={16} />
        <span>Export</span>
        <ChevronDownIcon size={14} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg py-1 z-10">
          {EXPORT_OPTIONS.map((option) => (
            <button
              key={option.format}
              onClick={() => handleSelect(option.format)}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
