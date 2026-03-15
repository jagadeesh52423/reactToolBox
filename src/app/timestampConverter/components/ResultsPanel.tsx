'use client';

import React, { useState, useCallback } from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import { ConversionResult } from '../utils/timestampUtils';

interface ResultsPanelProps {
  conversions: ConversionResult[];
}

/**
 * ResultsPanel
 *
 * Right panel displaying a grid of conversion result cards.
 * Each card shows a label, value, and a copy-to-clipboard button
 * with brief visual feedback.
 */
export default function ResultsPanel({ conversions }: ResultsPanelProps) {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const handleCopy = useCallback(async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      setTimeout(() => setCopiedLabel(null), 2000);
    } catch {
      // Clipboard access may fail in certain environments; silently ignore.
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col">
      <PanelHeader title="Conversions" />

      <div className="flex-1 overflow-auto p-4">
        {conversions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">
            Enter a timestamp or date string to see conversions.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {conversions.map((c) => (
              <div
                key={c.label}
                className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  {c.label}
                </div>
                <div className="font-mono text-sm text-gray-900 dark:text-gray-100 flex justify-between items-center">
                  <span className="break-all mr-2">{c.value}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(c.value, c.label)}
                    className="flex-shrink-0 p-1.5 rounded hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-colors"
                    title={`Copy ${c.label}`}
                    aria-label={`Copy ${c.label} value`}
                  >
                    {copiedLabel === c.label ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-green-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-gray-400 dark:text-gray-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
