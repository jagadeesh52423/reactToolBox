/**
 * JsonSearchService
 *
 * Handles all search operations on JSON data.
 * Uses Strategy Pattern for different search algorithms (exact/fuzzy).
 *
 * Responsibilities:
 * - Search JSON tree for matching keys and values
 * - Support both exact and fuzzy search
 * - Filter by nesting level
 * - Provide match information for highlighting
 */

import { JSONValue, SearchOptions, SearchResult } from '../models/JsonModels';
import { ISearchStrategy, getSearchStrategy } from '../strategies';

export class JsonSearchService {
    private static instance: JsonSearchService | null = null;

    private constructor() {}

    /**
     * Get singleton instance
     */
    static getInstance(): JsonSearchService {
        if (!JsonSearchService.instance) {
            JsonSearchService.instance = new JsonSearchService();
        }
        return JsonSearchService.instance;
    }

    /**
     * Check if a string matches the search pattern
     * @param searchText - The search pattern
     * @param target - The string to search in
     * @param isFuzzy - Whether to use fuzzy matching
     * @param isCaseSensitive - Whether to use case-sensitive matching
     * @param isRegex - Whether to treat searchText as a regex pattern
     * @returns true if matches
     */
    matches(
        searchText: string,
        target: string,
        isFuzzy: boolean = false,
        isCaseSensitive: boolean = false,
        isRegex: boolean = false
    ): boolean {
        if (!searchText) return true;
        if (!target) return false;

        // Regex mode takes precedence
        if (isRegex) {
            try {
                const flags = isCaseSensitive ? 'g' : 'gi';
                const regex = new RegExp(searchText, flags);
                return regex.test(target);
            } catch {
                // Invalid regex, fall back to literal search
                return this.literalMatch(searchText, target, isCaseSensitive);
            }
        }

        // Fuzzy search (always case-insensitive for fuzzy)
        if (isFuzzy) {
            const strategy = getSearchStrategy(true);
            return strategy.matches(searchText, target);
        }

        // Exact search with case sensitivity option
        return this.literalMatch(searchText, target, isCaseSensitive);
    }

    /**
     * Literal substring match with case sensitivity option
     */
    private literalMatch(pattern: string, target: string, isCaseSensitive: boolean): boolean {
        if (isCaseSensitive) {
            return target.includes(pattern);
        }
        return target.toLowerCase().includes(pattern.toLowerCase());
    }

    /**
     * Get match positions for highlighting
     * @param searchText - The search pattern
     * @param target - The string to search in
     * @param isFuzzy - Whether to use fuzzy matching
     * @returns Array of [start, end] positions
     */
    getMatchPositions(searchText: string, target: string, isFuzzy: boolean = false): [number, number][] {
        if (!searchText || !target) return [];

        const strategy = getSearchStrategy(isFuzzy);
        return strategy.getMatchPositions(searchText, target);
    }

    /**
     * Search a JSON node and its descendants for matches
     * @param data - The JSON data to search
     * @param options - Search options
     * @returns SearchResult with match information
     */
    searchNode(data: JSONValue, options: SearchOptions): SearchResult {
        const { searchText, isFuzzyEnabled, isCaseSensitive, isRegexEnabled } = options;

        if (!searchText) {
            return {
                matches: false,
                hasMatchingDescendants: false,
                matchedKeys: [],
                matchedValues: []
            };
        }

        const matchedKeys: string[] = [];
        const matchedValues: string[] = [];

        // For primitives, check if value matches
        if (typeof data !== 'object' || data === null) {
            const valueStr = String(data);
            if (this.matches(searchText, valueStr, isFuzzyEnabled, isCaseSensitive, isRegexEnabled)) {
                matchedValues.push(valueStr);
            }
            return {
                matches: matchedValues.length > 0,
                hasMatchingDescendants: false,
                matchedKeys,
                matchedValues
            };
        }

        // For objects/arrays, check keys and direct values
        let hasMatchingDescendants = false;

        for (const [key, value] of Object.entries(data)) {
            // Check if key matches
            if (this.matches(searchText, key, isFuzzyEnabled, isCaseSensitive, isRegexEnabled)) {
                matchedKeys.push(key);
            }

            // Check if value matches (for primitives) or has matching descendants
            if (typeof value !== 'object' || value === null) {
                const valueStr = String(value);
                if (this.matches(searchText, valueStr, isFuzzyEnabled, isCaseSensitive, isRegexEnabled)) {
                    matchedValues.push(valueStr);
                }
            } else {
                // Recursively search nested objects/arrays
                const childResult = this.searchNode(value, options);
                if (childResult.matches || childResult.hasMatchingDescendants) {
                    hasMatchingDescendants = true;
                }
            }
        }

        const directMatches = matchedKeys.length > 0 || matchedValues.length > 0;

        return {
            matches: directMatches,
            hasMatchingDescendants,
            matchedKeys,
            matchedValues
        };
    }

    /**
     * Deep search - check if any part of the JSON tree contains a match
     * @param data - The JSON data to search
     * @param searchText - The text to search for
     * @param isFuzzy - Whether to use fuzzy matching
     * @param isCaseSensitive - Whether to use case-sensitive matching
     * @param isRegex - Whether to treat searchText as regex
     * @returns true if any match found
     */
    deepSearch(
        data: JSONValue,
        searchText: string,
        isFuzzy: boolean = false,
        isCaseSensitive: boolean = false,
        isRegex: boolean = false
    ): boolean {
        if (!searchText) return true;

        if (typeof data !== 'object' || data === null) {
            return this.matches(searchText, String(data), isFuzzy, isCaseSensitive, isRegex);
        }

        return Object.entries(data).some(([key, value]) => {
            // Check key
            if (this.matches(searchText, key, isFuzzy, isCaseSensitive, isRegex)) {
                return true;
            }

            // Check value or recurse
            if (typeof value === 'object' && value !== null) {
                return this.deepSearch(value, searchText, isFuzzy, isCaseSensitive, isRegex);
            } else {
                return this.matches(searchText, String(value), isFuzzy, isCaseSensitive, isRegex);
            }
        });
    }

    /**
     * Check if a node at a specific level should be highlighted
     * @param data - The JSON data
     * @param currentLevel - The current nesting level
     * @param options - Search options including optional level filter
     * @returns true if node should be highlighted
     */
    shouldHighlight(data: JSONValue, currentLevel: number, options: SearchOptions): boolean {
        const { searchText, searchLevel, isFuzzyEnabled, isCaseSensitive, isRegexEnabled } = options;

        if (!searchText) return false;

        // If level filter is specified and doesn't match, don't highlight
        if (searchLevel !== undefined && currentLevel !== searchLevel) {
            return false;
        }

        // Check if this node has direct matches (keys or primitive values)
        if (typeof data !== 'object' || data === null) {
            return this.matches(searchText, String(data), isFuzzyEnabled, isCaseSensitive, isRegexEnabled);
        }

        // For objects/arrays, check immediate keys and primitive values
        return Object.entries(data).some(([key, value]) => {
            const keyMatches = this.matches(searchText, key, isFuzzyEnabled, isCaseSensitive, isRegexEnabled);
            if (typeof value !== 'object' || value === null) {
                const valueMatches = this.matches(searchText, String(value), isFuzzyEnabled, isCaseSensitive, isRegexEnabled);
                return keyMatches || valueMatches;
            }
            return keyMatches;
        });
    }

    /**
     * Check if a node should be visible (not filtered out)
     * @param data - The JSON data
     * @param options - Search options
     * @returns true if node should be visible
     */
    shouldBeVisible(data: JSONValue, options: SearchOptions): boolean {
        const { searchText, isFilterEnabled, isFuzzyEnabled, isCaseSensitive, isRegexEnabled } = options;

        if (!searchText || !isFilterEnabled) {
            return true;
        }

        return this.deepSearch(data, searchText, isFuzzyEnabled, isCaseSensitive, isRegexEnabled);
    }

    /**
     * Check if a specific key-value pair should be visible
     * @param key - The key
     * @param value - The value
     * @param options - Search options
     * @returns true if the item should be visible
     */
    shouldItemBeVisible(key: string, value: JSONValue, options: SearchOptions): boolean {
        const { searchText, isFilterEnabled, isFuzzyEnabled, isCaseSensitive, isRegexEnabled } = options;

        if (!searchText || !isFilterEnabled) {
            return true;
        }

        // Check if key matches
        if (this.matches(searchText, key, isFuzzyEnabled, isCaseSensitive, isRegexEnabled)) {
            return true;
        }

        // Check if value matches or contains matches
        return this.deepSearch(value, searchText, isFuzzyEnabled, isCaseSensitive, isRegexEnabled);
    }
}

// Export singleton instance getter
export const getJsonSearchService = () => JsonSearchService.getInstance();
