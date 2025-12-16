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
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Comparison Statistics</h3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Similarity */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-blue-600">{statistics.similarity}%</div>
          <div className="text-xs text-gray-600 mt-1">Similarity</div>
        </div>

        {/* Added */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-green-600">{statistics.changes.added}</div>
          <div className="text-xs text-gray-600 mt-1">Lines Added</div>
        </div>

        {/* Removed */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-red-600">{statistics.changes.removed}</div>
          <div className="text-xs text-gray-600 mt-1">Lines Removed</div>
        </div>

        {/* Modified */}
        <div className="bg-white rounded-lg p-3 shadow-sm">
          <div className="text-2xl font-bold text-yellow-600">{statistics.changes.modified}</div>
          <div className="text-xs text-gray-600 mt-1">Lines Modified</div>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-600">
        Total: {statistics.totalLines.left} lines (left) vs {statistics.totalLines.right} lines (right)
      </div>
    </div>
  );
};
