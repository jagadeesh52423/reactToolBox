'use client';

import Link from 'next/link';
import { useJsonVisualizer } from '../hooks/useJsonVisualizer';
import JsonInputPanel from './JsonInputPanel';
import JsonViewerPanel from './JsonViewerPanel';
import ToastNotification from './ToastNotification';
import StatusBar from './StatusBar';
import { HomeIcon, BracesIcon } from './Icons';

/**
 * JsonVisualizerRefactored Component - Professional Redesign
 *
 * Main orchestrator component for the JSON Visualizer tool.
 * Features:
 * - Theme-aware design (light/dark)
 * - Status bar with JSON statistics
 * - Professional header with branding
 * - Responsive two-panel layout
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                <div className="max-w-[1800px] mx-auto flex items-center justify-between">
                    {/* Logo & Title */}
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <BracesIcon size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                JSON Visualizer
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-slate-400">
                                View, edit, and explore JSON data
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100/50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-slate-700/50 transition-all duration-200"
                    >
                        <HomeIcon size={18} />
                        <span className="text-sm font-medium">Home</span>
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-hidden">
                <div className="max-w-[1800px] mx-auto h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
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
                </div>
            </main>

            {/* Status Bar */}
            <StatusBar
                jsonInput={jsonInput}
                parsedJson={parsedJson}
                error={error}
            />

            {/* Toast Notification */}
            <ToastNotification toast={toast} onClose={clearToast} />
        </div>
    );
}
