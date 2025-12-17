/**
 * JsonParserService
 *
 * Handles all JSON parsing, validation, and formatting operations.
 * Implements Singleton Pattern for consistent behavior across the application.
 *
 * Responsibilities:
 * - Parse JSON strings into JavaScript objects
 * - Validate JSON syntax
 * - Format/prettify JSON with configurable indentation
 * - Determine value types
 */

import {
    JSONValue,
    JsonValueType,
    ParseResult,
    TypeStyle,
    TYPE_STYLES,
    IndentLevel
} from '../models/JsonModels';

export class JsonParserService {
    private static instance: JsonParserService | null = null;

    private constructor() {}

    /**
     * Get singleton instance
     */
    static getInstance(): JsonParserService {
        if (!JsonParserService.instance) {
            JsonParserService.instance = new JsonParserService();
        }
        return JsonParserService.instance;
    }

    /**
     * Parse a JSON string into a JavaScript value
     * @param jsonString - The JSON string to parse
     * @returns ParseResult with success status and data or error
     */
    parse(jsonString: string): ParseResult {
        if (!jsonString || !jsonString.trim()) {
            return {
                success: true,
                data: null,
                error: null
            };
        }

        try {
            const data = JSON.parse(jsonString);
            return {
                success: true,
                data,
                error: null
            };
        } catch (error) {
            const errorMessage = error instanceof Error
                ? this.formatParseError(error.message, jsonString)
                : 'Invalid JSON format';

            return {
                success: false,
                data: null,
                error: errorMessage
            };
        }
    }

    /**
     * Format a parse error message for better readability
     */
    private formatParseError(message: string, jsonString: string): string {
        // Extract position from error message if available
        const positionMatch = message.match(/position (\d+)/);
        if (positionMatch) {
            const position = parseInt(positionMatch[1], 10);
            const context = this.getErrorContext(jsonString, position);
            return `${message}\nNear: "${context}"`;
        }
        return message;
    }

    /**
     * Get context around an error position
     */
    private getErrorContext(jsonString: string, position: number): string {
        const start = Math.max(0, position - 20);
        const end = Math.min(jsonString.length, position + 20);
        const context = jsonString.substring(start, end);
        return start > 0 ? `...${context}` : context;
    }

    /**
     * Format JSON with specified indentation
     * @param value - The JSON value to format
     * @param indent - Number of spaces for indentation
     * @returns Formatted JSON string
     */
    stringify(value: JSONValue, indent: IndentLevel = 2): string {
        return JSON.stringify(value, null, indent);
    }

    /**
     * Prettify a JSON string with specified indentation
     * @param jsonString - The JSON string to prettify
     * @param indent - Number of spaces for indentation
     * @returns Prettified JSON string or original if invalid
     */
    prettify(jsonString: string, indent: IndentLevel = 2): string {
        const result = this.parse(jsonString);
        if (result.success && result.data !== null) {
            return this.stringify(result.data, indent);
        }
        return jsonString;
    }

    /**
     * Minify JSON by removing whitespace
     * @param jsonString - The JSON string to minify
     * @returns Minified JSON string
     */
    minify(jsonString: string): string {
        const result = this.parse(jsonString);
        if (result.success && result.data !== null) {
            return JSON.stringify(result.data);
        }
        return jsonString;
    }

    /**
     * Determine the type of a JSON value
     * @param value - The value to check
     * @returns The JsonValueType
     */
    getValueType(value: JSONValue): JsonValueType {
        if (value === null) return JsonValueType.NULL;
        if (Array.isArray(value)) return JsonValueType.ARRAY;

        switch (typeof value) {
            case 'string':
                return JsonValueType.STRING;
            case 'number':
                return JsonValueType.NUMBER;
            case 'boolean':
                return JsonValueType.BOOLEAN;
            case 'object':
                return JsonValueType.OBJECT;
            default:
                return JsonValueType.UNKNOWN;
        }
    }

    /**
     * Get type styling information for a value
     * @param value - The JSON value
     * @returns TypeStyle with colors and icon
     */
    getTypeStyle(value: JSONValue): TypeStyle {
        const type = this.getValueType(value);
        return TYPE_STYLES[type];
    }

    /**
     * Check if a value has children (is an object or array with items)
     * @param value - The JSON value to check
     * @returns true if value has children
     */
    hasChildren(value: JSONValue): boolean {
        if (typeof value !== 'object' || value === null) {
            return false;
        }
        return Object.keys(value).length > 0;
    }

    /**
     * Get the number of direct children in an object or array
     * @param value - The JSON value
     * @returns Number of children, 0 for primitives
     */
    getChildCount(value: JSONValue): number {
        if (typeof value !== 'object' || value === null) {
            return 0;
        }
        return Object.keys(value).length;
    }

    /**
     * Check if a value is a primitive (string, number, boolean, null)
     * @param value - The JSON value
     * @returns true if value is primitive
     */
    isPrimitive(value: JSONValue): boolean {
        return typeof value !== 'object' || value === null;
    }

    /**
     * Deep clone a JSON value
     * @param value - The value to clone
     * @returns A deep copy of the value
     */
    deepClone<T extends JSONValue>(value: T): T {
        return JSON.parse(JSON.stringify(value));
    }

    /**
     * Validate that a string is valid JSON
     * @param jsonString - The string to validate
     * @returns true if valid JSON
     */
    isValid(jsonString: string): boolean {
        return this.parse(jsonString).success;
    }
}

// Export singleton instance getter
export const getJsonParserService = () => JsonParserService.getInstance();
