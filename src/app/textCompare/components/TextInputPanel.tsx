'use client';
import React from 'react';

interface TextInputPanelProps {
  title: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Component for text input panel
 * Follows Single Responsibility Principle
 */
export const TextInputPanel: React.FC<TextInputPanelProps> = ({
  title,
  value,
  onChange,
  placeholder = 'Enter text here...',
}) => {
  return (
    <div className="w-full">
      <div className="mb-2">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <textarea
        className="w-full h-60 p-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={title}
      />
      <div className="text-sm text-gray-600 mt-1">
        {value.split('\n').length} lines, {value.length} characters
      </div>
    </div>
  );
};
