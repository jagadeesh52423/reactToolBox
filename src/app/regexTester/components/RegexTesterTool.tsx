'use client';

import React, { useState, useMemo, useCallback } from 'react';
import RegexInputBar from './RegexInputBar';
import TestStringPanel from './TestStringPanel';
import ResultsPanel from './ResultsPanel';

interface Flags {
    g: boolean;
    i: boolean;
    m: boolean;
    s: boolean;
}

interface MatchInfo {
    fullMatch: string;
    index: number;
    groups: Record<string, string> | null;
    captures: string[];
}

/**
 * RegexTesterTool Component
 *
 * Main orchestrator for the Regex Tester tool. Manages all state
 * including the regex pattern, flags, test string, and computed matches.
 * Provides live matching with error handling for invalid patterns.
 */
export default function RegexTesterTool() {
    const [pattern, setPattern] = useState('');
    const [flags, setFlags] = useState<Flags>({ g: true, i: false, m: false, s: false });
    const [testString, setTestString] = useState('');

    // Build the flag string from the flags object
    const flagString = useMemo(() => {
        return (Object.keys(flags) as (keyof Flags)[])
            .filter((key) => flags[key])
            .join('');
    }, [flags]);

    // Compute regex error (if pattern is invalid)
    const regexError = useMemo((): string | null => {
        if (!pattern) return null;
        try {
            new RegExp(pattern, flagString);
            return null;
        } catch (e) {
            return e instanceof Error ? e.message : 'Invalid regular expression';
        }
    }, [pattern, flagString]);

    // Compute matches from pattern, flags, and test string
    const matches = useMemo((): MatchInfo[] => {
        if (!pattern || !testString || regexError) return [];

        try {
            const regex = new RegExp(pattern, flagString);
            const results: MatchInfo[] = [];

            if (flags.g) {
                // Global mode: find all matches
                let match: RegExpExecArray | null;
                // Safety limit to prevent infinite loops on zero-length matches
                let iterations = 0;
                const maxIterations = 10000;

                while ((match = regex.exec(testString)) !== null && iterations < maxIterations) {
                    results.push({
                        fullMatch: match[0],
                        index: match.index,
                        groups: match.groups ? { ...match.groups } : null,
                        captures: match.slice(1),
                    });

                    // Prevent infinite loop on zero-length matches
                    if (match[0].length === 0) {
                        regex.lastIndex++;
                    }

                    iterations++;
                }
            } else {
                // Non-global mode: find first match only
                const match = regex.exec(testString);
                if (match) {
                    results.push({
                        fullMatch: match[0],
                        index: match.index,
                        groups: match.groups ? { ...match.groups } : null,
                        captures: match.slice(1),
                    });
                }
            }

            return results;
        } catch {
            return [];
        }
    }, [pattern, flagString, testString, regexError, flags.g]);

    const handleFlagToggle = useCallback((flag: keyof Flags) => {
        setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
    }, []);

    const handlePresetSelect = useCallback((presetPattern: string) => {
        setPattern(presetPattern);
    }, []);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Regex Input Bar */}
            <RegexInputBar
                pattern={pattern}
                flags={flags}
                error={regexError}
                onPatternChange={setPattern}
                onFlagToggle={handleFlagToggle}
                onPresetSelect={handlePresetSelect}
            />

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-hidden min-h-0">
                <div className="w-full h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                        {/* Left Panel - Test String with Highlighting */}
                        <TestStringPanel
                            testString={testString}
                            matches={matches}
                            onTestStringChange={setTestString}
                        />

                        {/* Right Panel - Results */}
                        <ResultsPanel
                            matches={matches}
                            pattern={pattern}
                            testString={testString}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
