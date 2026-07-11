'use client';
import React, { useState, useCallback, useMemo, useRef } from 'react';
import DiffViewer from './DiffViewer';
import StructuredDiffViewer from './StructuredDiffViewer';
import JsonEditor from './JsonEditor';
import CompareStatusBar, { CompareStats } from './CompareStatusBar';
import { useFileIO } from '@/hooks/useFileIO';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { parseIgnoredKeys, stripIgnoredKeys, sortArraysForComparison } from '../utils/compareOptions';
import {
  ArrowsRightLeftIcon,
  GitCompareIcon,
  SparklesIcon,
  TableIcon,
  TreeIcon,
  AlertCircleIcon,
  DownloadIcon,
} from '@/components/shared/Icons';

const DEFAULT_LEFT = { name: "John", age: 30, address: { city: "New York", zip: 10001 } };
const DEFAULT_RIGHT = { name: "John", age: 31, address: { city: "Boston", zip: "02108" } };

const IDENTIFIER_START = /[A-Za-z_$]/;
const IDENTIFIER_PART = /[A-Za-z0-9_$]/;
const WHITESPACE = /\s/;

const readDoubleQuotedString = (input: string, start: number): { text: string; nextIndex: number } => {
  let i = start + 1;
  let text = '"';
  while (i < input.length) {
    const char = input[i];
    text += char;
    i++;
    if (char === '\\' && i < input.length) {
      text += input[i];
      i++;
      continue;
    }
    if (char === '"') break;
  }
  return { text, nextIndex: i };
};

const readSingleQuotedStringAsDouble = (input: string, start: number): { text: string; nextIndex: number } => {
  let i = start + 1;
  let text = '"';
  while (i < input.length) {
    const char = input[i];
    if (char === '\\' && i + 1 < input.length) {
      const next = input[i + 1];
      text += next === "'" ? "'" : char + next;
      i += 2;
      continue;
    }
    if (char === "'") {
      i++;
      break;
    }
    text += char === '"' ? '\\"' : char;
    i++;
  }
  return { text: text + '"', nextIndex: i };
};

// Single left-to-right pass; only fixes trailing commas, single-quoted strings, and unquoted
// keys — the three most common hand-edited-JSON mistakes. Runs after newline/control-char
// normalization, so no raw newlines remain to complicate the scan.
const repairLenientJsonSyntax = (json: string): string => {
  let result = '';
  let i = 0;

  while (i < json.length) {
    const char = json[i];

    if (char === '"') {
      const { text, nextIndex } = readDoubleQuotedString(json, i);
      result += text;
      i = nextIndex;
      continue;
    }

    if (char === "'") {
      const { text, nextIndex } = readSingleQuotedStringAsDouble(json, i);
      result += text;
      i = nextIndex;
      continue;
    }

    if (IDENTIFIER_START.test(char)) {
      let j = i + 1;
      while (j < json.length && IDENTIFIER_PART.test(json[j])) j++;
      const word = json.slice(i, j);
      let k = j;
      while (k < json.length && WHITESPACE.test(json[k])) k++;
      result += json[k] === ':' ? `"${word}"` : word;
      i = j;
      continue;
    }

    if (char === ',') {
      let k = i + 1;
      while (k < json.length && WHITESPACE.test(json[k])) k++;
      if (json[k] === '}' || json[k] === ']') {
        i++;
        continue;
      }
      result += char;
      i++;
      continue;
    }

    result += char;
    i++;
  }

  return result;
};

const JsonComparer: React.FC = () => {
  const [leftJson, setLeftJson] = useLocalStorage<string>('reactToolBox_jsonCompare_left', JSON.stringify(DEFAULT_LEFT, null, 2));
  const [rightJson, setRightJson] = useLocalStorage<string>('reactToolBox_jsonCompare_right', JSON.stringify(DEFAULT_RIGHT, null, 2));
  const [error, setError] = useState<string>('');
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'structured'>('structured');
  const [fixedLeftJson, setFixedLeftJson] = useState<string>('');
  const [fixedRightJson, setFixedRightJson] = useState<string>('');
  const [stats, setStats] = useState<CompareStats | null>(null);
  const [ignoreArrayOrder, setIgnoreArrayOrder] = useState<boolean>(false);
  const [ignoreKeysEnabled, setIgnoreKeysEnabled] = useState<boolean>(false);
  const [ignoreKeysInput, setIgnoreKeysInput] = useState<string>('');
  const [editorsPct, setEditorsPct] = useState<number>(0.4);
  const containerRef = useRef<HTMLElement>(null);
  const { downloadFile } = useFileIO();

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const containerEl = containerRef.current;
    if (!containerEl) return;
    const startY = e.clientY;
    const containerHeight = containerEl.getBoundingClientRect().height;
    const startPct = editorsPct;

    const onMove = (ev: MouseEvent) => {
      const deltaPct = (ev.clientY - startY) / containerHeight;
      const next = Math.max(0.15, Math.min(0.85, startPct + deltaPct));
      setEditorsPct(next);
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  }, [editorsPct]);

  const handleDownloadDiff = useCallback(() => {
    if (!stats || !fixedLeftJson || !fixedRightJson) return;
    const report = [
      '=== JSON Compare Report ===',
      `Date: ${new Date().toISOString()}`,
      '',
      `Additions: ${stats.additions}`,
      `Deletions: ${stats.deletions}`,
      `Modifications: ${stats.modifications}`,
      `Unchanged: ${stats.unchanged}`,
      '',
      '--- Left JSON ---',
      fixedLeftJson,
      '',
      '--- Right JSON ---',
      fixedRightJson,
    ].join('\n');
    downloadFile(report, 'json-compare-report.txt');
  }, [stats, fixedLeftJson, fixedRightJson, downloadFile]);

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

    return repairLenientJsonSyntax(result);
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

    const ignoredKeys = ignoreKeysEnabled ? parseIgnoredKeys(ignoreKeysInput) : new Set<string>();
    const hasIgnoreOptions = ignoredKeys.size > 0 || ignoreArrayOrder;

    let leftForCompare: unknown = leftParsed;
    let rightForCompare: unknown = rightParsed;

    if (ignoredKeys.size > 0) {
      leftForCompare = stripIgnoredKeys(leftForCompare, ignoredKeys);
      rightForCompare = stripIgnoredKeys(rightForCompare, ignoredKeys);
    }
    if (ignoreArrayOrder) {
      leftForCompare = sortArraysForComparison(leftForCompare);
      rightForCompare = sortArraysForComparison(rightForCompare);
    }

    const newStats = calculateStats(leftForCompare, rightForCompare);
    setStats(newStats);

    setFixedLeftJson(hasIgnoreOptions ? JSON.stringify(leftForCompare, null, 2) : processedLeftJson);
    setFixedRightJson(hasIgnoreOptions ? JSON.stringify(rightForCompare, null, 2) : processedRightJson);
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
    <div className="h-full min-h-[var(--tool-content-height)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Main Content */}
      <main ref={containerRef} className="flex-1 min-h-0 p-6 overflow-y-auto lg:overflow-hidden flex flex-col">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 flex items-center gap-3">
            <AlertCircleIcon size={20} className="text-red-500 dark:text-red-400 flex-shrink-0" />
            <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
          </div>
        )}

        {/* JSON Editors */}
        <div
          className={`flex flex-col lg:flex-row gap-4 mb-4 relative min-h-[480px] lg:min-h-[180px] ${
            showDiff ? 'flex-shrink-0' : 'flex-1'
          }`}
          style={showDiff ? { flexBasis: `${editorsPct * 100}%` } : undefined}
        >
          {/* Left JSON Panel */}
          <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <PanelHeader title="Left JSON" onFormat={() => fixAndFormatJson('left')} />
            <div className="flex-1 min-h-0 p-4 flex flex-col">
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
          <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <PanelHeader title="Right JSON" onFormat={() => fixAndFormatJson('right')} />
            <div className="flex-1 min-h-0 p-4 flex flex-col">
              <JsonEditor
                value={rightJson}
                onChange={setRightJson}
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Resize Handle (only when diff is visible) */}
        {showDiff && (
          <div
            onMouseDown={handleResizeStart}
            className="group h-1.5 mb-3 rounded-full bg-gray-200 dark:bg-slate-700 hover:bg-indigo-400 dark:hover:bg-indigo-500 cursor-row-resize transition-colors flex-shrink-0 flex items-center justify-center"
            title="Drag to resize editors"
          >
            <div className="w-10 h-0.5 rounded-full bg-gray-400 dark:bg-slate-500 group-hover:bg-white" />
          </div>
        )}

        {/* Compare Options */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-3 flex-shrink-0">
          <label
            className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-slate-300"
            title="Sorts each array's elements by their JSON content before comparing, so reordered arrays with the same elements show as unchanged. Elements are matched by exact content, not similarity — an element that differs in any field still shows as its own change."
          >
            <input
              type="checkbox"
              checked={ignoreArrayOrder}
              onChange={(e) => setIgnoreArrayOrder(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500"
            />
            Ignore Array Order
          </label>

          <label
            className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700 dark:text-slate-300"
            title="Excludes these key names from comparison at any depth (e.g. updatedAt, id). Matches by key name only, not full path."
          >
            <input
              type="checkbox"
              checked={ignoreKeysEnabled}
              onChange={(e) => setIgnoreKeysEnabled(e.target.checked)}
              className="w-4 h-4 text-indigo-600 border-gray-300 dark:border-slate-600 rounded focus:ring-indigo-500"
            />
            Ignore Keys
          </label>
          {ignoreKeysEnabled && (
            <input
              type="text"
              value={ignoreKeysInput}
              onChange={(e) => setIgnoreKeysInput(e.target.value)}
              placeholder="e.g. updatedAt, id, requestId"
              className="flex-1 min-w-[200px] max-w-xs px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}
        </div>

        {/* Compare Button */}
        <div className={`flex justify-center flex-shrink-0 ${showDiff ? 'mb-3' : 'mb-6'}`}>
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
          <div className="flex-1 min-h-0 flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
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

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadDiff}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                  title="Download diff report"
                >
                  <DownloadIcon size={16} />
                </button>
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
            </div>

            {/* Diff Content */}
            <div className="p-4 flex-1 overflow-auto">
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
