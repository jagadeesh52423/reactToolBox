'use client';
import React, { useState } from 'react';
import { useHTMLFormatter } from '../hooks/useHTMLFormatter';
import { HTMLInput } from './HTMLInput';
import { FormatControls } from './FormatControls';
import { HTMLOutput } from './HTMLOutput';
import { ErrorDisplay } from './ErrorDisplay';
import { Notification } from './Notification';
import { ValidationResults } from './ValidationResults';

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
    highlightedHTML,
    indentSize,
    error,
    showOutput,
    inputStats,
    outputStats,
    validationResult,
    updateInput,
    updateIndentSize,
    formatHTML,
    validateHTMLOnly,
    copyToClipboard,
    clearInput,
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
