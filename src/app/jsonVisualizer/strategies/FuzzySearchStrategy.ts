/**
 * FuzzySearchStrategy
 *
 * Implements fuzzy matching for search.
 * Characters must appear in order but not necessarily consecutively.
 * Example: "apl" matches "apple", "application", "a_p_l"
 *
 * Time Complexity: O(n) where n is target length
 * Space Complexity: O(1) for matching, O(k) for positions where k is pattern length
 */

import { ISearchStrategy } from './ISearchStrategy';

export class FuzzySearchStrategy implements ISearchStrategy {
    readonly name = 'fuzzy';

    /**
     * Check if pattern characters appear in order within target
     * Case-insensitive matching
     */
    matches(pattern: string, target: string): boolean {
        if (!pattern) return true;
        if (!target) return false;

        const patternLower = pattern.toLowerCase();
        const targetLower = target.toLowerCase();

        let patternIndex = 0;
        let targetIndex = 0;

        while (patternIndex < patternLower.length && targetIndex < targetLower.length) {
            if (patternLower[patternIndex] === targetLower[targetIndex]) {
                patternIndex++;
            }
            targetIndex++;
        }

        return patternIndex === patternLower.length;
    }

    /**
     * Find positions of fuzzy-matched characters for highlighting
     * Returns positions where each pattern character was matched
     */
    getMatchPositions(pattern: string, target: string): [number, number][] {
        if (!pattern || !target) return [];

        const positions: [number, number][] = [];
        const patternLower = pattern.toLowerCase();
        const targetLower = target.toLowerCase();

        let patternIndex = 0;
        let targetIndex = 0;

        while (patternIndex < patternLower.length && targetIndex < targetLower.length) {
            if (patternLower[patternIndex] === targetLower[targetIndex]) {
                positions.push([targetIndex, targetIndex + 1]);
                patternIndex++;
            }
            targetIndex++;
        }

        // Only return positions if we matched the entire pattern
        if (patternIndex === patternLower.length) {
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
