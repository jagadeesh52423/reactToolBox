import { JSONValue, TypeStyle } from '../types';

// Determine the type of value for styling and type indicators
export const getValueType = (value: JSONValue): string => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    return typeof value;
};

// Get appropriate color and icon for value type
export const getTypeStyles = (value: JSONValue): TypeStyle => {
    const type = getValueType(value);
    switch(type) {
        case 'string': return { color: 'text-green-600 dark:text-green-400', icon: 'ABC' };
        case 'number': return { color: 'text-blue-600 dark:text-blue-400', icon: '123' };
        case 'boolean': return { color: 'text-purple-600 dark:text-purple-400', icon: '0/1' };
        case 'null': return { color: 'text-gray-600 dark:text-gray-400', icon: 'Ø' };
        case 'array': return { color: 'text-amber-600 dark:text-amber-400', icon: '[ ]' };
        case 'object': return { color: 'text-cyan-600 dark:text-cyan-400', icon: '{ }' };
        default: return { color: 'text-gray-600 dark:text-gray-400', icon: '?' };
    }
};

// Function to check if node has children
export const hasChildren = (node: JSONValue): boolean => {
    return typeof node === 'object' && node !== null && Object.keys(node).length > 0;
};

// Fuzzy search algorithm - checks if characters appear in order
export const fuzzyMatch = (search: string, target: string): boolean => {
    if (!search || !target) return !search;

    const searchLower = search.toLowerCase();
    const targetLower = target.toLowerCase();

    let searchIndex = 0;
    let targetIndex = 0;

    while (searchIndex < searchLower.length && targetIndex < targetLower.length) {
        if (searchLower[searchIndex] === targetLower[targetIndex]) {
            searchIndex++;
        }
        targetIndex++;
    }

    return searchIndex === searchLower.length;
};

// Enhanced search function that supports both regular and fuzzy search
export const matchesSearch = (searchText: string, target: string, isFuzzy: boolean): boolean => {
    if (!searchText) return true;
    if (!target) return false;

    if (isFuzzy) {
        return fuzzyMatch(searchText, target);
    } else {
        return target.toLowerCase().includes(searchText.toLowerCase());
    }
};
