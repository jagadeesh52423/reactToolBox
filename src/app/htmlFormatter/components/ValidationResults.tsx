'use client';
import React, { useState } from 'react';
import { ValidationResult } from '../validators/HTMLValidator';
import { CheckCircleIcon, AlertCircleIcon, InfoIcon, XIcon, ChevronDownIcon, ChevronRightIcon } from '@/components/shared/Icons';

interface ValidationResultsProps {
  validationResult: ValidationResult | null;
  onClose: () => void;
}

/**
 * ValidationResults Component - Professional Redesign
 *
 * Shows errors, warnings, and info messages with expandable sections.
 * Full dark mode support and modern styling.
 */
export const ValidationResults: React.FC<ValidationResultsProps> = ({
  validationResult,
  onClose,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('errors');

  if (!validationResult) return null;

  const { errors, warnings, info } = validationResult;
  const totalIssues = errors.length + warnings.length + info.length;

  if (totalIssues === 0) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300/50 dark:border-emerald-500/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
            <CheckCircleIcon size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-emerald-800 dark:text-emerald-300 font-medium">
            No issues found - HTML is valid!
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
        >
          <XIcon size={18} />
        </button>
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-3">
          <InfoIcon size={18} className="text-blue-500 dark:text-blue-400" />
          <span className="font-medium text-gray-900 dark:text-slate-200">
            Validation Results: {totalIssues} issue{totalIssues !== 1 ? 's' : ''} found
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            {errors.length > 0 && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertCircleIcon size={14} />
                {errors.length}
              </span>
            )}
            {warnings.length > 0 && (
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <AlertCircleIcon size={14} />
                {warnings.length}
              </span>
            )}
            {info.length > 0 && (
              <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                <InfoIcon size={14} />
                {info.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>
      </div>

      <div className="max-h-64 overflow-auto">
        {/* Errors Section */}
        {errors.length > 0 && (
          <div className="border-b border-gray-200/50 dark:border-slate-700/50 last:border-b-0">
            <button
              onClick={() => toggleSection('errors')}
              className="w-full bg-red-50/50 dark:bg-red-900/10 hover:bg-red-100/50 dark:hover:bg-red-900/20 px-4 py-3 flex justify-between items-center transition-colors"
            >
              <span className="font-medium text-red-800 dark:text-red-300 flex items-center gap-2">
                <AlertCircleIcon size={16} />
                Errors ({errors.length})
              </span>
              {expandedSection === 'errors' ? (
                <ChevronDownIcon size={16} className="text-red-600 dark:text-red-400" />
              ) : (
                <ChevronRightIcon size={16} className="text-red-600 dark:text-red-400" />
              )}
            </button>
            {expandedSection === 'errors' && (
              <div className="bg-white dark:bg-slate-800/30 p-4 space-y-3">
                {errors.map((error, index) => (
                  <div key={index} className="border-l-4 border-red-500 dark:border-red-400 pl-3 py-1">
                    <div className="font-medium text-red-800 dark:text-red-300">{error.message}</div>
                    {error.suggestion && (
                      <div className="text-sm text-gray-600 dark:text-slate-400 mt-1 flex items-start gap-1">
                        <span className="text-amber-500">Tip:</span>
                        {error.suggestion}
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
          <div className="border-b border-gray-200/50 dark:border-slate-700/50 last:border-b-0">
            <button
              onClick={() => toggleSection('warnings')}
              className="w-full bg-amber-50/50 dark:bg-amber-900/10 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 px-4 py-3 flex justify-between items-center transition-colors"
            >
              <span className="font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <AlertCircleIcon size={16} />
                Warnings ({warnings.length})
              </span>
              {expandedSection === 'warnings' ? (
                <ChevronDownIcon size={16} className="text-amber-600 dark:text-amber-400" />
              ) : (
                <ChevronRightIcon size={16} className="text-amber-600 dark:text-amber-400" />
              )}
            </button>
            {expandedSection === 'warnings' && (
              <div className="bg-white dark:bg-slate-800/30 p-4 space-y-3">
                {warnings.map((warning, index) => (
                  <div key={index} className="border-l-4 border-amber-500 dark:border-amber-400 pl-3 py-1">
                    <div className="font-medium text-amber-800 dark:text-amber-300">{warning.message}</div>
                    {warning.suggestion && (
                      <div className="text-sm text-gray-600 dark:text-slate-400 mt-1 flex items-start gap-1">
                        <span className="text-amber-500">Tip:</span>
                        {warning.suggestion}
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
          <div className="border-b border-gray-200/50 dark:border-slate-700/50 last:border-b-0">
            <button
              onClick={() => toggleSection('info')}
              className="w-full bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 px-4 py-3 flex justify-between items-center transition-colors"
            >
              <span className="font-medium text-blue-800 dark:text-blue-300 flex items-center gap-2">
                <InfoIcon size={16} />
                Suggestions ({info.length})
              </span>
              {expandedSection === 'info' ? (
                <ChevronDownIcon size={16} className="text-blue-600 dark:text-blue-400" />
              ) : (
                <ChevronRightIcon size={16} className="text-blue-600 dark:text-blue-400" />
              )}
            </button>
            {expandedSection === 'info' && (
              <div className="bg-white dark:bg-slate-800/30 p-4 space-y-3">
                {info.map((item, index) => (
                  <div key={index} className="border-l-4 border-blue-500 dark:border-blue-400 pl-3 py-1">
                    <div className="font-medium text-blue-800 dark:text-blue-300">{item.message}</div>
                    {item.suggestion && (
                      <div className="text-sm text-gray-600 dark:text-slate-400 mt-1 flex items-start gap-1">
                        <span className="text-amber-500">Tip:</span>
                        {item.suggestion}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
