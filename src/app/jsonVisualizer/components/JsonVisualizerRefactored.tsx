'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useJsonVisualizer } from '../hooks/useJsonVisualizer';
import JsonInputPanel from './JsonInputPanel';
import JsonViewerPanel from './JsonViewerPanel';
import ToastNotification from './ToastNotification';

/**
 * JsonVisualizerRefactored Component
 *
 * Main orchestrator component for the JSON Visualizer tool.
 * Uses useJsonVisualizer hook for all state management.
 *
 * Architecture:
 * - models/ - Type definitions (JSONValue, SearchOptions, etc.)
 * - strategies/ - Search algorithms (exact, fuzzy)
 * - services/ - Business logic (parser, search, mutations)
 * - hooks/ - React state management (useJsonVisualizer)
 * - components/ - UI components (this and children)
 */
export default function JsonVisualizerRefactored() {
    const {
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
        togglePrettifyOptions,

        // Copy/Download
        handleCopy,
        handleDownload,

        // Search Handlers
        handleSearchTextChange,
        handleSearchLevelChange,
        handleFilterToggle,
        handleFuzzyToggle,
        handleSearch,

        // Tree Handlers
        handleExpandAll,
        handleCollapseAll,
        handleDelete,
        handleUpdate,

        // Toast
        clearToast
    } = useJsonVisualizer();

    return (
        <div className="min-h-screen p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        JSON Visualizer
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        View, edit, and explore JSON data
                    </p>
                </div>
                <Link
                    href="/"
                    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                >
                    <Image
                        className="dark:invert"
                        src="/vercel.svg"
                        alt="Vercel logomark"
                        width={20}
                        height={20}
                    />
                    Home
                </Link>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Panel - Input */}
                <JsonInputPanel
                    jsonInput={jsonInput}
                    error={error}
                    indentLevel={indentLevel}
                    showPrettifyOptions={showPrettifyOptions}
                    onJsonChange={handleJsonChange}
                    onPrettify={handlePrettify}
                    onTogglePrettify={togglePrettifyOptions}
                    onCopy={handleCopy}
                    onFileUpload={handleFileUpload}
                    onDownload={handleDownload}
                />

                {/* Right Panel - Viewer */}
                <JsonViewerPanel
                    ref={treeViewRef}
                    parsedJson={parsedJson}
                    error={error}
                    searchOptions={searchOptions}
                    onSearchTextChange={handleSearchTextChange}
                    onSearchLevelChange={handleSearchLevelChange}
                    onFilterToggle={handleFilterToggle}
                    onFuzzyToggle={handleFuzzyToggle}
                    onSearch={handleSearch}
                    onExpandAll={handleExpandAll}
                    onCollapseAll={handleCollapseAll}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                />
            </div>

            {/* Toast Notification */}
            <ToastNotification toast={toast} onClose={clearToast} />
        </div>
    );
}
