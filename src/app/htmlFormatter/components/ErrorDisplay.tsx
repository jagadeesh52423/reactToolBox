'use client';
import React from 'react';

interface ErrorDisplayProps {
  error: string;
  onDismiss?: () => void;
}

/**
 * Component for displaying error messages
 * Follows Single Responsibility Principle
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div
      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex justify-between items-start"
      role="alert"
    >
      <div className="flex-1">
        <strong className="font-semibold">Error: </strong>
        <span>{error}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="ml-4 text-red-700 hover:text-red-900"
          aria-label="Dismiss error"
        >
          ✕
        </button>
      )}
    </div>
  );
};
