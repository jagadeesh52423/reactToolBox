'use client';
import React from 'react';

interface FormatControlsProps {
  indentSize: number;
  onIndentSizeChange: (size: number) => void;
  onFormat: () => void;
  disabled?: boolean;
}

/**
 * Component for formatting controls
 * Follows Single Responsibility Principle
 */
export const FormatControls: React.FC<FormatControlsProps> = ({
  indentSize,
  onIndentSizeChange,
  onFormat,
  disabled = false,
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <label htmlFor="indentSize" className="text-sm font-medium">
          Indent Size:
        </label>
        <select
          id="indentSize"
          className="border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={indentSize}
          onChange={(e) => onIndentSizeChange(Number(e.target.value))}
          disabled={disabled}
        >
          <option value="2">2 spaces</option>
          <option value="4">4 spaces</option>
          <option value="6">6 spaces</option>
          <option value="8">8 spaces</option>
        </select>
      </div>

      <button
        onClick={onFormat}
        disabled={disabled}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        aria-label="Format HTML"
      >
        Format HTML
      </button>
    </div>
  );
};
