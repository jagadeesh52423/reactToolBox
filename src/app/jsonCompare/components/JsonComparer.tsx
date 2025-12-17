'use client';
import React, { useState, useCallback, useMemo } from 'react';
import DiffViewer from './DiffViewer';
import StructuredDiffViewer from './StructuredDiffViewer';
import JsonEditor from './JsonEditor';
import CompareStatusBar, { CompareStats } from './CompareStatusBar';
import {
  ArrowsRightLeftIcon,
  GitCompareIcon,
  SparklesIcon,
  TableIcon,
  TreeIcon,
  AlertCircleIcon
} from './Icons';

const DEFAULT_LEFT = { name: "John", age: 30, address: { city: "New York", zip: 10001 } };
const DEFAULT_RIGHT = { name: "John", age: 31, address: { city: "Boston", zip: "02108" } };

const JsonComparer: React.FC = () => {
  const [leftJson, setLeftJson] = useState<string>(JSON.stringify(DEFAULT_LEFT, null, 2));
  const [rightJson, setRightJson] = useState<string>(JSON.stringify(DEFAULT_RIGHT, null, 2));
  const [error, setError] = useState<string>('');
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'structured'>('structured');
  const [fixedLeftJson, setFixedLeftJson] = useState<string>('');
  const [fixedRightJson, setFixedRightJson] = useState<string>('');
  const [stats, setStats] = useState<CompareStats | null>(null);

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
    const lines = json.split(/\r?\n/);
    let result = '';
    let inString = false;
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

      if (i < lines.length - 1) {
        if (inString) {
          result += '\\n';
        } else {
          result += ' ';
        }
      }
    }

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

  // Calculate comparison statistics
  const calculateStats = useCallback((left: unknown, right: unknown): CompareStats => {
    let additions = 0;
    let deletions = 0;
    let modifications = 0;
    let unchanged = 0;

    const compare = (l: unknown, r: unknown): void => {
      if (l === r) {
        unchanged++;
        return;
      }

      if (typeof l !== typeof r) {
        modifications++;
        return;
      }

      if (typeof l !== 'object' || l === null || r === null) {
        modifications++;
        return;
      }

      const lObj = l as Record<string, unknown>;
      const rObj = r as Record<string, unknown>;
      const allKeys = new Set([...Object.keys(lObj), ...Object.keys(rObj)]);

      for (const key of allKeys) {
        if (!(key in rObj)) {
          deletions++;
        } else if (!(key in lObj)) {
          additions++;
        } else {
          compare(lObj[key], rObj[key]);
        }
      }
    };

    compare(left, right);
    return { additions, deletions, modifications, unchanged };
  }, []);

  const handleCompare = () => {
    let processedLeftJson = leftJson;
    let processedRightJson = rightJson;

    try {
      processedLeftJson = fixCommonJsonIssues(leftJson);
      processedRightJson = fixCommonJsonIssues(rightJson);
    } catch {
      // If fixing fails, use original
    }

    const leftValidation = validateJson(processedLeftJson);
    if (!leftValidation.isValid) {
      setError(`Left JSON: ${leftValidation.error}`);
      return;
    }

    const rightValidation = validateJson(processedRightJson);
    if (!rightValidation.isValid) {
      setError(`Right JSON: ${rightValidation.error}`);
      return;
    }

    // Calculate statistics
    const leftParsed = JSON.parse(processedLeftJson);
    const rightParsed = JSON.parse(processedRightJson);
    const newStats = calculateStats(leftParsed, rightParsed);
    setStats(newStats);

    setFixedLeftJson(processedLeftJson);
    setFixedRightJson(processedRightJson);
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
    setShowDiff(false);
    setStats(null);
  };

  // Panel header component
  const PanelHeader = ({ title, onFormat }: { title: string; onFormat: () => void }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-sm font-medium text-gray-600 dark:text-slate-300">
          {title}
        </span>
      </div>
      <button
        onClick={onFormat}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-700 dark:text-indigo-300 bg-indigo-100/50 dark:bg-indigo-600/20 hover:bg-indigo-200/50 dark:hover:bg-indigo-600/30 border border-indigo-200/50 dark:border-indigo-500/30 transition-all duration-200 text-sm font-medium"
        title="Fix common JSON issues and format"
      >
        <SparklesIcon size={16} />
        <span>Format & Fix</span>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <GitCompareIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">JSON Compare</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">Compare and visualize differences between two JSON objects</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 flex items-center gap-3">
            <AlertCircleIcon size={20} className="text-red-500 dark:text-red-400 flex-shrink-0" />
            <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          </div>
        )}

        {/* JSON Editors */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 relative">
          {/* Left JSON Panel */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <PanelHeader title="Left JSON" onFormat={() => fixAndFormatJson('left')} />
            <div className="flex-1 p-4">
              <JsonEditor
                value={leftJson}
                onChange={setLeftJson}
                className="w-full"
              />
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center items-center lg:absolute lg:left-1/2 lg:top-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 lg:z-10">
            <button
              onClick={swapJsonContents}
              className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20 transition-all duration-200 hover:scale-105"
              title="Swap left and right JSON contents"
            >
              <ArrowsRightLeftIcon size={20} />
            </button>
          </div>

          {/* Right JSON Panel */}
          <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <PanelHeader title="Right JSON" onFormat={() => fixAndFormatJson('right')} />
            <div className="flex-1 p-4">
              <JsonEditor
                value={rightJson}
                onChange={setRightJson}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Compare Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleCompare}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/30 dark:shadow-indigo-500/20 transition-all duration-200 hover:scale-[1.02]"
          >
            <GitCompareIcon size={20} />
            <span>Compare JSON</span>
          </button>
        </div>

        {/* Diff Results */}
        {showDiff && (
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            {/* Diff Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-sm font-medium text-gray-600 dark:text-slate-300">
                  Differences
                </span>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100/50 dark:bg-slate-700/30 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <TableIcon size={16} />
                  <span>Table</span>
                </button>
                <button
                  onClick={() => setViewMode('structured')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === 'structured'
                      ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <TreeIcon size={16} />
                  <span>Tree</span>
                </button>
              </div>
            </div>

            {/* Diff Content */}
            <div className="p-4 max-h-[600px] overflow-auto">
              {viewMode === 'table' ? (
                <DiffViewer left={fixedLeftJson} right={fixedRightJson} />
              ) : (
                <StructuredDiffViewer left={fixedLeftJson} right={fixedRightJson} />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Status Bar */}
      <CompareStatusBar stats={stats} hasCompared={showDiff} />
    </div>
  );
};

export default JsonComparer;
