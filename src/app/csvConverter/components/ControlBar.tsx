'use client';

import React from 'react';

type Format = 'csv' | 'json' | 'yaml';
type Delimiter = ',' | '\t' | ';' | '|';

interface ControlBarProps {
  inputFormat: Format;
  outputFormat: Format;
  delimiter: Delimiter;
  onInputFormatChange: (format: Format) => void;
  onOutputFormatChange: (format: Format) => void;
  onDelimiterChange: (delimiter: Delimiter) => void;
  onDownload: () => void;
  hasOutput: boolean;
}

const FORMAT_OPTIONS: { value: Format; label: string }[] = [
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
];

const DELIMITER_OPTIONS: { value: Delimiter; label: string }[] = [
  { value: ',', label: 'Comma (,)' },
  { value: '\t', label: 'Tab' },
  { value: ';', label: 'Semicolon (;)' },
  { value: '|', label: 'Pipe (|)' },
];

/**
 * ControlBar Component
 *
 * Top bar with input/output format selectors, delimiter option, and download button.
 */
export default function ControlBar({
  inputFormat,
  outputFormat,
  delimiter,
  onInputFormatChange,
  onOutputFormatChange,
  onDelimiterChange,
  onDownload,
  hasOutput,
}: ControlBarProps) {
  const showDelimiter = inputFormat === 'csv' || outputFormat === 'csv';

  return (
    <div className="px-6 py-3 flex items-center gap-4 border-b border-gray-200/50 dark:border-slate-700/50 bg-white/30 dark:bg-slate-900/30 flex-wrap">
      {/* Input Format */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="input-format"
          className="text-sm font-medium text-gray-600 dark:text-slate-400"
        >
          From
        </label>
        <select
          id="input-format"
          value={inputFormat}
          onChange={(e) => onInputFormatChange(e.target.value as Format)}
          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
          aria-label="Input format"
        >
          {FORMAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Arrow */}
      <svg
        className="w-5 h-5 text-gray-400 dark:text-slate-500 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>

      {/* Output Format */}
      <div className="flex items-center gap-2">
        <label
          htmlFor="output-format"
          className="text-sm font-medium text-gray-600 dark:text-slate-400"
        >
          To
        </label>
        <select
          id="output-format"
          value={outputFormat}
          onChange={(e) => onOutputFormatChange(e.target.value as Format)}
          className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
          aria-label="Output format"
        >
          {FORMAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Delimiter (only when CSV is involved) */}
      {showDelimiter && (
        <div className="flex items-center gap-2">
          <label
            htmlFor="delimiter"
            className="text-sm font-medium text-gray-600 dark:text-slate-400"
          >
            Delimiter
          </label>
          <select
            id="delimiter"
            value={delimiter}
            onChange={(e) => onDelimiterChange(e.target.value as Delimiter)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded text-sm text-gray-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-600"
            aria-label="CSV delimiter"
          >
            {DELIMITER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Download Button */}
      <button
        onClick={onDownload}
        disabled={!hasOutput}
        className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        title="Download output"
        aria-label="Download converted output"
      >
        <svg className="w-4 h-4 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </button>
    </div>
  );
}
