'use client';

import React, { useMemo } from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import { getTimezones } from '../utils/timestampUtils';

interface InputPanelProps {
  input: string;
  currentTime: Date;
  timezone: string;
  error: string | null;
  onInputChange: (value: string) => void;
  onTimezoneChange: (tz: string) => void;
  onUseCurrentTime: () => void;
  onDatePickerChange: (value: string) => void;
}

/**
 * InputPanel
 *
 * Left panel containing:
 * - Live-updating current time display (Unix seconds, ISO 8601, local)
 * - Text input for a timestamp or date string
 * - "Use Current Time" button
 * - Timezone selector (searchable via datalist)
 * - Native date/time picker for reverse conversion
 */
export default function InputPanel({
  input,
  currentTime,
  timezone,
  error,
  onInputChange,
  onTimezoneChange,
  onUseCurrentTime,
  onDatePickerChange,
}: InputPanelProps) {
  const timezones = useMemo(() => getTimezones(), []);

  const currentUnix = Math.floor(currentTime.getTime() / 1000);
  const currentISO = currentTime.toISOString();

  let currentLocal: string;
  try {
    currentLocal = currentTime.toLocaleString('en-US', { timeZone: timezone });
  } catch {
    currentLocal = currentTime.toLocaleString('en-US');
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
      <PanelHeader title="Input" />

      <div className="flex-1 overflow-auto p-4 space-y-5">
        {/* Live Current Time */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
            Current Time
          </div>
          <div className="space-y-1 font-mono text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Unix:</span>
              <span className="text-gray-900 dark:text-gray-100 text-base font-semibold">
                {currentUnix}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">ISO:</span>
              <span className="text-gray-900 dark:text-gray-100 text-xs">
                {currentISO}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400">Local:</span>
              <span className="text-gray-900 dark:text-gray-100 text-xs">
                {currentLocal}
              </span>
            </div>
          </div>
        </div>

        {/* Input Field */}
        <div>
          <label htmlFor="timestamp-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Timestamp or Date String
          </label>
          <input
            id="timestamp-input"
            type="text"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="e.g. 1700000000, 2024-01-15T10:30:00Z, Jan 15 2024"
            className="w-full px-3 py-2.5 font-mono text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:ring-blue-400/50 dark:focus:border-blue-400 transition-colors"
            aria-label="Enter a timestamp or date string"
          />
          {error && (
            <div className="mt-2 text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-500/30">
              {error}
            </div>
          )}
        </div>

        {/* Use Current Time Button */}
        <button
          type="button"
          onClick={onUseCurrentTime}
          className="w-full px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          title="Populate the input with the current Unix timestamp"
        >
          Use Current Time
        </button>

        {/* Timezone Selector */}
        <div>
          <label htmlFor="timezone-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Timezone
          </label>
          <input
            id="timezone-select"
            type="text"
            list="timezone-list"
            value={timezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:ring-blue-400/50 dark:focus:border-blue-400 transition-colors"
            aria-label="Select a timezone"
          />
          <datalist id="timezone-list">
            {timezones.map((tz) => (
              <option key={tz} value={tz} />
            ))}
          </datalist>
        </div>

        {/* Date Picker */}
        <div>
          <label htmlFor="date-picker" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Pick a Date/Time
          </label>
          <input
            id="date-picker"
            type="datetime-local"
            onChange={(e) => onDatePickerChange(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 dark:focus:ring-blue-400/50 dark:focus:border-blue-400 transition-colors"
            aria-label="Pick a date and time for reverse conversion"
          />
        </div>
      </div>
    </div>
  );
}
