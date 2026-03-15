'use client';

import React from 'react';
import { CronFieldCount } from '../utils/cronUtils';

interface CronPreset {
  label: string;
  expression: string;
}

const PRESETS_5: CronPreset[] = [
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

const PRESETS_6: CronPreset[] = [
  { label: 'Every second', expression: '* * * * * *' },
  { label: 'Every 5 seconds', expression: '*/5 * * * * *' },
  { label: 'Every 10 seconds', expression: '*/10 * * * * *' },
  { label: 'Every 30 seconds', expression: '*/30 * * * * *' },
  { label: 'Every minute at :00', expression: '0 * * * * *' },
  { label: 'Every 5 min at :00', expression: '0 */5 * * * *' },
  { label: 'Top of every hour', expression: '0 0 * * * *' },
  { label: 'Daily midnight', expression: '0 0 0 * * *' },
  { label: 'Weekdays 9 AM', expression: '0 0 9 * * 1-5' },
  { label: 'Every 15 min', expression: '0 */15 * * * *' },
];

const PRESETS_7: CronPreset[] = [
  { label: 'Every min (2026)', expression: '0 * * * * * 2026' },
  { label: 'Daily 9AM (2026)', expression: '0 0 9 * * * 2026' },
  { label: 'Weekdays (2026)', expression: '0 0 9 * * 1-5 2026' },
  { label: 'Monthly (2025-2027)', expression: '0 0 0 1 * * 2025-2027' },
  { label: 'Jan 1 (2026)', expression: '0 0 0 1 1 * 2026' },
  { label: 'Every 5s (2026)', expression: '*/5 * * * * * 2026' },
];

const PRESETS_MAP: Record<CronFieldCount, CronPreset[]> = {
  5: PRESETS_5,
  6: PRESETS_6,
  7: PRESETS_7,
};

interface CronPresetsProps {
  onSelect: (expression: string) => void;
  currentExpression: string;
  fieldCount?: CronFieldCount;
}

export default function CronPresets({ onSelect, currentExpression, fieldCount = 5 }: CronPresetsProps) {
  const presets = PRESETS_MAP[fieldCount];

  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        Common Presets
      </label>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((preset) => {
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
