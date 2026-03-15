'use client';

import React from 'react';

interface TableViewProps {
  headers: string[];
  rows: Record<string, string>[];
}

/**
 * TableView Component
 *
 * Renders parsed data as an HTML table with alternating row colors,
 * horizontal scroll for wide tables, and dark mode support.
 */
export default function TableView({ headers, rows }: TableViewProps) {
  if (headers.length === 0 || rows.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm">
        No data to display in table view
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse text-sm min-w-max">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            {headers.map((header) => (
              <th
                key={header}
                className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={
                rowIdx % 2 === 0
                  ? 'bg-white dark:bg-gray-900'
                  : 'bg-gray-50 dark:bg-gray-800/50'
              }
            >
              {headers.map((header) => (
                <td
                  key={`${rowIdx}-${header}`}
                  className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 whitespace-nowrap"
                >
                  {row[header] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
