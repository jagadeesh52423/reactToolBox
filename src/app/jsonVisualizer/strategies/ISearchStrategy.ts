/**
 * ISearchStrategy Interface
 *
 * Defines the contract for search algorithms.
 * Implements the Strategy Pattern - allows swapping search algorithms at runtime.
 *
 * Open/Closed Principle: New search algorithms can be added without modifying existing code.
 * Liskov Substitution: Any implementation can be used interchangeably.
 */

/**
 * Search strategy interface
 * Each implementation provides a different matching algorithm
 */
export interface ISearchStrategy {
    /**
     * Unique identifier for this strategy
     */
    readonly name: string;

    /**
     * Check if the search pattern matches the target string
     * @param pattern - The search pattern to look for
     * @param target - The string to search in
     * @returns true if the pattern matches the target
     */
    matches(pattern: string, target: string): boolean;

    /**
     * Get match positions for highlighting
     * @param pattern - The search pattern
     * @param target - The string to search in
     * @returns Array of [start, end] positions of matches
     */
    getMatchPositions(pattern: string, target: string): [number, number][];
}

/**
 * Factory function type for creating search strategies
 */
export type SearchStrategyFactory = () => ISearchStrategy;
