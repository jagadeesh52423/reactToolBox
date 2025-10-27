'use client';
import React, { useState } from 'react';
import DiffViewer from './DiffViewer';

const DEFAULT_LEFT = { name: "John", age: 30, address: { city: "New York", zip: 10001 } };
const DEFAULT_RIGHT = { name: "John", age: 31, address: { city: "Boston", zip: "02108" } };

const JsonComparer: React.FC = () => {
  const [leftJson, setLeftJson] = useState<string>(JSON.stringify(DEFAULT_LEFT, null, 2));
  const [rightJson, setRightJson] = useState<string>(JSON.stringify(DEFAULT_RIGHT, null, 2));
  const [error, setError] = useState<string>('');
  const [showDiff, setShowDiff] = useState<boolean>(false);
  
  const validateJson = (json: string): { isValid: boolean; error?: string } => {
    try {
      JSON.parse(json);
      return { isValid: true };
    } catch (e) {
      const error = e as Error;
      return {
        isValid: false,
        error: `JSON Parse Error: ${error.message}`
      };
    }
  };

  const fixCommonJsonIssues = (json: string): string => {
    // More robust approach: split by lines and reconstruct properly
    const lines = json.split(/\r?\n/);
    let result = '';
    let inString = false;
    let currentString = '';
    let escapeNext = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (escapeNext) {
          result += char;
          escapeNext = false;
          continue;
        }

        if (char === '\\') {
          result += char;
          escapeNext = true;
          continue;
        }

        if (char === '"') {
          inString = !inString;
          result += char;
          continue;
        }

        result += char;
      }

      // If we're at the end of a line and inside a string, add escaped newline
      if (i < lines.length - 1) {
        if (inString) {
          result += '\\n';
        } else {
          result += ' '; // Replace line breaks outside strings with spaces
        }
      }
    }

    // Additional cleanup for any remaining control characters
    result = result.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, (match) => {
      switch (match) {
        case '\t': return '\\t';
        case '\b': return '\\b';
        case '\f': return '\\f';
        default: return '\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4);
      }
    });

    return result;
  };

  const handleCompare = () => {
    const leftValidation = validateJson(leftJson);
    if (!leftValidation.isValid) {
      setError(`Left JSON: ${leftValidation.error}`);
      return;
    }

    const rightValidation = validateJson(rightJson);
    if (!rightValidation.isValid) {
      setError(`Right JSON: ${rightValidation.error}`);
      return;
    }

    setError('');
    setShowDiff(true);
  };


  const fixAndFormatJson = (side: 'left' | 'right') => {
    try {
      const json = side === 'left' ? leftJson : rightJson;
      const fixed = fixCommonJsonIssues(json);
      const formatted = JSON.stringify(JSON.parse(fixed), null, 2);
      if (side === 'left') {
        setLeftJson(formatted);
      } else {
        setRightJson(formatted);
      }
      setError('');
    } catch (e) {
      const error = e as Error;
      setError(`Cannot fix and format ${side} JSON: ${error.message}. Try fixing the JSON manually.`);
    }
  };

  const swapJsonContents = () => {
    const tempLeft = leftJson;
    setLeftJson(rightJson);
    setRightJson(tempLeft);
    setError('');
    // Clear the diff view since contents have changed
    setShowDiff(false);
  };

  return (
    <div>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <div className="flex flex-col md:flex-row gap-4 mb-4 relative">
        <div className="w-full md:w-1/2">
          <div className="flex justify-between mb-2">
            <h2 className="text-lg font-semibold">Left JSON</h2>
            <button
              onClick={() => fixAndFormatJson('left')}
              className="bg-blue-200 hover:bg-blue-300 rounded px-3 py-1 text-sm"
              title="Fix common JSON issues (like unescaped line breaks) and format"
            >
              Format & Fix
            </button>
          </div>
          <textarea
            className="w-full h-64 font-mono p-2 border rounded"
            value={leftJson}
            onChange={(e) => setLeftJson(e.target.value)}
          />
        </div>

        {/* Swap Button - positioned between editors */}
        <div className="flex justify-center items-center md:absolute md:left-1/2 md:top-1/2 md:transform md:-translate-x-1/2 md:-translate-y-1/2 md:z-10">
          <button
            onClick={swapJsonContents}
            className="bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-full p-3 shadow-md transition-colors"
            title="Swap left and right JSON contents"
          >
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>
        </div>

        <div className="w-full md:w-1/2">
          <div className="flex justify-between mb-2">
            <h2 className="text-lg font-semibold">Right JSON</h2>
            <button
              onClick={() => fixAndFormatJson('right')}
              className="bg-blue-200 hover:bg-blue-300 rounded px-3 py-1 text-sm"
              title="Fix common JSON issues (like unescaped line breaks) and format"
            >
              Format & Fix
            </button>
          </div>
          <textarea
            className="w-full h-64 font-mono p-2 border rounded"
            value={rightJson}
            onChange={(e) => setRightJson(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={handleCompare}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Compare JSON
        </button>
      </div>
      
      {showDiff && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Differences</h2>
          <DiffViewer left={leftJson} right={rightJson} />
        </div>
      )}
    </div>
  );
};

export default JsonComparer;
