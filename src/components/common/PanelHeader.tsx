'use client';

import React, { ReactNode } from 'react';

interface PanelHeaderProps {
  title: string;
  children?: ReactNode;
  showMacButtons?: boolean;
}

/**
 * Common PanelHeader Component
 *
 * Reusable panel header with macOS-style window controls and action buttons.
 * Used across different tools for consistent UI/UX.
 */
export default function PanelHeader({
  title,
  children,
  showMacButtons = true
}: PanelHeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center gap-2">
        {showMacButtons && (
          <>
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </>
        )}
        <span className="ml-3 text-sm font-medium text-gray-600 dark:text-slate-300">
          {title}
        </span>
      </div>

      {/* Action Buttons */}
      {children && (
        <div className="flex items-center gap-1">
          {children}
        </div>
      )}
    </div>
  );
}
