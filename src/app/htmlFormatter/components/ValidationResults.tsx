'use client';
import React, { useState } from 'react';
import { ValidationResult } from '../validators/HTMLValidator';

interface ValidationResultsProps {
  validationResult: ValidationResult | null;
}

/**
 * Component for displaying HTML validation results
 * Shows errors, warnings, and info messages with expandable sections
 */
export const ValidationResults: React.FC<ValidationResultsProps> = ({
  validationResult,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('errors');

  if (!validationResult) return null;

  const { valid, errors, warnings, info } = validationResult;
  const totalIssues = errors.length + warnings.length + info.length;

  if (totalIssues === 0) {
    return (
      <div className="bg-green-50 border border-green-300 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-xl">✓</span>
          <span className="text-green-800 font-semibold">
            No issues found - HTML is valid!
          </span>
        </div>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="space-y-3">
      <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
        <h3 className="font-semibold text-blue-900">
          Validation Results: {totalIssues} issue{totalIssues !== 1 ? 's' : ''} found
        </h3>
        <div className="text-sm text-blue-700 mt-1 flex gap-4">
          {errors.length > 0 && <span>❌ {errors.length} error{errors.length !== 1 ? 's' : ''}</span>}
          {warnings.length > 0 && <span>⚠️ {warnings.length} warning{warnings.length !== 1 ? 's' : ''}</span>}
          {info.length > 0 && <span>ℹ️ {info.length} suggestion{info.length !== 1 ? 's' : ''}</span>}
        </div>
      </div>

      {/* Errors Section */}
      {errors.length > 0 && (
        <div className="border border-red-300 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('errors')}
            className="w-full bg-red-50 hover:bg-red-100 px-4 py-3 flex justify-between items-center transition-colors"
          >
            <span className="font-semibold text-red-800 flex items-center gap-2">
              <span>❌</span>
              Errors ({errors.length})
            </span>
            <span className="text-red-600">
              {expandedSection === 'errors' ? '▼' : '▶'}
            </span>
          </button>
          {expandedSection === 'errors' && (
            <div className="bg-white p-4 space-y-3">
              {errors.map((error, index) => (
                <div key={index} className="border-l-4 border-red-500 pl-3 py-1">
                  <div className="font-medium text-red-800">{error.message}</div>
                  {error.suggestion && (
                    <div className="text-sm text-gray-600 mt-1">
                      💡 {error.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Warnings Section */}
      {warnings.length > 0 && (
        <div className="border border-yellow-300 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('warnings')}
            className="w-full bg-yellow-50 hover:bg-yellow-100 px-4 py-3 flex justify-between items-center transition-colors"
          >
            <span className="font-semibold text-yellow-800 flex items-center gap-2">
              <span>⚠️</span>
              Warnings ({warnings.length})
            </span>
            <span className="text-yellow-600">
              {expandedSection === 'warnings' ? '▼' : '▶'}
            </span>
          </button>
          {expandedSection === 'warnings' && (
            <div className="bg-white p-4 space-y-3">
              {warnings.map((warning, index) => (
                <div key={index} className="border-l-4 border-yellow-500 pl-3 py-1">
                  <div className="font-medium text-yellow-800">{warning.message}</div>
                  {warning.suggestion && (
                    <div className="text-sm text-gray-600 mt-1">
                      💡 {warning.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info/Suggestions Section */}
      {info.length > 0 && (
        <div className="border border-blue-300 rounded-lg overflow-hidden">
          <button
            onClick={() => toggleSection('info')}
            className="w-full bg-blue-50 hover:bg-blue-100 px-4 py-3 flex justify-between items-center transition-colors"
          >
            <span className="font-semibold text-blue-800 flex items-center gap-2">
              <span>ℹ️</span>
              Suggestions ({info.length})
            </span>
            <span className="text-blue-600">
              {expandedSection === 'info' ? '▼' : '▶'}
            </span>
          </button>
          {expandedSection === 'info' && (
            <div className="bg-white p-4 space-y-3">
              {info.map((item, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-3 py-1">
                  <div className="font-medium text-blue-800">{item.message}</div>
                  {item.suggestion && (
                    <div className="text-sm text-gray-600 mt-1">
                      💡 {item.suggestion}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
