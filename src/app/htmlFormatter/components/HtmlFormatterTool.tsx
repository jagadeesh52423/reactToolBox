'use client';
import React, { useState } from 'react';
import { useHTMLFormatter } from '../hooks/useHTMLFormatter';
import { HTMLInput } from './HTMLInput';
import { HTMLOutput } from './HTMLOutput';
import { ToastNotification } from './ToastNotification';
import { ValidationResults } from './ValidationResults';
import { StatusBar } from './StatusBar';

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

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastConfig {
  message: string;
  type: ToastType;
}

/**
 * Main HTML Formatter Component - Professional Redesign
 *
 * Features:
 * - Theme-aware design (light/dark)
 * - Status bar with HTML statistics
 * - Professional header with icon-based toolbar
 * - Responsive two-panel layout
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
    copyToClipboard,
    clearInput,
    loadFile,
    downloadFormattedHTML,
  } = useHTMLFormatter(DEFAULT_HTML);

  const [toast, setToast] = useState<ToastConfig | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFormat = () => {
    formatHTML();
    if (!error) {
      showToast('HTML formatted successfully!', 'success');
      setShowValidation(true);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard();
    showToast(
      success ? 'Copied to clipboard!' : 'Failed to copy',
      success ? 'success' : 'error'
    );
  };

  const handleFileLoad = (content: string, filename: string) => {
    loadFile(content, filename);
    showToast(`File "${filename}" loaded!`, 'success');
  };

  const handleDownload = () => {
    downloadFormattedHTML();
    showToast('Downloaded successfully!', 'success');
  };

  const handleClear = () => {
    clearInput();
    setShowValidation(false);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden min-h-0">
        <div className="w-full h-full flex flex-col gap-4">
          {/* Two Panel Layout */}
          <div className="grid gap-6 flex-1 min-h-0 grid-cols-1 lg:grid-cols-2">
            {/* Left Panel - Input */}
            <HTMLInput
              value={inputHTML}
              onChange={updateInput}
              onClear={handleClear}
              onFileLoad={handleFileLoad}
              onFormat={handleFormat}
              indentSize={indentSize}
              onIndentSizeChange={updateIndentSize}
              currentFilename={currentFilename}
              error={error}
              disabled={!inputHTML.trim()}
            />

            {/* Right Panel - Output */}
            <HTMLOutput
              highlightedHTML={highlightedHTML}
              formattedHTML={formattedHTML}
              onCopy={handleCopy}
              onDownload={handleDownload}
              stats={outputStats}
              hasContent={showOutput && !!formattedHTML}
            />
          </div>

          {/* Validation Results */}
          {showValidation && validationResult && (
            <ValidationResults
              validationResult={validationResult}
              onClose={() => setShowValidation(false)}
            />
          )}
        </div>
      </main>

      {/* Status Bar */}
      <StatusBar
        inputStats={inputStats}
        outputStats={outputStats}
        hasOutput={showOutput}
        error={error}
      />

      {/* Toast Notification */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default HtmlFormatterTool;
