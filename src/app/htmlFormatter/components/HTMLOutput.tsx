'use client';
import React, { useState } from 'react';
import PanelHeader from '@/components/common/PanelHeader';
import {
  DownloadIcon,
  ClipboardIcon,
  ClipboardCheckIcon,
  BracesIcon,
} from '@/components/shared/Icons';

interface HTMLOutputProps {
  highlightedHTML: string;
  formattedHTML: string;
  onCopy: () => void;
  onDownload: () => void;
  stats: {
    characters: number;
    lines: number;
    tags: number;
  };
  hasContent: boolean;
}

/**
 * HTMLOutput Component - Professional Redesign
 *
 * Features:
 * - Modern icon-based toolbar
 * - Copy/Download integration
 * - Syntax highlighted output
 * - Clean panel design with PanelHeader
 */
export const HTMLOutput: React.FC<HTMLOutputProps> = ({
  highlightedHTML,
  onCopy,
  onDownload,
  hasContent,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyClick = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
      {/* Header */}
      <PanelHeader title="Formatted Output">
        {/* Action Buttons Group */}
        <div className="flex items-center gap-1">
          {/* Download Button */}
          <button
            onClick={onDownload}
            disabled={!hasContent}
            className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Download formatted HTML"
          >
            <DownloadIcon size={18} />
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyClick}
            disabled={!hasContent}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
              copied
                ? 'bg-emerald-100/50 dark:bg-emerald-600/30 text-emerald-600 dark:text-emerald-400 border border-emerald-300/50 dark:border-emerald-500/30'
                : 'text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white bg-gray-100/50 dark:bg-slate-700/30 hover:bg-gray-200/50 dark:hover:bg-slate-700/50 border border-gray-300/50 dark:border-slate-600/30'
            }`}
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <ClipboardCheckIcon size={16} />
                <span className="text-sm font-medium">Copied!</span>
              </>
            ) : (
              <>
                <ClipboardIcon size={16} />
                <span className="text-sm font-medium">Copy</span>
              </>
            )}
          </button>
        </div>
      </PanelHeader>

      {/* Output Content */}
      <div className="flex-1 min-h-0 overflow-auto bg-slate-50 dark:bg-slate-900/50">
        {hasContent ? (
          <pre className="p-4 whitespace-pre-wrap font-mono text-sm leading-relaxed text-gray-800 dark:text-slate-200">
            <div dangerouslySetInnerHTML={{ __html: highlightedHTML }} />
          </pre>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-500 p-8">
            <BracesIcon size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium mb-1">No formatted output yet</p>
            <p className="text-sm text-center">
              Enter HTML code in the input panel and click Format to see the beautified result
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
