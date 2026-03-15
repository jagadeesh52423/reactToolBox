'use client';

import React, { useRef, useCallback } from 'react';
import PanelHeader from '@/components/common/PanelHeader';

interface MatchInfo {
    fullMatch: string;
    index: number;
    groups: Record<string, string> | null;
    captures: string[];
}

interface TestStringPanelProps {
    testString: string;
    matches: MatchInfo[];
    onTestStringChange: (value: string) => void;
}

/**
 * TestStringPanel Component
 *
 * Left panel containing the test string input with a match highlighting overlay.
 * Uses a layered approach: a background div renders highlighted match regions,
 * while a transparent textarea sits on top for editing.
 */
export default function TestStringPanel({
    testString,
    matches,
    onTestStringChange,
}: TestStringPanelProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback(() => {
        if (textareaRef.current && highlightRef.current) {
            highlightRef.current.scrollTop = textareaRef.current.scrollTop;
            highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    }, []);

    /**
     * Build highlighted HTML from the test string and match positions.
     * Match regions get a yellow highlight; non-matching text is rendered
     * with transparent color to maintain spacing alignment.
     */
    function buildHighlightedHtml(): string {
        if (matches.length === 0 || !testString) {
            // Render all text as invisible (just for spacing)
            return escapeHtml(testString) + '\n';
        }

        // Sort matches by index and deduplicate overlapping ranges
        const sortedMatches = [...matches].sort((a, b) => a.index - b.index);
        const segments: string[] = [];
        let lastIndex = 0;

        for (const match of sortedMatches) {
            const matchEnd = match.index + match.fullMatch.length;

            // Skip overlapping matches
            if (match.index < lastIndex) continue;

            // Non-matching segment before this match
            if (match.index > lastIndex) {
                const nonMatchText = testString.slice(lastIndex, match.index);
                segments.push(`<span style="color: transparent;">${escapeHtml(nonMatchText)}</span>`);
            }

            // Highlighted match
            const matchText = testString.slice(match.index, matchEnd);
            segments.push(
                `<mark class="bg-yellow-200 dark:bg-yellow-700/50 text-transparent rounded-sm px-0">${escapeHtml(matchText)}</mark>`
            );

            lastIndex = matchEnd;
        }

        // Remaining non-matching text
        if (lastIndex < testString.length) {
            const remaining = testString.slice(lastIndex);
            segments.push(`<span style="color: transparent;">${escapeHtml(remaining)}</span>`);
        }

        // Add trailing newline to prevent scrollbar mismatch
        return segments.join('') + '\n';
    }

    function escapeHtml(text: string): string {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/\n/g, '\n');
    }

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden flex flex-col h-full">
            <PanelHeader title="Test String">
                {matches.length > 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {matches.length} match{matches.length !== 1 ? 'es' : ''}
                    </span>
                )}
            </PanelHeader>

            <div className="flex-1 relative overflow-hidden min-h-0">
                {/* Highlight overlay (behind the textarea) */}
                <div
                    ref={highlightRef}
                    className="absolute inset-0 px-4 py-4 font-mono text-sm overflow-auto pointer-events-none whitespace-pre-wrap break-words"
                    style={{ lineHeight: '24px' }}
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: buildHighlightedHtml() }}
                />

                {/* Transparent textarea (on top for editing) */}
                <textarea
                    ref={textareaRef}
                    value={testString}
                    onChange={(e) => onTestStringChange(e.target.value)}
                    onScroll={handleScroll}
                    placeholder="Enter test string to match against..."
                    className="relative w-full h-full px-4 py-4 font-mono text-sm bg-transparent text-gray-900 dark:text-slate-100 resize-none outline-none overflow-auto whitespace-pre-wrap break-words"
                    style={{ lineHeight: '24px', caretColor: 'auto' }}
                    spellCheck={false}
                    aria-label="Test string input"
                />
            </div>
        </div>
    );
}
