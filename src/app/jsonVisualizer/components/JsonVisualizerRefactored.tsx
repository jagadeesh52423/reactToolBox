'use client';

import { useJsonVisualizer } from '../hooks/useJsonVisualizer';
import JsonInputPanel from './JsonInputPanel';
import JsonViewerPanel from './JsonViewerPanel';
import ToastNotification from '@/components/common/ToastNotification';
import StatusBar from './StatusBar';

export default function JsonVisualizerRefactored() {
    const {
        // State
        jsonInput,
        parsedJson,
        error,
        searchOptions,
        matchCount,
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
        handleKeysOnlyToggle,
        handleSearch,

        // Tree Handlers
        handleExpandAll,
        handleCollapseAll,
        handleDelete,
        handleUpdate,

        // UI Handlers
        toggleEditorVisibility,

        // Toast
        clearToast,

        // New: History
        canUndo,
        canRedo,
        handleUndo,
        handleRedo,

        // New: Breadcrumb
        breadcrumbSegments,
        handleBreadcrumbNavigate,

        // New: Command palette
        commandPalette,

        // New: Tree navigation
        treeNavigation,

        // New: Add
        handleAdd,

        // New: Navigate
        navigate,
        handleNavigateToPath,
    } = useJsonVisualizer();

    return (
        <div
            className="h-full flex flex-col"
            style={{ background: 'var(--jv-bg-primary)' }}
        >
            {/* Main Content */}
            <main className="flex-1 p-4 overflow-hidden min-h-0">
                <div className={`grid gap-4 h-full ${
                    isEditorVisible ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'
                }`} style={{ minHeight: 0 }}>
                    {/* Left Panel - Input */}
                    {isEditorVisible && (
                        <div className="min-h-0">
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
                        </div>
                    )}

                    {/* Right Panel - Viewer */}
                    <div className="min-h-0">
                        <JsonViewerPanel
                            ref={treeViewRef}
                            parsedJson={parsedJson}
                            error={error}
                            searchOptions={searchOptions}
                            matchCount={matchCount}
                            isEditorVisible={isEditorVisible}
                            onSearchTextChange={handleSearchTextChange}
                            onSearchLevelChange={handleSearchLevelChange}
                            onFilterToggle={handleFilterToggle}
                            onFuzzyToggle={handleFuzzyToggle}
                            onCaseSensitiveToggle={handleCaseSensitiveToggle}
                            onRegexToggle={handleRegexToggle}
                            onKeysOnlyToggle={handleKeysOnlyToggle}
                            onSearch={handleSearch}
                            onExpandAll={handleExpandAll}
                            onCollapseAll={handleCollapseAll}
                            onDelete={handleDelete}
                            onUpdate={handleUpdate}
                            onToggleEditorVisibility={toggleEditorVisibility}
                            breadcrumbSegments={breadcrumbSegments}
                            onBreadcrumbNavigate={handleBreadcrumbNavigate}
                            commandPaletteOpen={commandPalette.isOpen}
                            commandPaletteMode={commandPalette.mode}
                            onCommandPaletteClose={commandPalette.close}
                            onCommandPaletteModeChange={commandPalette.setMode}
                            onCommandPaletteOpen={commandPalette.open}
                            onAdd={handleAdd}
                            focusedPath={treeNavigation.focusedPath}
                            onFocusChange={treeNavigation.setFocusedPath}
                            navigateText={navigate.navigateText}
                            suggestions={navigate.suggestions}
                            selectedSuggestionIndex={navigate.selectedIndex}
                            onNavigateTextChange={navigate.setNavigateText}
                            onSuggestionSelect={handleNavigateToPath}
                            onSuggestionIndexChange={navigate.setSelectedIndex}
                        />
                    </div>
                </div>
            </main>

            {/* Status Bar */}
            <StatusBar
                jsonInput={jsonInput}
                parsedJson={parsedJson}
                error={error}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={handleUndo}
                onRedo={handleRedo}
            />

            {/* Toast Notification */}
            <ToastNotification toast={toast} onClose={clearToast} />
        </div>
    );
}
