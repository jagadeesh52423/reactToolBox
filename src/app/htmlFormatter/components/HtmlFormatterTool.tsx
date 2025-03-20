'use client';
import React, { useState } from 'react';
import { formatHtml } from '../utils/htmlUtils';
import SyntaxHighlighter from './SyntaxHighlighter';

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

const HtmlFormatterTool: React.FC = () => {
  const [htmlCode, setHtmlCode] = useState(DEFAULT_HTML);
  const [formattedHtml, setFormattedHtml] = useState('');
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState('');
  const [showFormatted, setShowFormatted] = useState(false);

  const handleFormat = () => {
    try {
      const result = formatHtml(htmlCode, indentSize);
      setFormattedHtml(result);
      setShowFormatted(true);
      setError('');
    } catch (err) {
      setError(`Error formatting HTML: ${err instanceof Error ? err.message : String(err)}`);
      setShowFormatted(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(formattedHtml);
    // Show feedback (could use a toast notification here)
    alert('Formatted HTML copied to clipboard!');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <label className="font-medium">HTML Input</label>
        <textarea
          className="w-full h-64 p-2 border rounded font-mono text-sm"
          value={htmlCode}
          onChange={(e) => setHtmlCode(e.target.value)}
          placeholder="Paste your HTML code here..."
        />
      </div>
      
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <label htmlFor="indentSize" className="text-sm font-medium">Indent Size:</label>
          <select 
            id="indentSize"
            className="border rounded p-1"
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
          >
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="8">8 spaces</option>
          </select>
        </div>
        
        <button
          onClick={handleFormat}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Format HTML
        </button>
      </div>
      
      {showFormatted && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold">Formatted HTML</h2>
            <button
              onClick={handleCopyToClipboard}
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
            >
              Copy to Clipboard
            </button>
          </div>
          
          <div className="border rounded bg-gray-50 overflow-auto max-h-96">
            <SyntaxHighlighter code={formattedHtml} language="html" />
          </div>
        </div>
      )}
    </div>
  );
};

export default HtmlFormatterTool;
