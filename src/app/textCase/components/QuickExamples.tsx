'use client';
import React from 'react';
import { TextCaseOption } from '../models/TextCaseType';

interface QuickExamplesProps {
  options: TextCaseOption[];
  maxExamples?: number;
}

/**
 * Component for displaying quick examples of text cases
 * Follows Single Responsibility Principle - only handles examples display
 */
export const QuickExamples: React.FC<QuickExamplesProps> = ({
  options,
  maxExamples = 6,
}) => {
  const exampleOptions = options.slice(0, maxExamples);

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-3">Quick Examples</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {exampleOptions.map((option) => (
          <div key={option.type} className="bg-white p-3 rounded border">
            <div className="font-medium text-sm">{option.label}</div>
            <div className="text-gray-600 text-xs mt-1">{option.example}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
