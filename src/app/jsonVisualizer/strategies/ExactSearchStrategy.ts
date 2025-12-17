/**
 * ExactSearchStrategy
 *
 * Implements exact (substring) matching for search.
 * Case-insensitive by default.
 *
 * Time Complexity: O(n*m) where n is target length, m is pattern length
 * Space Complexity: O(1)
 */

import { ISearchStrategy } from './ISearchStrategy';

export class ExactSearchStrategy implements ISearchStrategy {
    readonly name = 'exact';

    /**
     * Check if pattern exists as a substring in target (case-insensitive)
     */
    matches(pattern: string, target: string): boolean {
        if (!pattern) return true;
        if (!target) return false;

        return target.toLowerCase().includes(pattern.toLowerCase());
    }

    /**
     * Find all positions where pattern matches in target
     */
    getMatchPositions(pattern: string, target: string): [number, number][] {
        if (!pattern || !target) return [];

        const positions: [number, number][] = [];
        const patternLower = pattern.toLowerCase();
        const targetLower = target.toLowerCase();
        const patternLength = pattern.length;

        let startIndex = 0;
        while (startIndex < target.length) {
            const foundIndex = targetLower.indexOf(patternLower, startIndex);
            if (foundIndex === -1) break;

            positions.push([foundIndex, foundIndex + patternLength]);
            startIndex = foundIndex + 1; // Allow overlapping matches
        }

        return positions;
    }
}

// Singleton instance for reuse
let instance: ExactSearchStrategy | null = null;

export function getExactSearchStrategy(): ExactSearchStrategy {
    if (!instance) {
        instance = new ExactSearchStrategy();
    }
    return instance;
}
