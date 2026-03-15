'use client';

import { CheckIcon, AlertCircleIcon, InfoIcon } from '@/components/shared/Icons';

interface Stats {
  characters: number;
  lines: number;
  tags: number;
}

interface StatusBarProps {
  inputStats: Stats;
  outputStats: Stats;
  hasOutput: boolean;
  error: string;
}

/**
 * StatusBar Component
 *
 * Displays HTML statistics: characters, lines, tags, validity status.
 * Professional design with icons and subtle styling.
 */
export function StatusBar({ inputStats, outputStats, hasOutput, error }: StatusBarProps) {
  const stats = hasOutput ? outputStats : inputStats;

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-100/50 to-gray-200/50 dark:from-slate-800/50 dark:to-slate-900/50 border-t border-gray-200/50 dark:border-slate-700/50 text-sm">
      <div className="flex items-center gap-6">
        {/* Characters */}
        <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
          <svg className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          <span className="font-medium text-gray-700 dark:text-slate-300">{stats.characters.toLocaleString()}</span>
          <span className="text-gray-400 dark:text-slate-500">chars</span>
        </div>

        {/* Lines */}
        <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
          <svg className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          <span className="font-medium text-gray-700 dark:text-slate-300">{stats.lines.toLocaleString()}</span>
          <span className="text-gray-400 dark:text-slate-500">lines</span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
          <svg className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="font-medium text-gray-700 dark:text-slate-300">{stats.tags.toLocaleString()}</span>
          <span className="text-gray-400 dark:text-slate-500">tags</span>
        </div>

        {/* Output indicator */}
        {hasOutput && (
          <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 pl-4 border-l border-gray-300/50 dark:border-slate-600/50">
            <InfoIcon size={14} className="text-blue-400 dark:text-blue-500" />
            <span className="text-blue-600 dark:text-blue-400">Showing formatted output</span>
          </div>
        )}
      </div>

      {/* Validity Status */}
      <div className="flex items-center gap-2">
        {!error && inputStats.characters > 0 ? (
          <>
            <CheckIcon size={14} className="text-emerald-500 dark:text-emerald-400" />
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Valid HTML</span>
          </>
        ) : error ? (
          <>
            <AlertCircleIcon size={14} className="text-red-500 dark:text-red-400" />
            <span className="text-red-600 dark:text-red-400 font-medium">Parse Error</span>
          </>
        ) : (
          <>
            <AlertCircleIcon size={14} className="text-gray-400 dark:text-slate-500" />
            <span className="text-gray-400 dark:text-slate-500">No input</span>
          </>
        )}
      </div>
    </div>
  );
}
