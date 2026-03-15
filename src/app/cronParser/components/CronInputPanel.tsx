'use client';

import React from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import CronPresets from './CronPresets';
import { CronFieldCount } from '../utils/cronUtils';

interface BuilderValues {
  second: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  year: string;
}

interface CronInputPanelProps {
  expression: string;
  builderValues: BuilderValues;
  fieldCount: CronFieldCount;
  onExpressionChange: (expression: string) => void;
  onBuilderChange: (field: string, value: string) => void;
  onPresetSelect: (expression: string) => void;
  onFieldCountChange: (count: CronFieldCount) => void;
  error: string | null;
}

interface BuilderField {
  key: keyof BuilderValues;
  label: string;
  placeholder: string;
  options: Array<{ label: string; value: string }>;
  visibleIn: CronFieldCount[];
}

const BUILDER_FIELDS: BuilderField[] = [
  {
    key: 'second',
    label: 'Second',
    placeholder: '0-59',
    visibleIn: [6, 7],
    options: [
      { label: 'At :00 (0)', value: '0' },
      { label: 'Every second (*)', value: '*' },
      { label: 'Every 5 sec (*/5)', value: '*/5' },
      { label: 'Every 10 sec (*/10)', value: '*/10' },
      { label: 'Every 15 sec (*/15)', value: '*/15' },
      { label: 'Every 30 sec (*/30)', value: '*/30' },
    ],
  },
  {
    key: 'minute',
    label: 'Minute',
    placeholder: '0-59',
    visibleIn: [5, 6, 7],
    options: [
      { label: 'Every minute (*)', value: '*' },
      { label: 'Every 5 min (*/5)', value: '*/5' },
      { label: 'Every 10 min (*/10)', value: '*/10' },
      { label: 'Every 15 min (*/15)', value: '*/15' },
      { label: 'Every 30 min (*/30)', value: '*/30' },
      { label: 'At :00 (0)', value: '0' },
      { label: 'At :15 (15)', value: '15' },
      { label: 'At :30 (30)', value: '30' },
      { label: 'At :45 (45)', value: '45' },
    ],
  },
  {
    key: 'hour',
    label: 'Hour',
    placeholder: '0-23',
    visibleIn: [5, 6, 7],
    options: [
      { label: 'Every hour (*)', value: '*' },
      { label: 'Every 2 hours (*/2)', value: '*/2' },
      { label: 'Every 6 hours (*/6)', value: '*/6' },
      { label: 'Every 12 hours (*/12)', value: '*/12' },
      { label: 'Midnight (0)', value: '0' },
      { label: '6 AM (6)', value: '6' },
      { label: '9 AM (9)', value: '9' },
      { label: 'Noon (12)', value: '12' },
      { label: '6 PM (18)', value: '18' },
    ],
  },
  {
    key: 'dayOfMonth',
    label: 'Day of Month',
    placeholder: '1-31',
    visibleIn: [5, 6, 7],
    options: [
      { label: 'Every day (*)', value: '*' },
      { label: '1st (1)', value: '1' },
      { label: '15th (15)', value: '15' },
      { label: '1st and 15th (1,15)', value: '1,15' },
      { label: 'Every 2 days (*/2)', value: '*/2' },
    ],
  },
  {
    key: 'month',
    label: 'Month',
    placeholder: '1-12 or JAN-DEC',
    visibleIn: [5, 6, 7],
    options: [
      { label: 'Every month (*)', value: '*' },
      { label: 'January (1)', value: '1' },
      { label: 'March (3)', value: '3' },
      { label: 'June (6)', value: '6' },
      { label: 'September (9)', value: '9' },
      { label: 'December (12)', value: '12' },
      { label: 'Every quarter (1,4,7,10)', value: '1,4,7,10' },
      { label: 'Every 3 months (*/3)', value: '*/3' },
    ],
  },
  {
    key: 'dayOfWeek',
    label: 'Day of Week',
    placeholder: '0-6 or SUN-SAT',
    visibleIn: [5, 6, 7],
    options: [
      { label: 'Every day (*)', value: '*' },
      { label: 'Sunday (0)', value: '0' },
      { label: 'Monday (1)', value: '1' },
      { label: 'Tuesday (2)', value: '2' },
      { label: 'Wednesday (3)', value: '3' },
      { label: 'Thursday (4)', value: '4' },
      { label: 'Friday (5)', value: '5' },
      { label: 'Saturday (6)', value: '6' },
      { label: 'Weekdays (1-5)', value: '1-5' },
      { label: 'Weekends (0,6)', value: '0,6' },
    ],
  },
  {
    key: 'year',
    label: 'Year',
    placeholder: '1970-2099',
    visibleIn: [7],
    options: [
      { label: 'Every year (*)', value: '*' },
      { label: '2025', value: '2025' },
      { label: '2026', value: '2026' },
      { label: '2027', value: '2027' },
      { label: '2025-2030', value: '2025-2030' },
    ],
  },
];

const FIELD_LABELS: Record<CronFieldCount, string[]> = {
  5: ['minute', 'hour', 'day(month)', 'month', 'day(week)'],
  6: ['second', 'minute', 'hour', 'day(month)', 'month', 'day(week)'],
  7: ['second', 'minute', 'hour', 'day(month)', 'month', 'day(week)', 'year'],
};

export default function CronInputPanel({
  expression,
  builderValues,
  fieldCount,
  onExpressionChange,
  onBuilderChange,
  onPresetSelect,
  onFieldCountChange,
  error,
}: CronInputPanelProps) {
  const visibleFields = BUILDER_FIELDS.filter(f => f.visibleIn.includes(fieldCount));

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
      <PanelHeader title="Cron Expression" />

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Field Count Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Mode:</span>
          <div className="flex rounded-lg bg-gray-100 dark:bg-slate-700/50 p-0.5">
            {([5, 6, 7] as CronFieldCount[]).map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => onFieldCountChange(count)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  fieldCount === count
                    ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {count === 5 ? 'Standard (5)' : count === 6 ? 'Seconds (6)' : 'Full (7)'}
              </button>
            ))}
          </div>
        </div>

        {/* Raw Expression Input */}
        <div>
          <label htmlFor="cron-expression" className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Expression
          </label>
          <input
            id="cron-expression"
            type="text"
            value={expression}
            onChange={(e) => onExpressionChange(e.target.value)}
            placeholder={fieldCount === 5 ? '* * * * *' : fieldCount === 6 ? '0 * * * * *' : '0 * * * * * *'}
            aria-label="Cron expression input"
            className={`w-full px-4 py-3 rounded-lg font-mono text-lg bg-white dark:bg-slate-800 border text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors ${
              error
                ? 'border-red-300 dark:border-red-500/50 focus:ring-red-500/30'
                : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500/30'
            }`}
          />
          <div className="flex justify-between mt-1.5 text-[10px] font-mono text-gray-400 dark:text-gray-500 px-1">
            {FIELD_LABELS[fieldCount].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          {error && (
            <div className="mt-2 p-3 rounded border bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-500/30 text-red-500 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Named Values Hint */}
        <div className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
          Supports named values: MON-SUN for days, JAN-DEC for months
        </div>

        {/* Presets */}
        <CronPresets onSelect={onPresetSelect} currentExpression={expression} fieldCount={fieldCount} />

        {/* Interactive Builder */}
        <div>
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Interactive Builder
          </label>
          <div className="space-y-2">
            {visibleFields.map((field) => (
              <div
                key={field.key}
                className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-2.5 border border-gray-200/50 dark:border-slate-700/50"
              >
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-24 flex-shrink-0">
                  {field.label}
                </span>
                <select
                  value={
                    field.options.some((o) => o.value === builderValues[field.key])
                      ? builderValues[field.key]
                      : '__custom__'
                  }
                  onChange={(e) => {
                    if (e.target.value !== '__custom__') {
                      onBuilderChange(field.key, e.target.value);
                    }
                  }}
                  aria-label={`Select ${field.label}`}
                  title={`Select value for ${field.label}`}
                  className="flex-1 px-2 py-1.5 rounded bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                >
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                  {!field.options.some((o) => o.value === builderValues[field.key]) && (
                    <option value="__custom__">
                      Custom: {builderValues[field.key]}
                    </option>
                  )}
                </select>
                <input
                  type="text"
                  value={builderValues[field.key]}
                  onChange={(e) => onBuilderChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  aria-label={`Custom value for ${field.label}`}
                  title={`Enter custom value for ${field.label}`}
                  className="w-20 px-2 py-1.5 rounded bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-sm font-mono text-gray-800 dark:text-gray-200 text-center focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
