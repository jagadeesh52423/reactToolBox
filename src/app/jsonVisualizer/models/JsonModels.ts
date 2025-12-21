/**
 * JSON Visualizer Models
 *
 * Contains all type definitions, interfaces, and enums for the JSON Visualizer tool.
 * Following Single Responsibility Principle - this file only handles data structures.
 */

// ============================================================================
// Core JSON Types
// ============================================================================

/**
 * Represents any valid JSON value
 */
export type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };

/**
 * Represents a JSON object specifically
 */
export type JSONObject = { [key: string]: JSONValue };

/**
 * Represents a JSON array specifically
 */
export type JSONArray = JSONValue[];

// ============================================================================
// Type System
// ============================================================================

/**
 * Enum for all possible JSON value types
 */
export enum JsonValueType {
    STRING = 'string',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    NULL = 'null',
    ARRAY = 'array',
    OBJECT = 'object',
    UNKNOWN = 'unknown'
}

/**
 * Styling information for a JSON value type
 */
export interface TypeStyle {
    type: JsonValueType;
    color: string;
    darkColor: string;
    icon: string;
    label: string;
}

/**
 * Map of type styles for each JSON value type
 */
export const TYPE_STYLES: Record<JsonValueType, TypeStyle> = {
    [JsonValueType.STRING]: {
        type: JsonValueType.STRING,
        color: 'text-green-600',
        darkColor: 'dark:text-green-400',
        icon: 'ABC',
        label: 'String'
    },
    [JsonValueType.NUMBER]: {
        type: JsonValueType.NUMBER,
        color: 'text-blue-600',
        darkColor: 'dark:text-blue-400',
        icon: '123',
        label: 'Number'
    },
    [JsonValueType.BOOLEAN]: {
        type: JsonValueType.BOOLEAN,
        color: 'text-purple-600',
        darkColor: 'dark:text-purple-400',
        icon: '0/1',
        label: 'Boolean'
    },
    [JsonValueType.NULL]: {
        type: JsonValueType.NULL,
        color: 'text-gray-600',
        darkColor: 'dark:text-gray-400',
        icon: 'Ø',
        label: 'Null'
    },
    [JsonValueType.ARRAY]: {
        type: JsonValueType.ARRAY,
        color: 'text-amber-600',
        darkColor: 'dark:text-amber-400',
        icon: '[ ]',
        label: 'Array'
    },
    [JsonValueType.OBJECT]: {
        type: JsonValueType.OBJECT,
        color: 'text-cyan-600',
        darkColor: 'dark:text-cyan-400',
        icon: '{ }',
        label: 'Object'
    },
    [JsonValueType.UNKNOWN]: {
        type: JsonValueType.UNKNOWN,
        color: 'text-gray-600',
        darkColor: 'dark:text-gray-400',
        icon: '?',
        label: 'Unknown'
    }
};

// ============================================================================
// Search Types
// ============================================================================

/**
 * Search mode options
 */
export enum SearchMode {
    EXACT = 'exact',
    FUZZY = 'fuzzy'
}

/**
 * Search configuration options
 */
export interface SearchOptions {
    searchText: string;
    searchLevel?: number;
    isFilterEnabled: boolean;
    isFuzzyEnabled: boolean;
    isCaseSensitive: boolean;
    isRegexEnabled: boolean;
    isKeysOnly: boolean;
}

/**
 * Result of a search operation on a node
 */
export interface SearchResult {
    matches: boolean;
    hasMatchingDescendants: boolean;
    matchedKeys: string[];
    matchedValues: string[];
}

// ============================================================================
// Tree Node Types
// ============================================================================

/**
 * Represents a node's expansion state
 */
export interface NodeState {
    isExpanded: boolean;
    isHighlighted: boolean;
    isFiltered: boolean;
}

/**
 * Path in the JSON tree
 */
export type JsonPath = string[];

/**
 * Represents a node in the JSON tree with metadata
 */
export interface JsonNode {
    value: JSONValue;
    path: JsonPath;
    level: number;
    key: string;
    type: JsonValueType;
    hasChildren: boolean;
    childCount: number;
}

// ============================================================================
// Parser Types
// ============================================================================

/**
 * Result of parsing JSON input
 */
export interface ParseResult {
    success: boolean;
    data: JSONValue | null;
    error: string | null;
}

/**
 * Prettify options for JSON formatting
 */
export interface PrettifyOptions {
    indentSpaces: number;
}

/**
 * Available indent levels
 */
export const INDENT_LEVELS = [2, 4, 6, 8] as const;
export type IndentLevel = typeof INDENT_LEVELS[number];

// ============================================================================
// Mutation Types
// ============================================================================

/**
 * Types of mutations that can be performed on JSON
 */
export enum MutationType {
    UPDATE = 'update',
    DELETE = 'delete',
    ADD = 'add'
}

/**
 * Mutation operation descriptor
 */
export interface MutationOperation {
    type: MutationType;
    path: JsonPath;
    value?: JSONValue;
    key?: string;
}

/**
 * Result of a mutation operation
 */
export interface MutationResult {
    success: boolean;
    data: JSONValue | null;
    error: string | null;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for the main JSON visualizer component
 */
export interface JsonVisualizerProps {
    initialJson?: string;
}

/**
 * Props for the JSON input panel
 */
export interface JsonInputPanelProps {
    jsonInput: string;
    error: string | null;
    onJsonChange: (value: string) => void;
    onPrettify: (indent: IndentLevel) => void;
    onCopy: () => void;
    onFileUpload: (file: File) => void;
    onDownload: () => void;
}

/**
 * Props for the JSON viewer panel
 */
export interface JsonViewerPanelProps {
    parsedJson: JSONValue | null;
    error: string | null;
    searchOptions: SearchOptions;
    onSearchChange: (options: Partial<SearchOptions>) => void;
    onExpandAll: () => void;
    onCollapseAll: () => void;
    onDelete: (path: JsonPath) => void;
    onUpdate: (path: JsonPath, value: JSONValue) => void;
}

/**
 * Props for the tree view component
 */
export interface JsonTreeViewProps {
    data: JSONValue;
    level?: number;
    path?: JsonPath;
    searchOptions: SearchOptions;
    onDelete: (path: JsonPath) => void;
    onUpdate: (path: JsonPath, value: JSONValue) => void;
}

/**
 * Ref interface for tree view imperative handles
 */
export interface JsonTreeViewRef {
    expandAll: () => Promise<void>;
    collapseAll: () => Promise<void>;
    search: (options: SearchOptions) => void;
    toggle: () => void;
}

/**
 * Props for primitive value editor
 */
export interface JsonPrimitiveEditorProps {
    value: JSONValue;
    isHighlighted: boolean;
    onUpdate: (value: JSONValue) => void;
}

/**
 * Props for search controls
 */
export interface SearchControlsProps {
    searchOptions: SearchOptions;
    onSearchChange: (options: Partial<SearchOptions>) => void;
    onSearch: () => void;
}

// ============================================================================
// Sample Data
// ============================================================================

/**
 * Sample JSON for initial display
 */
export const SAMPLE_JSON = `{
  "name": "JSON Visualizer",
  "version": "1.0.0",
  "features": ["Expand/Collapse", "Search", "Edit", "Delete"],
  "isAwesome": true,
  "author": {
    "name": "You",
    "role": "Developer"
  },
  "examples": [
    {"type": "string", "value": "text"},
    {"type": "number", "value": 42},
    {"type": "boolean", "value": true},
    {"type": "null", "value": null}
  ]
}`;

// ============================================================================
// Toast/Notification Types
// ============================================================================

/**
 * Toast notification types
 */
export enum ToastType {
    SUCCESS = 'success',
    ERROR = 'error',
    INFO = 'info',
    WARNING = 'warning'
}

/**
 * Toast notification configuration
 */
export interface ToastConfig {
    type: ToastType;
    message: string;
    duration?: number;
}
