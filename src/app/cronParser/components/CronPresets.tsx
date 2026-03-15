'use client';

import React from 'react';

interface CronPreset {
  label: string;
  expression: string;
}

const PRESETS: CronPreset[] = [
  { label: 'Every minute', expression: '* * * * *' },
  { label: 'Every 5 minutes', expression: '*/5 * * * *' },
  { label: 'Every 15 minutes', expression: '*/15 * * * *' },
  { label: 'Every hour', expression: '0 * * * *' },
  { label: 'Every 6 hours', expression: '0 */6 * * *' },
  { label: 'Daily at midnight', expression: '0 0 * * *' },
  { label: 'Daily at 9 AM', expression: '0 9 * * *' },
  { label: 'Weekly (Monday)', expression: '0 0 * * 1' },
  { label: 'Monthly (1st)', expression: '0 0 1 * *' },
  { label: 'Yearly (Jan 1)', expression: '0 0 1 1 *' },
];

interface CronPresetsProps {
  onSelect: (expression: string) => void;
  currentExpression: string;
}

/**
 * CronPresets Component
 *
 * Grid of preset cron expression buttons for quick selection.
 * Highlights the currently active preset if one matches.
 */
export default function CronPresets({ onSelect, currentExpression }: CronPresetsProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Common Presets
      </label>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map((preset) => {
          const isActive = currentExpression.trim() === preset.expression;
          return (
            <button
              key={preset.expression}
              type="button"
              title={`Set expression to: ${preset.expression}`}
              aria-label={`Preset: ${preset.label} (${preset.expression})`}
              onClick={() => onSelect(preset.expression)}
              className={`px-3 py-2 rounded-lg text-xs text-left transition-colors border ${
                isActive
                  ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                  : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200/50 dark:border-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="block font-medium">{preset.label}</span>
              <span className="block font-mono text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                {preset.expression}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
