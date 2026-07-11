'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { DiffOptions, WhitespaceMode } from '../models/DiffModels';
import { compileIgnorePattern } from '../utils/ignorePattern';
import { SettingsIcon, ChevronDownIcon } from '@/components/shared/Icons';

const WHITESPACE_MODE_LABELS: Record<WhitespaceMode, string> = {
  none: 'Exact (no whitespace normalization)',
  leading: 'Ignore leading whitespace',
  trailing: 'Ignore trailing whitespace',
  leadingAndTrailing: 'Ignore leading + trailing whitespace',
  all: 'Ignore all whitespace differences',
};

interface OptionsPopoverProps {
  options: DiffOptions;
  onOptionsChange: (options: Partial<DiffOptions>) => void;
}

/**
 * Popover holding the set-once diff settings (whitespace, case, context, moved-line
 * detection, ignore pattern). Reuses ExportMenu's click-outside/Escape dropdown pattern.
 */
export const OptionsPopover: React.FC<OptionsPopoverProps> = ({ options, onOptionsChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ignorePatternValidation = useMemo(
    () => compileIgnorePattern(options.ignorePattern, options.ignoreCase),
    [options.ignorePattern, options.ignoreCase]
  );

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

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggleOpen}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
        title="Diff options"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <SettingsIcon size={16} />
        <span>Options</span>
        <ChevronDownIcon size={14} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 w-80 sm:w-96 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg p-4 z-20 flex flex-col gap-3">
          <label className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Whitespace</span>
            <select
              value={options.whitespaceMode ?? 'none'}
              onChange={(e) => onOptionsChange({ whitespaceMode: e.target.value as WhitespaceMode })}
              className="flex-1 px-2 py-1 text-sm rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {(Object.keys(WHITESPACE_MODE_LABELS) as WhitespaceMode[]).map((mode) => (
                <option key={mode} value={mode}>
                  {WHITESPACE_MODE_LABELS[mode]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.ignoreCase || false}
              onChange={(e) => onOptionsChange({ ignoreCase: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Ignore Case</span>
          </label>

          <label className="flex items-center justify-between gap-2 cursor-pointer">
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Context Lines</span>
            <input
              type="number"
              min={0}
              max={50}
              value={options.contextLines ?? 3}
              onChange={(e) => onOptionsChange({ contextLines: Math.max(0, Number(e.target.value) || 0) })}
              disabled={options.diffOnly}
              className="w-20 px-2 py-1 text-sm rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
              title="Unchanged lines beyond this count fold into a collapsible section"
            />
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.diffOnly || false}
              onChange={(e) => onOptionsChange({ diffOnly: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 dark:border-slate-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300" title="Fold every unchanged line, ignoring Context Lines">
              Changes Only
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={options.detectMoved ?? true}
              onChange={(e) => onOptionsChange({ detectMoved: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-slate-300" title="Mark a removed line and an identical added line elsewhere as moved instead of separate changes">
              Detect Moved Lines
            </span>
          </label>

          <div>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Ignore Pattern (regex)</span>
              <input
                type="text"
                value={options.ignorePattern ?? ''}
                onChange={(e) => onOptionsChange({ ignorePattern: e.target.value })}
                placeholder="e.g. \d{4}-\d{2}-\d{2} to strip dates before comparing"
                className={`px-2 py-1 text-sm rounded border bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 font-mono ${
                  ignorePatternValidation.error
                    ? 'border-red-400 dark:border-red-600 focus:ring-red-500/50'
                    : 'border-gray-300 dark:border-slate-600 focus:ring-blue-500/50'
                }`}
              />
            </label>
            {ignorePatternValidation.error && (
              <div className="mt-1 text-xs text-red-600 dark:text-red-400">{ignorePatternValidation.error}</div>
            )}
          </div>

          <Link
            href="/jsonCompare"
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline pt-1 border-t border-gray-100 dark:border-slate-700"
          >
            Comparing JSON? Try the JSON Compare tool →
          </Link>
        </div>
      )}
    </div>
  );
};
