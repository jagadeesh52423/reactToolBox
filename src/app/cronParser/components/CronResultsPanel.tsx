'use client';

import React, { useCallback } from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import { useFileIO } from '@/hooks/useFileIO';
import { DownloadIcon } from '@/components/shared/Icons';
import { formatRunDate, CronFieldCount } from '../utils/cronUtils';

interface CronResultsPanelProps {
  description: string;
  nextRuns: Date[];
  isValid: boolean;
  expression: string;
  error: string | null;
  fieldCount: CronFieldCount;
}

/**
 * CronResultsPanel Component
 *
 * Right panel displaying the human-readable cron description
 * and the next 10 calculated run times.
 */
export default function CronResultsPanel({
  description,
  nextRuns,
  isValid,
  expression,
  error,
  fieldCount,
}: CronResultsPanelProps) {
  const hasExpression = expression.trim().length > 0;
  const showSeconds = fieldCount >= 6;
  const { downloadFile } = useFileIO();

  const handleDownload = useCallback(() => {
    if (!isValid || nextRuns.length === 0) return;
    const report = [
      `Expression: ${expression}`,
      `Description: ${description}`,
      '',
      `Next ${nextRuns.length} runs:`,
      ...nextRuns.map((r, i) => `  ${i + 1}. ${formatRunDate(r, showSeconds)}`),
    ].join('\n');
    downloadFile(report, 'cron-schedule.txt');
  }, [isValid, nextRuns, expression, description, downloadFile]);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
      <PanelHeader title="Schedule Details">
        {isValid && nextRuns.length > 0 && (
          <button
            onClick={handleDownload}
            className="p-1.5 rounded hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-colors"
            title="Download schedule"
          >
            <DownloadIcon size={14} className="text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </PanelHeader>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Empty State */}
        {!hasExpression && (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center">
              Enter a cron expression or select a preset to see the schedule.
            </p>
          </div>
        )}

        {/* Error Display */}
        {hasExpression && !isValid && error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-500/30">
            <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">
              Error
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        )}

        {/* Description Card */}
        {hasExpression && isValid && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/30">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
              Description
            </div>
            <div className="text-lg font-medium text-blue-900 dark:text-blue-100">
              {description}
            </div>
          </div>
        )}

        {/* Next Runs List */}
        {hasExpression && isValid && nextRuns.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3">
              Next {nextRuns.length} Runs
            </h3>
            <div className="space-y-1.5">
              {nextRuns.map((run, index) => (
                <div
                  key={run.getTime()}
                  className="flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 border border-gray-200/50 dark:border-gray-700/50"
                >
                  <span className="text-xs font-mono text-gray-400 dark:text-gray-500 w-6 text-right flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                    {formatRunDate(run, showSeconds)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No runs found */}
        {hasExpression && isValid && nextRuns.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-400 dark:text-gray-500 text-sm text-center">
              No upcoming runs found within the next 366 days.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
