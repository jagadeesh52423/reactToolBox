/**
 * useJsonVisualizer Hook
 *
 * Custom hook that manages all state and business logic for the JSON Visualizer.
 * Follows the Custom Hook Pattern - encapsulates all React state and side effects.
 *
 * Responsibilities:
 * - Manage JSON input/output state
 * - Handle parsing and validation
 * - Manage search state and debouncing
 * - Handle tree view state (expand/collapse)
 * - Provide mutation handlers (update/delete)
 * - Toast notification management
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
    JSONValue,
    JsonPath,
    SearchOptions,
    IndentLevel,
    ToastConfig,
    ToastType,
    SAMPLE_JSON,
    JsonTreeViewRef
} from '../models/JsonModels';
import { getJsonParserService } from '../services/JsonParserService';
import { getJsonMutationService } from '../services/JsonMutationService';

/**
 * Return type for the useJsonVisualizer hook
 */
export interface UseJsonVisualizerReturn {
    // JSON Input/Output State
    jsonInput: string;
    parsedJson: JSONValue | null;
    error: string | null;

    // Search State
    searchOptions: SearchOptions;

    // Prettify State
    indentLevel: IndentLevel;
    showPrettifyOptions: boolean;

    // Toast State
    toast: ToastConfig | null;

    // Tree View Ref
    treeViewRef: React.RefObject<JsonTreeViewRef | null>;

    // Input Handlers
    handleJsonChange: (value: string) => void;
    handleFileUpload: (file: File) => void;

    // Prettify Handlers
    handlePrettify: (indent?: IndentLevel) => void;
    setIndentLevel: (level: IndentLevel) => void;
    togglePrettifyOptions: () => void;

    // Copy/Download Handlers
    handleCopy: () => void;
    handleDownload: () => void;

    // Search Handlers
    handleSearchTextChange: (text: string) => void;
    handleSearchLevelChange: (level: string) => void;
    handleFilterToggle: (enabled: boolean) => void;
    handleFuzzyToggle: (enabled: boolean) => void;
    handleCaseSensitiveToggle: (enabled: boolean) => void;
    handleRegexToggle: (enabled: boolean) => void;
    handleSearch: () => void;

    // Tree Handlers
    handleExpandAll: () => void;
    handleCollapseAll: () => void;
    handleDelete: (path: JsonPath) => void;
    handleUpdate: (path: JsonPath, value: JSONValue) => void;

    // Toast Handler
    showToast: (config: ToastConfig) => void;
    clearToast: () => void;
}

/**
 * Options for the useJsonVisualizer hook
 */
export interface UseJsonVisualizerOptions {
    initialJson?: string;
    debounceMs?: number;
}

/**
 * Main hook for JSON Visualizer functionality
 */
export function useJsonVisualizer(options: UseJsonVisualizerOptions = {}): UseJsonVisualizerReturn {
    const { initialJson = SAMPLE_JSON, debounceMs = 300 } = options;

    // Services
    const parserService = useMemo(() => getJsonParserService(), []);
    const mutationService = useMemo(() => getJsonMutationService(), []);

    // JSON State
    const [jsonInput, setJsonInput] = useState<string>('');
    const [parsedJson, setParsedJson] = useState<JSONValue | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Search State
    const [searchOptions, setSearchOptions] = useState<SearchOptions>({
        searchText: '',
        searchLevel: undefined,
        isFilterEnabled: false,
        isFuzzyEnabled: false,
        isCaseSensitive: false,
        isRegexEnabled: false
    });

    // Prettify State
    const [indentLevel, setIndentLevel] = useState<IndentLevel>(2);
    const [showPrettifyOptions, setShowPrettifyOptions] = useState(false);

    // Toast State
    const [toast, setToast] = useState<ToastConfig | null>(null);

    // Refs
    const treeViewRef = useRef<JsonTreeViewRef>(null);
    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize with sample JSON
    useEffect(() => {
        handleJsonChange(initialJson);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
            if (toastTimeoutRef.current) {
                clearTimeout(toastTimeoutRef.current);
            }
        };
    }, []);

    // ========================================================================
    // Toast Handlers
    // ========================================================================

    const showToast = useCallback((config: ToastConfig) => {
        // Clear any existing toast timeout
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }

        setToast(config);

        // Auto-hide toast after duration
        const duration = config.duration ?? 3000;
        toastTimeoutRef.current = setTimeout(() => {
            setToast(null);
        }, duration);
    }, []);

    const clearToast = useCallback(() => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
        setToast(null);
    }, []);

    // ========================================================================
    // JSON Input Handlers
    // ========================================================================

    const handleJsonChange = useCallback((value: string) => {
        setJsonInput(value);

        const result = parserService.parse(value);
        if (result.success) {
            setParsedJson(result.data);
            setError(null);
        } else {
            setParsedJson(null);
            setError(result.error);
        }
    }, [parserService]);

    const handleFileUpload = useCallback((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            handleJsonChange(content);
            showToast({
                type: ToastType.SUCCESS,
                message: `Loaded ${file.name}`
            });
        };
        reader.onerror = () => {
            showToast({
                type: ToastType.ERROR,
                message: 'Failed to read file'
            });
        };
        reader.readAsText(file);
    }, [handleJsonChange, showToast]);

    // ========================================================================
    // Prettify Handlers
    // ========================================================================

    const handlePrettify = useCallback((indent?: IndentLevel) => {
        const indentToUse = indent ?? indentLevel;
        const prettified = parserService.prettify(jsonInput, indentToUse);
        setJsonInput(prettified);
        setShowPrettifyOptions(false);

        // Re-parse to update the tree
        const result = parserService.parse(prettified);
        if (result.success) {
            setParsedJson(result.data);
            setError(null);
        }
    }, [jsonInput, indentLevel, parserService]);

    const togglePrettifyOptions = useCallback(() => {
        setShowPrettifyOptions(prev => !prev);
    }, []);

    // ========================================================================
    // Copy/Download Handlers
    // ========================================================================

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(jsonInput).then(() => {
            showToast({
                type: ToastType.SUCCESS,
                message: 'Copied to clipboard'
            });
        }).catch(() => {
            showToast({
                type: ToastType.ERROR,
                message: 'Failed to copy'
            });
        });
    }, [jsonInput, showToast]);

    const handleDownload = useCallback(() => {
        if (!jsonInput) {
            showToast({
                type: ToastType.WARNING,
                message: 'No JSON to download'
            });
            return;
        }

        const blob = new Blob([jsonInput], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast({
            type: ToastType.SUCCESS,
            message: 'Downloaded data.json'
        });
    }, [jsonInput, showToast]);

    // ========================================================================
    // Search Handlers
    // ========================================================================

    const performSearch = useCallback(() => {
        if (treeViewRef.current) {
            treeViewRef.current.search(searchOptions);
        }
    }, [searchOptions]);

    const handleSearchTextChange = useCallback((text: string) => {
        setSearchOptions(prev => ({ ...prev, searchText: text }));

        // Debounce search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        if (text.trim()) {
            searchTimeoutRef.current = setTimeout(() => {
                if (treeViewRef.current) {
                    treeViewRef.current.search({
                        ...searchOptions,
                        searchText: text
                    });
                }
            }, debounceMs);
        } else {
            // Clear search immediately when empty
            if (treeViewRef.current) {
                treeViewRef.current.search({
                    ...searchOptions,
                    searchText: ''
                });
            }
        }
    }, [searchOptions, debounceMs]);

    const handleSearchLevelChange = useCallback((level: string) => {
        const levelNum = level ? parseInt(level, 10) : undefined;
        setSearchOptions(prev => ({ ...prev, searchLevel: levelNum }));
    }, []);

    const handleFilterToggle = useCallback((enabled: boolean) => {
        const newOptions = { ...searchOptions, isFilterEnabled: enabled };
        setSearchOptions(newOptions);

        // Re-trigger search with new options
        if (searchOptions.searchText.trim() && treeViewRef.current) {
            treeViewRef.current.search(newOptions);
        }
    }, [searchOptions]);

    const handleFuzzyToggle = useCallback((enabled: boolean) => {
        const newOptions = { ...searchOptions, isFuzzyEnabled: enabled };
        setSearchOptions(newOptions);

        // Re-trigger search with new options
        if (searchOptions.searchText.trim() && treeViewRef.current) {
            treeViewRef.current.search(newOptions);
        }
    }, [searchOptions]);

    const handleCaseSensitiveToggle = useCallback((enabled: boolean) => {
        const newOptions = { ...searchOptions, isCaseSensitive: enabled };
        setSearchOptions(newOptions);

        // Re-trigger search with new options
        if (searchOptions.searchText.trim() && treeViewRef.current) {
            treeViewRef.current.search(newOptions);
        }
    }, [searchOptions]);

    const handleRegexToggle = useCallback((enabled: boolean) => {
        const newOptions = { ...searchOptions, isRegexEnabled: enabled };
        setSearchOptions(newOptions);

        // Re-trigger search with new options
        if (searchOptions.searchText.trim() && treeViewRef.current) {
            treeViewRef.current.search(newOptions);
        }
    }, [searchOptions]);

    const handleSearch = useCallback(() => {
        performSearch();
    }, [performSearch]);

    // ========================================================================
    // Tree Handlers
    // ========================================================================

    const handleExpandAll = useCallback(() => {
        if (treeViewRef.current) {
            treeViewRef.current.expandAll();
        }
    }, []);

    const handleCollapseAll = useCallback(() => {
        if (treeViewRef.current) {
            treeViewRef.current.collapseAll();
        }
    }, []);

    const handleDelete = useCallback((path: JsonPath) => {
        if (!parsedJson) return;

        // Use toast-based confirmation instead of confirm()
        const result = mutationService.delete(parsedJson, path);

        if (result.success && result.data !== null) {
            setParsedJson(result.data);
            setJsonInput(parserService.stringify(result.data, indentLevel));
            showToast({
                type: ToastType.SUCCESS,
                message: `Deleted ${path[path.length - 1]}`
            });
        } else {
            showToast({
                type: ToastType.ERROR,
                message: result.error || 'Delete failed'
            });
        }
    }, [parsedJson, mutationService, parserService, indentLevel, showToast]);

    const handleUpdate = useCallback((path: JsonPath, value: JSONValue) => {
        if (!parsedJson) return;

        const result = mutationService.update(parsedJson, path, value);

        if (result.success && result.data !== null) {
            setParsedJson(result.data);
            setJsonInput(parserService.stringify(result.data, indentLevel));
            showToast({
                type: ToastType.SUCCESS,
                message: 'Value updated'
            });
        } else {
            showToast({
                type: ToastType.ERROR,
                message: result.error || 'Update failed'
            });
        }
    }, [parsedJson, mutationService, parserService, indentLevel, showToast]);

    // ========================================================================
    // Return
    // ========================================================================

    return {
        // State
        jsonInput,
        parsedJson,
        error,
        searchOptions,
        indentLevel,
        showPrettifyOptions,
        toast,
        treeViewRef,

        // Input Handlers
        handleJsonChange,
        handleFileUpload,

        // Prettify Handlers
        handlePrettify,
        setIndentLevel,
        togglePrettifyOptions,

        // Copy/Download
        handleCopy,
        handleDownload,

        // Search Handlers
        handleSearchTextChange,
        handleSearchLevelChange,
        handleFilterToggle,
        handleFuzzyToggle,
        handleCaseSensitiveToggle,
        handleRegexToggle,
        handleSearch,

        // Tree Handlers
        handleExpandAll,
        handleCollapseAll,
        handleDelete,
        handleUpdate,

        // Toast
        showToast,
        clearToast
    };
}
