'use client';

import { useJsonVisualizer } from '../hooks/useJsonVisualizer';
import JsonInputPanel from './JsonInputPanel';
import JsonViewerPanel from './JsonViewerPanel';
import ToastNotification from './ToastNotification';
import StatusBar from './StatusBar';

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
        isEditorVisible,
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
        handleCaseSensitiveToggle,
        handleRegexToggle,
        handleSearch,

        // Tree Handlers
        handleExpandAll,
        handleCollapseAll,
        handleDelete,
        handleUpdate,

        // UI Handlers
        toggleEditorVisibility,

        // Toast
        clearToast
    } = useJsonVisualizer();

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-hidden">
                <div className="w-full h-full">
                    <div className={`grid gap-6 h-[calc(100vh-200px)] ${
                        isEditorVisible ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                    }`}>
                        {/* Left Panel - Input */}
                        {isEditorVisible && (
                            <JsonInputPanel
                                jsonInput={jsonInput}
                                error={error}
                                indentLevel={indentLevel}
                                showPrettifyOptions={showPrettifyOptions}
                                isVisible={isEditorVisible}
                                onJsonChange={handleJsonChange}
                                onPrettify={handlePrettify}
                                onTogglePrettify={togglePrettifyOptions}
                                onCopy={handleCopy}
                                onFileUpload={handleFileUpload}
                                onDownload={handleDownload}
                                onToggleVisibility={toggleEditorVisibility}
                            />
                        )}

                        {/* Right Panel - Viewer */}
                        <JsonViewerPanel
                            ref={treeViewRef}
                            parsedJson={parsedJson}
                            error={error}
                            searchOptions={searchOptions}
                            isEditorVisible={isEditorVisible}
                            onSearchTextChange={handleSearchTextChange}
                            onSearchLevelChange={handleSearchLevelChange}
                            onFilterToggle={handleFilterToggle}
                            onFuzzyToggle={handleFuzzyToggle}
                            onCaseSensitiveToggle={handleCaseSensitiveToggle}
                            onRegexToggle={handleRegexToggle}
                            onSearch={handleSearch}
                            onExpandAll={handleExpandAll}
                            onCollapseAll={handleCollapseAll}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            onToggleEditorVisibility={toggleEditorVisibility}
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
