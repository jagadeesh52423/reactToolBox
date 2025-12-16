'use client';
import React from 'react';
import { TextCaseType, TextCaseOption } from '../models/TextCaseType';

interface CaseSelectorProps {
  selectedCase: TextCaseType;
  options: TextCaseOption[];
  onChange: (caseType: TextCaseType) => void;
}

/**
 * Component for selecting text case type
 * Follows Single Responsibility Principle - only handles case selection UI
 */
export const CaseSelector: React.FC<CaseSelectorProps> = ({
  selectedCase,
  options,
  onChange,
}) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-3">Select Text Case</h2>
      <select
        value={selectedCase}
        onChange={(e) => onChange(e.target.value as TextCaseType)}
        className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Select text case type"
      >
        {options.map((option) => (
          <option key={option.type} value={option.type}>
            {option.label} - {option.example}
          </option>
        ))}
      </select>
    </div>
  );
};
