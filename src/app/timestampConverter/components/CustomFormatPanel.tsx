'use client';

import React, { useCallback } from 'react';
import { formatWithPattern, FORMAT_TOKENS_HELP } from '../utils/timestampUtils';

interface CustomFormatPanelProps {
  parsedDate: Date | null;
  timezone: string;
  format: string;
  onFormatChange: (value: string) => void;
}

/**
 * CustomFormatPanel
 *
 * Lets the user enter a strftime/date-fns-style token pattern and preview
 * the parsed date rendered with it.
 */
export default function CustomFormatPanel({ parsedDate, timezone, format, onFormatChange }: CustomFormatPanelProps) {
  // Falls back to UTC during the brief window (only reachable via a preloaded ?ts=
  // URL param) before the parent resolves `timezone` from '' to a real zone.
  const output = parsedDate ? formatWithPattern(parsedDate, format, timezone || 'UTC') : '—';

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {
      // Clipboard access may fail in certain environments; silently ignore.
    }
  }, [output]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Custom Output Format
      </div>
      <input
        type="text"
        value={format}
        onChange={(e) => onFormatChange(e.target.value)}
        placeholder="YYYY-MM-DD HH:mm:ss"
        className="w-full px-3 py-2 font-mono text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
        aria-label="Custom output format pattern"
      />
      <div className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">{FORMAT_TOKENS_HELP}</div>

      <div className="mt-2 flex items-center justify-between gap-2 bg-white/60 dark:bg-gray-800/60 rounded-lg px-3 py-2 border border-gray-200/50 dark:border-gray-700/50">
        <span className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{output}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex-shrink-0 px-2 py-1 rounded text-xs hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-colors text-gray-500 dark:text-gray-400"
          title="Copy formatted output"
          aria-label="Copy formatted output"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
