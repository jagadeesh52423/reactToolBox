'use client';
import React, { useState } from 'react';
import { useHTMLFormatter } from '../hooks/useHTMLFormatter';
import { HTMLInput } from './HTMLInput';
import { FormatControls } from './FormatControls';
import { HTMLOutput } from './HTMLOutput';
import { ErrorDisplay } from './ErrorDisplay';
import { Notification } from './Notification';
import { ValidationResults } from './ValidationResults';
import { FileOperations } from './FileOperations';

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
<head>
<title>Example Page</title>
<style>body { font-family: Arial; }</style>
</head>
<body>
<header><h1>Welcome</h1><nav><ul><li><a href="#">Home</a></li><li><a href="#">About</a></li></ul></nav></header>
<main>
<section><h2>Section Title</h2><p>This is a paragraph with <strong>bold</strong> and <em>italic</em> text.</p></section>
</main>
</body>
</html>`;

/**
 * Main HTML Formatter Component (Refactored)
 *
 * Refactored following SOLID principles and design patterns:
 *
 * - Single Responsibility: Component only orchestrates sub-components
 * - Open/Closed: Easy to extend with new formatter/highlighter strategies
 * - Dependency Inversion: Depends on abstractions (hook, services) not concrete implementations
 * - Strategy Pattern: Different formatting and highlighting strategies
 * - Service Layer: Business logic separated from UI
 * - Separation of Concerns: Tokenizer, Formatter, Highlighter are separate classes
 *
 * Architecture:
 * - Tokenizer: Parses HTML into structured tokens
 * - Formatter: Applies formatting rules using Strategy pattern
 * - Highlighter: Applies syntax highlighting using Strategy pattern
 * - Service: Coordinates between components (Facade pattern)
 * - Hook: Manages state and business logic interactions
 * - Components: Focused UI components with single responsibilities
 */
const HtmlFormatterTool: React.FC = () => {
  const {
    inputHTML,
    formattedHTML,
    highlightedHTML,
    indentSize,
    error,
    showOutput,
    inputStats,
    outputStats,
    validationResult,
    currentFilename,
    updateInput,
    updateIndentSize,
    formatHTML,
    validateHTMLOnly,
    copyToClipboard,
    clearInput,
    loadFile,
    downloadFormattedHTML,
  } = useHTMLFormatter(DEFAULT_HTML);

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const handleFormat = () => {
    formatHTML();
    if (!error) {
      setNotification({
        message: 'HTML formatted successfully!',
        type: 'success',
      });
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard();
    setNotification({
      message: success
        ? 'Formatted HTML copied to clipboard!'
        : 'Failed to copy to clipboard',
      type: success ? 'success' : 'error',
    });
  };

  const handleFileLoad = (content: string, filename: string) => {
    loadFile(content, filename);
    setNotification({
      message: `File "${filename}" loaded successfully!`,
      type: 'success',
    });
  };

  const handleDownload = () => {
    downloadFormattedHTML();
    setNotification({
      message: 'Formatted HTML downloaded successfully!',
      type: 'success',
    });
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="space-y-6">
        <ErrorDisplay error={error} />

        {currentFilename && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg px-4 py-2 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span className="text-sm text-blue-800">
              <strong>Loaded file:</strong> {currentFilename}
            </span>
          </div>
        )}

        <FileOperations
          onFileLoad={handleFileLoad}
          onDownload={handleDownload}
          hasContent={showOutput && !!formattedHTML}
          disabled={false}
        />

        <HTMLInput
          value={inputHTML}
          onChange={updateInput}
          onClear={clearInput}
          stats={inputStats}
        />

        <FormatControls
          indentSize={indentSize}
          onIndentSizeChange={updateIndentSize}
          onFormat={handleFormat}
          disabled={!inputHTML.trim()}
        />

        {validationResult && (
          <ValidationResults validationResult={validationResult} />
        )}

        {showOutput && (
          <HTMLOutput
            highlightedHTML={highlightedHTML}
            onCopy={handleCopy}
            stats={outputStats}
          />
        )}
      </div>
    </>
  );
};

export default HtmlFormatterTool;
