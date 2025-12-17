'use client';
import React, { useMemo } from 'react';
import { CheckCircleIcon } from './Icons';

interface DiffViewerProps {
  left: string;
  right: string;
}

interface Difference {
  path: string;
  leftValue?: unknown;
  rightValue?: unknown;
  type: 'added' | 'removed' | 'changed';
}

const DiffViewer: React.FC<DiffViewerProps> = ({ left, right }) => {
  const differences = useMemo(() => {
    try {
      const leftObj = JSON.parse(left);
      const rightObj = JSON.parse(right);
      return findDifferences(leftObj, rightObj);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return [];
    }
  }, [left, right]);

  // Function to find differences between two objects
  function findDifferences(left: unknown, right: unknown, path = ''): Difference[] {
    if (left === right) return [];

    // Different types
    if (typeof left !== typeof right) {
      return [{ path, leftValue: left, rightValue: right, type: 'changed' }];
    }

    // Primitive values that are different
    if (typeof left !== 'object' || left === null || right === null) {
      return [{ path, leftValue: left, rightValue: right, type: 'changed' }];
    }

    const differences: Difference[] = [];
    const leftObj = left as Record<string, unknown>;
    const rightObj = right as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(leftObj), ...Object.keys(rightObj)]);

    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;

      // Key exists in left but not in right
      if (!(key in rightObj)) {
        differences.push({
          path: currentPath,
          leftValue: leftObj[key],
          type: 'removed'
        });
        continue;
      }

      // Key exists in right but not in left
      if (!(key in leftObj)) {
        differences.push({
          path: currentPath,
          rightValue: rightObj[key],
          type: 'added'
        });
        continue;
      }

      // Recursively compare nested objects
      differences.push(...findDifferences(leftObj[key], rightObj[key], currentPath));
    }

    return differences;
  }

  const getTypeStyles = (type: 'added' | 'removed' | 'changed') => {
    switch (type) {
      case 'added':
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20';
      case 'removed':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'changed':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20';
    }
  };

  return (
    <div className="rounded-lg overflow-hidden">
      {differences.length === 0 ? (
        <div className="p-6 text-center bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-500/30">
          <CheckCircleIcon size={32} className="mx-auto mb-2 text-emerald-500 dark:text-emerald-400" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            JSON objects are identical!
          </span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-slate-800/50 rounded-lg overflow-hidden">
            <thead className="bg-gray-100 dark:bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-slate-200 font-medium border-b border-gray-200 dark:border-slate-600">
                  Path
                </th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-slate-200 font-medium border-b border-gray-200 dark:border-slate-600">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-slate-200 font-medium border-b border-gray-200 dark:border-slate-600">
                  Left Value
                </th>
                <th className="px-4 py-3 text-left text-gray-700 dark:text-slate-200 font-medium border-b border-gray-200 dark:border-slate-600">
                  Right Value
                </th>
              </tr>
            </thead>
            <tbody>
              {differences.map((diff, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <td className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 font-mono text-sm text-gray-800 dark:text-slate-200">
                    {diff.path}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                    <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${getTypeStyles(diff.type)}`}>
                      {diff.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 font-mono text-sm text-gray-700 dark:text-slate-300">
                    {diff.leftValue !== undefined ? (
                      <span className={diff.type === 'removed' ? 'text-red-600 dark:text-red-400' : ''}>
                        {JSON.stringify(diff.leftValue)}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 font-mono text-sm text-gray-700 dark:text-slate-300">
                    {diff.rightValue !== undefined ? (
                      <span className={diff.type === 'added' ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                        {JSON.stringify(diff.rightValue)}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-slate-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DiffViewer;
