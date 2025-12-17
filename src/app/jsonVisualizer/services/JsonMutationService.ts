/**
 * JsonMutationService
 *
 * Handles all JSON mutation operations (update, delete, add).
 * Provides immutable operations - always returns new data structures.
 *
 * Responsibilities:
 * - Update values at specific paths
 * - Delete nodes at specific paths
 * - Add new keys/values
 * - Path navigation and validation
 */

import {
    JSONValue,
    JsonPath,
    MutationResult,
    MutationType
} from '../models/JsonModels';
import { getJsonParserService } from './JsonParserService';

export class JsonMutationService {
    private static instance: JsonMutationService | null = null;
    private parserService = getJsonParserService();

    private constructor() {}

    /**
     * Get singleton instance
     */
    static getInstance(): JsonMutationService {
        if (!JsonMutationService.instance) {
            JsonMutationService.instance = new JsonMutationService();
        }
        return JsonMutationService.instance;
    }

    /**
     * Update a value at the specified path
     * @param data - The original JSON data
     * @param path - Path to the value to update
     * @param newValue - The new value
     * @returns MutationResult with the updated data
     */
    update(data: JSONValue, path: JsonPath, newValue: JSONValue): MutationResult {
        if (path.length === 0) {
            return {
                success: false,
                data: null,
                error: 'Cannot update root - path is empty'
            };
        }

        try {
            // Deep clone to ensure immutability
            const cloned = this.parserService.deepClone(data);

            // Navigate to parent
            const parent = this.navigateToParent(cloned, path);
            if (parent === null) {
                return {
                    success: false,
                    data: null,
                    error: `Invalid path: ${path.join('.')}`
                };
            }

            // Update the value
            const lastKey = path[path.length - 1];
            if (typeof parent === 'object' && parent !== null) {
                (parent as Record<string, JSONValue>)[lastKey] = newValue;
            }

            return {
                success: true,
                data: cloned,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Update failed'
            };
        }
    }

    /**
     * Delete a node at the specified path
     * @param data - The original JSON data
     * @param path - Path to the node to delete
     * @returns MutationResult with the updated data
     */
    delete(data: JSONValue, path: JsonPath): MutationResult {
        if (path.length === 0) {
            return {
                success: false,
                data: null,
                error: 'Cannot delete root'
            };
        }

        try {
            // Deep clone to ensure immutability
            const cloned = this.parserService.deepClone(data);

            if (path.length === 1) {
                // Root level deletion
                return this.deleteFromRoot(cloned, path[0]);
            }

            // Navigate to parent
            const parent = this.navigateToParent(cloned, path);
            if (parent === null) {
                return {
                    success: false,
                    data: null,
                    error: `Invalid path: ${path.join('.')}`
                };
            }

            // Delete from parent
            const lastKey = path[path.length - 1];
            this.deleteFromObject(parent, lastKey);

            return {
                success: true,
                data: cloned,
                error: null
            };
        } catch (error) {
            return {
                success: false,
                data: null,
                error: error instanceof Error ? error.message : 'Delete failed'
            };
        }
    }

    /**
     * Delete from root level object/array
     */
    private deleteFromRoot(data: JSONValue, key: string): MutationResult {
        if (Array.isArray(data)) {
            const index = parseInt(key, 10);
            if (isNaN(index) || index < 0 || index >= data.length) {
                return {
                    success: false,
                    data: null,
                    error: `Invalid array index: ${key}`
                };
            }
            data.splice(index, 1);
        } else if (typeof data === 'object' && data !== null) {
            delete (data as Record<string, JSONValue>)[key];
        } else {
            return {
                success: false,
                data: null,
                error: 'Cannot delete from primitive value'
            };
        }

        return {
            success: true,
            data,
            error: null
        };
    }

    /**
     * Delete a key from an object or index from an array
     */
    private deleteFromObject(obj: JSONValue, key: string): void {
        if (Array.isArray(obj)) {
            const index = parseInt(key, 10);
            if (!isNaN(index) && index >= 0 && index < obj.length) {
                obj.splice(index, 1);
            }
        } else if (typeof obj === 'object' && obj !== null) {
            delete (obj as Record<string, JSONValue>)[key];
        }
    }

    /**
     * Navigate to the parent of the target path
     * @param data - The JSON data
     * @param path - The full path
     * @returns The parent object/array or null if invalid
     */
    private navigateToParent(data: JSONValue, path: JsonPath): JSONValue | null {
        if (path.length === 0) return null;

        let current: JSONValue = data;

        // Navigate to parent (all but last segment)
        for (let i = 0; i < path.length - 1; i++) {
            if (typeof current !== 'object' || current === null) {
                return null;
            }

            const key = path[i];
            if (Array.isArray(current)) {
                const index = parseInt(key, 10);
                if (isNaN(index) || index < 0 || index >= current.length) {
                    return null;
                }
                current = current[index];
            } else {
                if (!(key in current)) {
                    return null;
                }
                current = (current as Record<string, JSONValue>)[key];
            }
        }

        return current;
    }

    /**
     * Get a value at the specified path
     * @param data - The JSON data
     * @param path - Path to the value
     * @returns The value at the path or undefined if not found
     */
    getValueAtPath(data: JSONValue, path: JsonPath): JSONValue | undefined {
        if (path.length === 0) return data;

        let current: JSONValue = data;

        for (const key of path) {
            if (typeof current !== 'object' || current === null) {
                return undefined;
            }

            if (Array.isArray(current)) {
                const index = parseInt(key, 10);
                if (isNaN(index) || index < 0 || index >= current.length) {
                    return undefined;
                }
                current = current[index];
            } else {
                if (!(key in current)) {
                    return undefined;
                }
                current = (current as Record<string, JSONValue>)[key];
            }
        }

        return current;
    }

    /**
     * Convert a path array to a string representation
     * @param path - The path array
     * @returns Dot-notation string (e.g., "user.address.city")
     */
    pathToString(path: JsonPath): string {
        return path.join('.');
    }

    /**
     * Parse a path string into an array
     * @param pathString - Dot-notation path string
     * @returns Path array
     */
    stringToPath(pathString: string): JsonPath {
        if (!pathString) return [];
        return pathString.split('.');
    }

    /**
     * Validate that a path exists in the data
     * @param data - The JSON data
     * @param path - The path to validate
     * @returns true if path exists
     */
    pathExists(data: JSONValue, path: JsonPath): boolean {
        return this.getValueAtPath(data, path) !== undefined;
    }
}

// Export singleton instance getter
export const getJsonMutationService = () => JsonMutationService.getInstance();
