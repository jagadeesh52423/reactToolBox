/**
 * Search Strategies Index
 *
 * Exports all search strategy implementations and a factory
 * for creating strategies based on configuration.
 */

export type { ISearchStrategy } from './ISearchStrategy';
export { ExactSearchStrategy, getExactSearchStrategy } from './ExactSearchStrategy';
export { FuzzySearchStrategy, getFuzzySearchStrategy } from './FuzzySearchStrategy';

import { ISearchStrategy } from './ISearchStrategy';
import { getExactSearchStrategy } from './ExactSearchStrategy';
import { getFuzzySearchStrategy } from './FuzzySearchStrategy';

/**
 * Factory function to get the appropriate search strategy
 * @param isFuzzy - Whether to use fuzzy search
 * @returns The appropriate search strategy instance
 */
export function getSearchStrategy(isFuzzy: boolean): ISearchStrategy {
    return isFuzzy ? getFuzzySearchStrategy() : getExactSearchStrategy();
}
