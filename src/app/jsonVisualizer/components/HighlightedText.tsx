'use client';

import { useMemo } from 'react';
import { SearchOptions } from '../models/JsonModels';

interface HighlightedTextProps {
    text: string;
    searchOptions: SearchOptions;
    className?: string;
}

/**
 * HighlightedText Component
 *
 * Renders text with highlighted matching portions based on search options.
 * Supports exact, fuzzy, case-sensitive, and regex matching.
 */
export default function HighlightedText({
    text,
    searchOptions,
    className = ''
}: HighlightedTextProps) {
    const { searchText, isFuzzyEnabled, isCaseSensitive, isRegexEnabled } = searchOptions;

    const segments = useMemo(() => {
        if (!searchText || !text) {
            return [{ text, highlight: false }];
        }

        try {
            const positions: [number, number][] = [];

            if (isRegexEnabled) {
                // Regex matching
                const flags = isCaseSensitive ? 'g' : 'gi';
                const regex = new RegExp(searchText, flags);
                let match;
                while ((match = regex.exec(text)) !== null) {
                    positions.push([match.index, match.index + match[0].length]);
                    // Prevent infinite loop for zero-length matches
                    if (match[0].length === 0) {
                        regex.lastIndex++;
                    }
                }
            } else if (isFuzzyEnabled) {
                // Fuzzy matching - highlight individual matched characters
                const searchLower = searchText.toLowerCase();
                const textLower = text.toLowerCase();
                let searchIdx = 0;

                for (let i = 0; i < text.length && searchIdx < searchText.length; i++) {
                    if (textLower[i] === searchLower[searchIdx]) {
                        positions.push([i, i + 1]);
                        searchIdx++;
                    }
                }

                // Only highlight if all search characters were found
                if (searchIdx !== searchText.length) {
                    return [{ text, highlight: false }];
                }
            } else {
                // Exact substring matching
                const searchFor = isCaseSensitive ? searchText : searchText.toLowerCase();
                const searchIn = isCaseSensitive ? text : text.toLowerCase();

                let startIndex = 0;
                while (startIndex < text.length) {
                    const foundIndex = searchIn.indexOf(searchFor, startIndex);
                    if (foundIndex === -1) break;
                    positions.push([foundIndex, foundIndex + searchText.length]);
                    startIndex = foundIndex + 1;
                }
            }

            if (positions.length === 0) {
                return [{ text, highlight: false }];
            }

            // Merge overlapping positions
            const merged: [number, number][] = [];
            positions.sort((a, b) => a[0] - b[0]);

            for (const pos of positions) {
                if (merged.length === 0 || merged[merged.length - 1][1] < pos[0]) {
                    merged.push([...pos]);
                } else {
                    merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], pos[1]);
                }
            }

            // Build segments
            const result: { text: string; highlight: boolean }[] = [];
            let lastEnd = 0;

            for (const [start, end] of merged) {
                if (start > lastEnd) {
                    result.push({ text: text.slice(lastEnd, start), highlight: false });
                }
                result.push({ text: text.slice(start, end), highlight: true });
                lastEnd = end;
            }

            if (lastEnd < text.length) {
                result.push({ text: text.slice(lastEnd), highlight: false });
            }

            return result;
        } catch {
            // If anything fails, return unhighlighted text
            return [{ text, highlight: false }];
        }
    }, [text, searchText, isFuzzyEnabled, isCaseSensitive, isRegexEnabled]);

    return (
        <span className={className}>
            {segments.map((segment, index) =>
                segment.highlight ? (
                    <mark
                        key={index}
                        className="bg-yellow-300 dark:bg-yellow-500/40 text-inherit rounded-sm px-0.5"
                    >
                        {segment.text}
                    </mark>
                ) : (
                    <span key={index}>{segment.text}</span>
                )
            )}
        </span>
    );
}
