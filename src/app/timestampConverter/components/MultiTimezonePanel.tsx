'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { getTimezones, formatWithTimezone } from '../utils/timestampUtils';

interface MultiTimezonePanelProps {
  parsedDate: Date | null;
  timezones: string[];
  onAdd: (tz: string) => void;
  onRemove: (tz: string) => void;
}

/**
 * MultiTimezonePanel
 *
 * Lets the user build a list of timezones and see the same instant
 * converted across all of them side by side.
 */
export default function MultiTimezonePanel({ parsedDate, timezones, onAdd, onRemove }: MultiTimezonePanelProps) {
  // Populated client-only (see InputPanel's identical guard): the server's and the
  // browser's Intl.supportedValuesOf('timeZone') lists can differ by a few entries.
  const [availableTimezones, setAvailableTimezones] = useState<string[]>([]);
  useEffect(() => {
    setAvailableTimezones(getTimezones());
  }, []);
  const [draftTz, setDraftTz] = useState('');

  const handleAdd = useCallback(() => {
    if (!draftTz.trim()) return;
    onAdd(draftTz.trim());
    setDraftTz('');
  }, [draftTz, onAdd]);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
        Compare Across Timezones
      </div>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          list="multi-timezone-list"
          value={draftTz}
          onChange={(e) => setDraftTz(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAdd();
          }}
          placeholder="Add a timezone, e.g. Europe/London"
          className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
          aria-label="Add a timezone to compare"
        />
        <datalist id="multi-timezone-list">
          {availableTimezones.map((tz) => (
            <option key={tz} value={tz} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={handleAdd}
          className="flex-shrink-0 px-3 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          title="Add timezone to comparison"
        >
          Add
        </button>
      </div>

      {timezones.length === 0 ? (
        <div className="text-xs text-gray-400 dark:text-gray-500">No timezones added yet.</div>
      ) : (
        <div className="space-y-2">
          {timezones.map((tz) => (
            <div
              key={tz}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50"
            >
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate" title={tz}>
                {tz}
              </span>
              <span className="font-mono text-sm text-gray-900 dark:text-gray-100 flex-shrink-0">
                {parsedDate
                  ? formatWithTimezone(tz, (zone) => parsedDate.toLocaleString('en-US', { timeZone: zone }))
                  : '—'}
              </span>
              <button
                type="button"
                onClick={() => onRemove(tz)}
                className="flex-shrink-0 p-1 rounded hover:bg-gray-200/70 dark:hover:bg-gray-700/70 text-gray-400 dark:text-gray-500 transition-colors"
                title={`Remove ${tz}`}
                aria-label={`Remove ${tz} from comparison`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
