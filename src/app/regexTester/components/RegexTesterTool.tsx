'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
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

// Patterns like (a+)+b exhibit catastrophic backtracking: a single regex.exec()
// call can hang the tab indefinitely, and the existing iteration guard below
// only bounds the *number* of global-match loop iterations, not the time spent
// inside one exec() call. Running the match in a Worker lets us terminate() it
// on a timeout instead of freezing the main thread.
const MATCH_TIMEOUT_MS = 2000;

const MATCH_WORKER_SOURCE = `
self.onmessage = function (e) {
    var pattern = e.data.pattern;
    var flagString = e.data.flagString;
    var testString = e.data.testString;
    var isGlobal = e.data.isGlobal;
    var results = [];
    try {
        var regex = new RegExp(pattern, flagString);
        if (isGlobal) {
            var match;
            var iterations = 0;
            var maxIterations = 10000;
            while ((match = regex.exec(testString)) !== null && iterations < maxIterations) {
                results.push({
                    fullMatch: match[0],
                    index: match.index,
                    groups: match.groups ? Object.assign({}, match.groups) : null,
                    captures: match.slice(1),
                });
                if (match[0].length === 0) {
                    regex.lastIndex++;
                }
                iterations++;
            }
        } else {
            var single = regex.exec(testString);
            if (single) {
                results.push({
                    fullMatch: single[0],
                    index: single.index,
                    groups: single.groups ? Object.assign({}, single.groups) : null,
                    captures: single.slice(1),
                });
            }
        }
    } catch (err) {
        results = [];
    }
    self.postMessage({ results: results });
};
`;

let matchWorkerUrl: string | null = null;
function getMatchWorkerUrl(): string {
    if (!matchWorkerUrl) {
        const blob = new Blob([MATCH_WORKER_SOURCE], { type: 'application/javascript' });
        matchWorkerUrl = URL.createObjectURL(blob);
    }
    return matchWorkerUrl;
}

/**
 * RegexTesterTool Component
 *
 * Main orchestrator for the Regex Tester tool. Manages all state
 * including the regex pattern, flags, test string, and computed matches.
 * Provides live matching with error handling for invalid patterns.
 */
export default function RegexTesterTool() {
    const searchParams = useSearchParams();
    const urlPattern = searchParams.get('pattern');
    const urlFlags = searchParams.get('flags');
    const urlTest = searchParams.get('test');

    const [pattern, setPattern] = useLocalStorage('reactToolBox_regexTester_pattern', '');
    const [flags, setFlags] = useState<Flags>({ g: true, i: false, m: false, s: false });
    const [testString, setTestString] = useLocalStorage('reactToolBox_regexTester_testString', '');

    // URL params take priority on mount
    useEffect(() => {
        if (urlPattern !== null) setPattern(urlPattern);
        if (urlTest !== null) setTestString(urlTest);
        if (urlFlags !== null) {
            setFlags({
                g: urlFlags.includes('g'),
                i: urlFlags.includes('i'),
                m: urlFlags.includes('m'),
                s: urlFlags.includes('s'),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    // Compute matches from pattern, flags, and test string. Runs in a Worker
    // (see MATCH_WORKER_SOURCE above) so a catastrophically-backtracking pattern
    // can be terminate()'d on timeout instead of freezing the tab.
    const [matches, setMatches] = useState<MatchInfo[]>([]);
    const [matchTimedOut, setMatchTimedOut] = useState(false);

    useEffect(() => {
        if (!pattern || !testString || regexError) {
            setMatches([]);
            setMatchTimedOut(false);
            return;
        }

        let settled = false;
        const worker = new Worker(getMatchWorkerUrl());

        const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            worker.terminate();
            setMatches([]);
            setMatchTimedOut(true);
        }, MATCH_TIMEOUT_MS);

        worker.onmessage = (e: MessageEvent<{ results: MatchInfo[] }>) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            setMatches(e.data.results ?? []);
            setMatchTimedOut(false);
            worker.terminate();
        };

        worker.onerror = () => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            setMatches([]);
            setMatchTimedOut(false);
            worker.terminate();
        };

        worker.postMessage({ pattern, flagString, testString, isGlobal: flags.g });

        return () => {
            settled = true;
            clearTimeout(timeoutId);
            worker.terminate();
        };
    }, [pattern, flagString, testString, regexError, flags.g]);

    const handleFlagToggle = useCallback((flag: keyof Flags) => {
        setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
    }, []);

    const handlePresetSelect = useCallback((presetPattern: string) => {
        setPattern(presetPattern);
    }, []);

    const inputError = regexError ?? (matchTimedOut
        ? 'Pattern timed out — possible catastrophic backtracking. Try simplifying the pattern.'
        : null);

    return (
        <div className="h-[var(--tool-content-height)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Regex Input Bar */}
            <RegexInputBar
                pattern={pattern}
                flags={flags}
                error={inputError}
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
