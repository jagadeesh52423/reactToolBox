'use client';
import React, { useState, useEffect } from 'react';
import { TextCase, textCaseOptions, convertTextCase } from '../utils/textCaseUtils';

const DEFAULT_TEXT = `Hello World! This is a sample text.
You can convert it to different text cases.`;

const TextCaseConverter: React.FC = () => {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [selectedCase, setSelectedCase] = useState<TextCase>('uppercase');
  const [outputText, setOutputText] = useState('');

  useEffect(() => {
    setOutputText(convertTextCase(inputText, selectedCase));
  }, [inputText, selectedCase]);

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(outputText);
    alert('Text copied to clipboard!');
  };

  const handleClearInput = () => {
    setInputText('');
    setOutputText('');
  };

  const handlePasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
    } catch (err) {
      alert('Failed to read clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Select Text Case</h2>
        <select
          value={selectedCase}
          onChange={(e) => setSelectedCase(e.target.value as TextCase)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {textCaseOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} - {option.example}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Input Text</h3>
            <div className="space-x-2">
              <button
                onClick={handlePasteInput}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
              >
                Paste
              </button>
              <button
                onClick={handleClearInput}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter your text here..."
            className="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="text-sm text-gray-600">
            {inputText.length} characters, {inputText.trim().split(/\s+/).filter(Boolean).length} words
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Output</h3>
            {outputText && (
              <button
                onClick={handleCopyOutput}
                className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm transition-colors"
              >
                Copy
              </button>
            )}
          </div>
          <div className="w-full h-80 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 overflow-auto">
            <pre className="whitespace-pre-wrap break-words">
              {outputText || 'Converted text will appear here...'}
            </pre>
          </div>
          <div className="text-sm text-gray-600">
            {outputText.length} characters, {outputText.trim().split(/\s+/).filter(Boolean).length} words
          </div>
        </div>
      </div>

      <div className="bg-gray-100 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">Quick Examples</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {textCaseOptions.slice(0, 6).map((option) => (
            <div key={option.value} className="bg-white p-3 rounded border">
              <div className="font-medium text-sm">{option.label}</div>
              <div className="text-gray-600 text-xs mt-1">{option.example}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextCaseConverter;