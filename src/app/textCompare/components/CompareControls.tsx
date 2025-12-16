'use client';
import React from 'react';
import { DiffOptions } from '../models/DiffModels';

interface CompareControlsProps {
  onCompare: () => void;
  onSwap: () => void;
  onReset: () => void;
  options: DiffOptions;
  onOptionsChange: (options: Partial<DiffOptions>) => void;
  disabled?: boolean;
}

/**
 * Component for comparison controls
 * Follows Single Responsibility Principle
 */
export const CompareControls: React.FC<CompareControlsProps> = ({
  onCompare,
  onSwap,
  onReset,
  options,
  onOptionsChange,
  disabled = false,
}) => {
  return (
    <div className="flex flex-col gap-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
      {/* Options */}
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.ignoreWhitespace || false}
            onChange={(e) => onOptionsChange({ ignoreWhitespace: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Ignore Whitespace</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={options.ignoreCase || false}
            onChange={(e) => onOptionsChange({ ignoreCase: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Ignore Case</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onCompare}
          disabled={disabled}
          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Compare Text
        </button>

        <button
          onClick={onSwap}
          disabled={disabled}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Swap
        </button>

        <button
          onClick={onReset}
          disabled={disabled}
          className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset
        </button>
      </div>
    </div>
  );
};
