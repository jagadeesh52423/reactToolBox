'use client';
import React from 'react';
import { DiffStatistics } from '../models/DiffModels';

interface DiffStatisticsDisplayProps {
  statistics: DiffStatistics;
}

/**
 * Component for displaying diff statistics
 * Follows Single Responsibility Principle
 */
export const DiffStatisticsDisplay: React.FC<DiffStatisticsDisplayProps> = ({ statistics }) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 border border-blue-200 dark:border-slate-600 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-slate-100">Comparison Statistics</h3>

      <div className={`grid grid-cols-2 ${statistics.changes.moved > 0 ? 'md:grid-cols-5' : 'md:grid-cols-4'} gap-4`}>
        {/* Similarity */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statistics.similarity}%</div>
          <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Similarity</div>
        </div>

        {/* Added */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.changes.added}</div>
          <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Lines Added</div>
        </div>

        {/* Removed */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">{statistics.changes.removed}</div>
          <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Lines Removed</div>
        </div>

        {/* Modified */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{statistics.changes.modified}</div>
          <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Lines Modified</div>
        </div>

        {/* Moved — only shown when moved-line detection found any, so the grid stays
            uncluttered when the feature is off or found nothing. */}
        {statistics.changes.moved > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm">
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{statistics.changes.moved}</div>
            <div className="text-xs text-gray-600 dark:text-slate-400 mt-1">Lines Moved</div>
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-600 dark:text-slate-400">
        Total: {statistics.totalLines.left} lines (left) vs {statistics.totalLines.right} lines (right)
      </div>
    </div>
  );
};
