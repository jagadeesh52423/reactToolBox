/**
 * FuzzySearchStrategy
 *
 * Implements fuzzy matching for search using multiple strategies:
 * 1. Levenshtein distance - catches common typos like "emial" vs "email"
 * 2. Subsequence matching - characters appear in order but not consecutively
 *
 * Example: "emial" matches "email" (typo), "apl" matches "apple" (subsequence)
 *
 * Time Complexity: O(n*m) for Levenshtein, O(n) for subsequence
 * Space Complexity: O(min(n,m)) for Levenshtein, O(k) for positions
 */

import { ISearchStrategy } from './ISearchStrategy';

// Default threshold: allow 2 edits for every 5 characters (40% tolerance)
const DEFAULT_DISTANCE_THRESHOLD = 0.4;

export class FuzzySearchStrategy implements ISearchStrategy {
    readonly name = 'fuzzy';
    private distanceThreshold: number;

    constructor(distanceThreshold: number = DEFAULT_DISTANCE_THRESHOLD) {
        this.distanceThreshold = distanceThreshold;
    }

    /**
     * Calculate Levenshtein distance between two strings
     * Uses optimized space complexity O(min(n,m))
     */
    private levenshteinDistance(a: string, b: string): number {
        if (a.length === 0) return b.length;
        if (b.length === 0) return a.length;

        // Ensure a is the shorter string for space optimization
        if (a.length > b.length) {
            [a, b] = [b, a];
        }

        const aLen = a.length;
        const bLen = b.length;

        // Previous and current row of distances
        let prevRow = new Array(aLen + 1);
        let currRow = new Array(aLen + 1);

        // Initialize first row
        for (let i = 0; i <= aLen; i++) {
            prevRow[i] = i;
        }

        for (let j = 1; j <= bLen; j++) {
            currRow[0] = j;

            for (let i = 1; i <= aLen; i++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                currRow[i] = Math.min(
                    currRow[i - 1] + 1,      // insertion
                    prevRow[i] + 1,           // deletion
                    prevRow[i - 1] + cost     // substitution
                );
            }

            // Swap rows
            [prevRow, currRow] = [currRow, prevRow];
        }

        return prevRow[aLen];
    }

    /**
     * Check if pattern matches target using combined fuzzy strategies:
     * 1. Try Levenshtein distance for typo tolerance
     * 2. Fall back to subsequence matching
     */
    matches(pattern: string, target: string): boolean {
        if (!pattern) return true;
        if (!target) return false;

        const patternLower = pattern.toLowerCase();
        const targetLower = target.toLowerCase();

        // Strategy 1: Levenshtein distance for typo matching
        // Check if pattern is similar to any substring of target
        if (this.matchesWithLevenshtein(patternLower, targetLower)) {
            return true;
        }

        // Strategy 2: Subsequence matching (original behavior)
        return this.matchesSubsequence(patternLower, targetLower);
    }

    /**
     * Check if pattern matches any substring of target within Levenshtein threshold
     */
    private matchesWithLevenshtein(pattern: string, target: string): boolean {
        // For very short patterns, require exact or near-exact match
        const maxDistance = Math.max(1, Math.floor(pattern.length * this.distanceThreshold));

        // If target is shorter than pattern minus max edits, can't match
        if (target.length < pattern.length - maxDistance) {
            return false;
        }

        // Check if the whole target is within distance
        if (this.levenshteinDistance(pattern, target) <= maxDistance) {
            return true;
        }

        // Check substrings of similar length to pattern
        const windowSize = pattern.length;
        const minWindow = Math.max(1, windowSize - maxDistance);
        const maxWindow = windowSize + maxDistance;

        for (let len = minWindow; len <= Math.min(maxWindow, target.length); len++) {
            for (let i = 0; i <= target.length - len; i++) {
                const substring = target.substring(i, i + len);
                if (this.levenshteinDistance(pattern, substring) <= maxDistance) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Check if pattern characters appear in order within target (subsequence)
     */
    private matchesSubsequence(pattern: string, target: string): boolean {
        let patternIndex = 0;
        let targetIndex = 0;

        while (patternIndex < pattern.length && targetIndex < target.length) {
            if (pattern[patternIndex] === target[targetIndex]) {
                patternIndex++;
            }
            targetIndex++;
        }

        return patternIndex === pattern.length;
    }

    /**
     * Find positions of fuzzy-matched characters for highlighting
     * Prioritizes Levenshtein matches, falls back to subsequence positions
     */
    getMatchPositions(pattern: string, target: string): [number, number][] {
        if (!pattern || !target) return [];

        const patternLower = pattern.toLowerCase();
        const targetLower = target.toLowerCase();

        // Try to find Levenshtein match positions first
        const levenshteinPositions = this.getLevenshteinMatchPositions(patternLower, targetLower);
        if (levenshteinPositions.length > 0) {
            return levenshteinPositions;
        }

        // Fall back to subsequence matching positions
        return this.getSubsequenceMatchPositions(patternLower, targetLower);
    }

    /**
     * Find the best substring match using Levenshtein distance and return its position
     */
    private getLevenshteinMatchPositions(pattern: string, target: string): [number, number][] {
        const maxDistance = Math.max(1, Math.floor(pattern.length * this.distanceThreshold));

        // Check if the whole target is a close match
        if (this.levenshteinDistance(pattern, target) <= maxDistance) {
            return [[0, target.length]];
        }

        // Find best matching substring
        let bestStart = -1;
        let bestEnd = -1;
        let bestDistance = maxDistance + 1;

        const windowSize = pattern.length;
        const minWindow = Math.max(1, windowSize - maxDistance);
        const maxWindow = windowSize + maxDistance;

        for (let len = minWindow; len <= Math.min(maxWindow, target.length); len++) {
            for (let i = 0; i <= target.length - len; i++) {
                const substring = target.substring(i, i + len);
                const distance = this.levenshteinDistance(pattern, substring);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestStart = i;
                    bestEnd = i + len;
                }
            }
        }

        if (bestStart >= 0 && bestDistance <= maxDistance) {
            return [[bestStart, bestEnd]];
        }

        return [];
    }

    /**
     * Find positions of subsequence-matched characters for highlighting
     */
    private getSubsequenceMatchPositions(pattern: string, target: string): [number, number][] {
        const positions: [number, number][] = [];

        let patternIndex = 0;
        let targetIndex = 0;

        while (patternIndex < pattern.length && targetIndex < target.length) {
            if (pattern[patternIndex] === target[targetIndex]) {
                positions.push([targetIndex, targetIndex + 1]);
                patternIndex++;
            }
            targetIndex++;
        }

        // Only return positions if we matched the entire pattern
        if (patternIndex === pattern.length) {
            return this.mergeConsecutivePositions(positions);
        }

        return [];
    }

    /**
     * Merge consecutive positions for cleaner highlighting
     * Example: [[0,1], [1,2], [3,4]] -> [[0,2], [3,4]]
     */
    private mergeConsecutivePositions(positions: [number, number][]): [number, number][] {
        if (positions.length === 0) return [];

        const merged: [number, number][] = [];
        let current: [number, number] = [...positions[0]];

        for (let i = 1; i < positions.length; i++) {
            const next = positions[i];
            if (next[0] === current[1]) {
                // Consecutive - extend current
                current[1] = next[1];
            } else {
                // Not consecutive - save current and start new
                merged.push(current);
                current = [...next];
            }
        }

        merged.push(current);
        return merged;
    }
}

// Singleton instance for reuse
let instance: FuzzySearchStrategy | null = null;

export function getFuzzySearchStrategy(): FuzzySearchStrategy {
    if (!instance) {
        instance = new FuzzySearchStrategy();
    }
    return instance;
}
