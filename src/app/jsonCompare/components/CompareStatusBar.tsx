'use client';

import { PlusCircleIcon, MinusCircleIcon, PencilIcon, EqualsIcon, CheckIcon, InfoIcon } from './Icons';

export interface CompareStats {
    additions: number;
    deletions: number;
    modifications: number;
    unchanged: number;
}

interface CompareStatusBarProps {
    stats: CompareStats | null;
    hasCompared: boolean;
}

/**
 * CompareStatusBar Component
 *
 * Displays comparison statistics: additions, deletions, modifications, unchanged count.
 * Professional design with icons and theme support.
 */
export default function CompareStatusBar({ stats, hasCompared }: CompareStatusBarProps) {
    return (
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-gray-100/50 to-gray-200/50 dark:from-slate-800/50 dark:to-slate-900/50 border-t border-gray-200/50 dark:border-slate-700/50 text-sm">
            <div className="flex items-center gap-6">
                {/* Additions */}
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                    <PlusCircleIcon size={14} className="text-emerald-500 dark:text-emerald-400" />
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        {stats?.additions ?? 0}
                    </span>
                    <span className="text-gray-400 dark:text-slate-500">Added</span>
                </div>

                {/* Deletions */}
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                    <MinusCircleIcon size={14} className="text-red-500 dark:text-red-400" />
                    <span className="font-medium text-red-600 dark:text-red-400">
                        {stats?.deletions ?? 0}
                    </span>
                    <span className="text-gray-400 dark:text-slate-500">Removed</span>
                </div>

                {/* Modifications */}
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                    <PencilIcon size={14} className="text-amber-500 dark:text-amber-400" />
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                        {stats?.modifications ?? 0}
                    </span>
                    <span className="text-gray-400 dark:text-slate-500">Modified</span>
                </div>

                {/* Unchanged */}
                <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400">
                    <EqualsIcon size={14} className="text-gray-400 dark:text-slate-500" />
                    <span className="font-medium text-gray-600 dark:text-slate-300">
                        {stats?.unchanged ?? 0}
                    </span>
                    <span className="text-gray-400 dark:text-slate-500">Unchanged</span>
                </div>
            </div>

            {/* Comparison Status */}
            <div className="flex items-center gap-2">
                {hasCompared ? (
                    stats && stats.additions === 0 && stats.deletions === 0 && stats.modifications === 0 ? (
                        <>
                            <CheckIcon size={14} className="text-emerald-500 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                Identical
                            </span>
                        </>
                    ) : (
                        <>
                            <CheckIcon size={14} className="text-emerald-500 dark:text-emerald-400" />
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                Comparison Complete
                            </span>
                        </>
                    )
                ) : (
                    <>
                        <InfoIcon size={14} className="text-gray-400 dark:text-slate-500" />
                        <span className="text-gray-400 dark:text-slate-500">
                            Ready to compare
                        </span>
                    </>
                )}
            </div>
        </div>
    );
}
