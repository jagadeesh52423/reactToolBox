'use client';
import React from 'react';
import { DiffStatistics } from '../models/DiffModels';

interface DiffStatisticsDisplayProps {
  statistics: DiffStatistics;
}

/**
 * Compact single-row summary of diff statistics — same data as before, laid out as
 * inline chips instead of four large tiles, to reclaim vertical space for the diff.
 */
export const DiffStatisticsDisplay: React.FC<DiffStatisticsDisplayProps> = ({ statistics }) => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-1">
      <span className="font-semibold text-blue-600 dark:text-blue-400">{statistics.similarity}% similar</span>
      <span className="text-green-600 dark:text-green-400">+{statistics.changes.added} added</span>
      <span className="text-red-600 dark:text-red-400">−{statistics.changes.removed} removed</span>
      <span className="text-yellow-600 dark:text-yellow-400">~{statistics.changes.modified} modified</span>
      {statistics.changes.moved > 0 && (
        <span className="text-indigo-600 dark:text-indigo-400">{statistics.changes.moved} moved</span>
      )}
      <span className="ml-auto text-gray-500 dark:text-slate-500">
        {statistics.totalLines.left} vs {statistics.totalLines.right} lines
      </span>
    </div>
  );
};
