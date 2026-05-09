'use client';

import { SearchOptions } from '../models/JsonModels';
import { SearchIcon } from '@/components/shared/Icons';

interface SearchControlsProps {
    searchOptions: SearchOptions;
    matchCount: number;
    onSearchTextChange: (text: string) => void;
    onSearchLevelChange: (level: string) => void;
    onFilterToggle: (enabled: boolean) => void;
    onFuzzyToggle: (enabled: boolean) => void;
    onCaseSensitiveToggle: (enabled: boolean) => void;
    onRegexToggle: (enabled: boolean) => void;
    onKeysOnlyToggle: (enabled: boolean) => void;
    onSearch: () => void;
    onOpenPalette?: () => void;
}

export default function SearchControls({
    searchOptions,
    matchCount,
    onOpenPalette,
}: SearchControlsProps) {
    return (
        <div
            className="flex items-center gap-3 px-4 py-2 border-b cursor-pointer transition-colors"
            style={{
                borderColor: 'var(--jv-border)',
                background: 'var(--jv-bg-secondary)',
            }}
            onClick={onOpenPalette}
            title="Open search (⌘K)"
        >
            <span style={{ color: 'var(--jv-text-muted)' }}><SearchIcon size={16} /></span>
            <span
                className="flex-1 text-sm"
                style={{
                    color: searchOptions.searchText ? 'var(--jv-text-primary)' : 'var(--jv-text-muted)',
                    fontFamily: 'var(--jv-font-sans)',
                }}
            >
                {searchOptions.searchText || 'Search...'}
            </span>

            {/* Active filters indicators */}
            {(searchOptions.isCaseSensitive || searchOptions.isRegexEnabled || searchOptions.isFuzzyEnabled || searchOptions.isKeysOnly || searchOptions.isFilterEnabled) && (
                <div className="flex items-center gap-1">
                    {searchOptions.isCaseSensitive && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(96, 165, 250, 0.15)', color: 'var(--jv-accent)' }}>Aa</span>
                    )}
                    {searchOptions.isRegexEnabled && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(96, 165, 250, 0.15)', color: 'var(--jv-accent)' }}>.*</span>
                    )}
                    {searchOptions.isFuzzyEnabled && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(96, 165, 250, 0.15)', color: 'var(--jv-accent)' }}>~</span>
                    )}
                    {searchOptions.isKeysOnly && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(96, 165, 250, 0.15)', color: 'var(--jv-accent)' }}>{'{k}'}</span>
                    )}
                    {searchOptions.isFilterEnabled && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono" style={{ background: 'rgba(96, 165, 250, 0.15)', color: 'var(--jv-accent)' }}>⚡</span>
                    )}
                </div>
            )}

            {/* Match count badge */}
            {searchOptions.searchText && (
                <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                        background: matchCount > 0 ? 'rgba(96, 165, 250, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: matchCount > 0 ? 'var(--jv-accent)' : 'var(--jv-danger)',
                        fontFamily: 'var(--jv-font-mono)',
                    }}
                >
                    {matchCount}
                </span>
            )}

            {/* Cmd+K hint */}
            <kbd
                className="px-1.5 py-0.5 rounded text-[10px] border"
                style={{
                    background: 'var(--jv-bg-primary)',
                    borderColor: 'var(--jv-border)',
                    color: 'var(--jv-text-muted)',
                    fontFamily: 'var(--jv-font-mono)',
                }}
            >
                ⌘K
            </kbd>
        </div>
    );
}
