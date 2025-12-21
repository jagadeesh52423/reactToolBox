'use client';
import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  CopyIcon,
  TrashIcon,
  CheckIcon,
  SparklesIcon,
} from './Icons';

interface ReplacementPair {
  id: string;
  search: string;
  replace: string;
  isRegex: boolean;
  enabled: boolean;
}

interface ReplacerProps {
  onBack?: () => void;
}

const DEFAULT_TEXT = `Hello {{name}}! Welcome to {{company}}.
Your order #{{orderId}} has been confirmed.
We will deliver to {{address}} within {{days}} business days.`;

const DEFAULT_TOKENS = `name=John Doe
company=Acme Inc.
orderId=12345
address=123 Main Street
days=3-5`;

const TextReplacer: React.FC<ReplacerProps> = () => {
  const [inputText, setInputText] = useState(DEFAULT_TEXT);
  const [outputText, setOutputText] = useState('');
  const [replacementPairs, setReplacementPairs] = useState<ReplacementPair[]>([]);
  const [tokenFileContent, setTokenFileContent] = useState(DEFAULT_TOKENS);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [copiedInput, setCopiedInput] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceFileName, setSourceFileName] = useState<string | null>(null);
  const [tokenFileName, setTokenFileName] = useState<string | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const [tokenFormat, setTokenFormat] = useState<'keyValue' | 'json' | 'csv'>('keyValue');

  const sourceFileRef = useRef<HTMLInputElement>(null);
  const tokenFileRef = useRef<HTMLInputElement>(null);

  // Parse token file content into replacement pairs
  const parseTokens = useCallback((content: string, format: 'keyValue' | 'json' | 'csv'): ReplacementPair[] => {
    const pairs: ReplacementPair[] = [];
    setError(null);

    try {
      if (format === 'json') {
        const parsed = JSON.parse(content);
        if (typeof parsed === 'object' && parsed !== null) {
          Object.entries(parsed).forEach(([key, value], index) => {
            pairs.push({
              id: `pair-${index}`,
              search: key,
              replace: String(value),
              isRegex: false,
              enabled: true,
            });
          });
        }
      } else if (format === 'csv') {
        const lines = content.split('\n').filter(line => line.trim());
        lines.forEach((line, index) => {
          const [search, ...replaceParts] = line.split(',');
          if (search) {
            pairs.push({
              id: `pair-${index}`,
              search: search.trim(),
              replace: replaceParts.join(',').trim(),
              isRegex: false,
              enabled: true,
            });
          }
        });
      } else {
        // Key-value format: key=value per line
        const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        lines.forEach((line, index) => {
          const separatorIndex = line.indexOf('=');
          if (separatorIndex !== -1) {
            const key = line.substring(0, separatorIndex).trim();
            const value = line.substring(separatorIndex + 1).trim();
            if (key) {
              pairs.push({
                id: `pair-${index}`,
                search: key,
                replace: value,
                isRegex: false,
                enabled: true,
              });
            }
          }
        });
      }
    } catch (err) {
      setError(`Failed to parse tokens: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    return pairs;
  }, []);

  // Load tokens from content
  const loadTokensFromContent = useCallback((content: string) => {
    const pairs = parseTokens(content, tokenFormat);
    setReplacementPairs(pairs);
  }, [parseTokens, tokenFormat]);

  // Handle source file upload
  const handleSourceFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setInputText(content);
      setSourceFileName(file.name);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read source file');
    };
    reader.readAsText(file);

    if (sourceFileRef.current) {
      sourceFileRef.current.value = '';
    }
  }, []);

  // Handle token file upload
  const handleTokenFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setTokenFileContent(content);
      setTokenFileName(file.name);

      // Auto-detect format based on file extension or content
      let detectedFormat: 'keyValue' | 'json' | 'csv' = tokenFormat;
      if (file.name.endsWith('.json')) {
        detectedFormat = 'json';
        setTokenFormat('json');
      } else if (file.name.endsWith('.csv')) {
        detectedFormat = 'csv';
        setTokenFormat('csv');
      }

      const pairs = parseTokens(content, detectedFormat);
      setReplacementPairs(pairs);
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read token file');
    };
    reader.readAsText(file);

    if (tokenFileRef.current) {
      tokenFileRef.current.value = '';
    }
  }, [parseTokens, tokenFormat]);

  // Perform replacement (always regex mode)
  const performReplacement = useCallback(() => {
    let result = inputText;
    let totalMatches = 0;
    setError(null);

    const enabledPairs = replacementPairs.filter(pair => pair.enabled && pair.search);

    try {
      for (const pair of enabledPairs) {
        const flags = caseSensitive ? 'g' : 'gi';
        let searchPattern: RegExp;

        try {
          searchPattern = new RegExp(pair.search, flags);
        } catch (regexError) {
          setError(`Invalid regex pattern "${pair.search}": ${regexError instanceof Error ? regexError.message : 'Unknown error'}`);
          return;
        }

        const matches = result.match(searchPattern);
        if (matches) {
          totalMatches += matches.length;
        }
        result = result.replace(searchPattern, pair.replace);
      }

      setOutputText(result);
      setMatchCount(totalMatches);
    } catch (err) {
      setError(`Replacement failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [inputText, replacementPairs, caseSensitive]);

  // Add manual replacement pair
  const addReplacementPair = useCallback(() => {
    setReplacementPairs(prev => [
      ...prev,
      {
        id: `pair-${Date.now()}`,
        search: '',
        replace: '',
        isRegex: false,
        enabled: true,
      },
    ]);
  }, []);

  // Update a replacement pair
  const updateReplacementPair = useCallback((id: string, field: keyof ReplacementPair, value: string | boolean) => {
    setReplacementPairs(prev =>
      prev.map(pair =>
        pair.id === id ? { ...pair, [field]: value } : pair
      )
    );
  }, []);

  // Remove a replacement pair
  const removeReplacementPair = useCallback((id: string) => {
    setReplacementPairs(prev => prev.filter(pair => pair.id !== id));
  }, []);

  // Copy handlers
  const handleCopyOutput = useCallback(async () => {
    await navigator.clipboard.writeText(outputText);
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 2000);
  }, [outputText]);

  const handleCopyInput = useCallback(async () => {
    await navigator.clipboard.writeText(inputText);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 2000);
  }, [inputText]);

  // Clear all
  const handleClear = useCallback(() => {
    setInputText('');
    setOutputText('');
    setReplacementPairs([]);
    setTokenFileContent('');
    setSourceFileName(null);
    setTokenFileName(null);
    setError(null);
    setMatchCount(0);
  }, []);

  // Download output
  const handleDownload = useCallback(() => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `replaced-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [outputText]);

  // Save/export replacement pairs to file
  const handleSaveTokens = useCallback(() => {
    if (replacementPairs.length === 0) return;

    let content: string;
    let extension: string;
    let mimeType: string;

    if (tokenFormat === 'json') {
      const obj: Record<string, string> = {};
      replacementPairs.forEach(pair => {
        if (pair.search) {
          obj[pair.search] = pair.replace;
        }
      });
      content = JSON.stringify(obj, null, 2);
      extension = 'json';
      mimeType = 'application/json';
    } else if (tokenFormat === 'csv') {
      content = replacementPairs
        .filter(pair => pair.search)
        .map(pair => `${pair.search},${pair.replace}`)
        .join('\n');
      extension = 'csv';
      mimeType = 'text/csv';
    } else {
      // Key=Value format
      content = replacementPairs
        .filter(pair => pair.search)
        .map(pair => `${pair.search}=${pair.replace}`)
        .join('\n');
      extension = 'txt';
      mimeType = 'text/plain';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokens-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [replacementPairs, tokenFormat]);

  // Stats
  const stats = useMemo(() => ({
    inputChars: inputText.length,
    outputChars: outputText.length,
    pairsCount: replacementPairs.filter(p => p.enabled).length,
    matchCount,
  }), [inputText, outputText, replacementPairs, matchCount]);

  // Panel header component
  const PanelHeader = ({ title, actions }: { title: string; actions?: React.ReactNode }) => (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-3 text-sm font-medium text-gray-600 dark:text-slate-300">
          {title}
        </span>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Top Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Case Sensitive</span>
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-slate-300">Token Format:</span>
          <select
            value={tokenFormat}
            onChange={(e) => setTokenFormat(e.target.value as 'keyValue' | 'json' | 'csv')}
            className="px-3 py-1.5 rounded-lg text-sm bg-gray-100 dark:bg-slate-700 border border-gray-200/50 dark:border-slate-600/50 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="keyValue">Key=Value</option>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>
        <div className="text-xs text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded">
          Regex mode enabled - Use $1, $2 for backreferences
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left Column - Input & Tokens */}
        <div className="space-y-6">
          {/* Source Text Panel */}
          <div className="flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <PanelHeader
              title={sourceFileName ? `Source - ${sourceFileName}` : 'Source Text'}
              actions={
                <>
                  <input
                    ref={sourceFileRef}
                    type="file"
                    accept=".txt,.html,.xml,.json,.md,.csv,*"
                    onChange={handleSourceFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => sourceFileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 bg-gray-100/50 dark:bg-slate-700/30 hover:bg-gray-200/50 dark:hover:bg-slate-600/30 border border-gray-200/50 dark:border-slate-600/30 transition-all duration-200 text-xs font-medium"
                  >
                    <UploadIcon size={14} />
                    <span>Load File</span>
                  </button>
                  <button
                    onClick={handleCopyInput}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 bg-gray-100/50 dark:bg-slate-700/30 hover:bg-gray-200/50 dark:hover:bg-slate-600/30 border border-gray-200/50 dark:border-slate-600/30 transition-all duration-200 text-xs font-medium"
                  >
                    {copiedInput ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    <span>{copiedInput ? 'Copied!' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20 hover:bg-red-100/50 dark:hover:bg-red-900/30 border border-red-200/50 dark:border-red-500/30 transition-all duration-200 text-xs font-medium"
                  >
                    <TrashIcon size={14} />
                    <span>Clear All</span>
                  </button>
                </>
              }
            />
            <div className="p-4">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter or paste your source text here, or load from file..."
                className="w-full h-48 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200"
              />
            </div>
          </div>

          {/* Token File Panel */}
          <div className="flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <PanelHeader
              title={tokenFileName ? `Tokens - ${tokenFileName}` : 'Replacement Tokens'}
              actions={
                <>
                  <input
                    ref={tokenFileRef}
                    type="file"
                    accept=".txt,.json,.csv,*"
                    onChange={handleTokenFileUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => tokenFileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-slate-300 bg-gray-100/50 dark:bg-slate-700/30 hover:bg-gray-200/50 dark:hover:bg-slate-600/30 border border-gray-200/50 dark:border-slate-600/30 transition-all duration-200 text-xs font-medium"
                  >
                    <UploadIcon size={14} />
                    <span>Load Tokens</span>
                  </button>
                  <button
                    onClick={() => loadTokensFromContent(tokenFileContent)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-500/30 transition-all duration-200 text-xs font-medium"
                  >
                    <SparklesIcon size={14} />
                    <span>Parse Tokens</span>
                  </button>
                </>
              }
            />
            <div className="p-4">
              <textarea
                value={tokenFileContent}
                onChange={(e) => setTokenFileContent(e.target.value)}
                placeholder={`Enter replacement tokens (${tokenFormat === 'keyValue' ? 'key=value per line' : tokenFormat === 'json' ? '{"key": "value"}' : 'search,replace per line'})...`}
                className="w-full h-32 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 dark:focus:ring-indigo-400/50 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Pairs & Output */}
        <div className="space-y-6">
          {/* Replacement Pairs Panel */}
          <div className="flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <PanelHeader
              title={`Replacement Pairs (${replacementPairs.length})`}
              actions={
                <>
                  <button
                    onClick={handleSaveTokens}
                    disabled={replacementPairs.length === 0}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-200/50 dark:border-emerald-500/30 transition-all duration-200 text-xs font-medium"
                  >
                    <SaveIcon size={14} />
                    <span>Save Tokens</span>
                  </button>
                  <button
                    onClick={addReplacementPair}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-500/30 transition-all duration-200 text-xs font-medium"
                  >
                    <PlusIcon size={14} />
                    <span>Add Pair</span>
                  </button>
                </>
              }
            />
            <div className="p-4 max-h-64 overflow-auto">
              {replacementPairs.length === 0 ? (
                <div className="text-center py-6 text-gray-400 dark:text-slate-500 text-sm">
                  No replacement pairs. Load from token file or add manually.
                </div>
              ) : (
                <div className="space-y-2">
                  {replacementPairs.map((pair) => (
                    <div
                      key={pair.id}
                      className={`flex items-center gap-2 p-2 rounded-lg ${
                        pair.enabled
                          ? 'bg-gray-50 dark:bg-slate-800/50'
                          : 'bg-gray-100/50 dark:bg-slate-800/30 opacity-60'
                      } border border-gray-200/50 dark:border-slate-700/50`}
                    >
                      <input
                        type="checkbox"
                        checked={pair.enabled}
                        onChange={(e) => updateReplacementPair(pair.id, 'enabled', e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        value={pair.search}
                        onChange={(e) => updateReplacementPair(pair.id, 'search', e.target.value)}
                        placeholder="Search"
                        className="flex-1 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-700/50 text-gray-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      />
                      <ArrowRightIcon size={14} className="text-gray-400 dark:text-slate-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={pair.replace}
                        onChange={(e) => updateReplacementPair(pair.id, 'replace', e.target.value)}
                        placeholder="Replace (use $1, $2 for groups)"
                        className="flex-1 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-gray-200/50 dark:border-slate-700/50 text-gray-900 dark:text-slate-100 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                      />
                      <button
                        onClick={() => removeReplacementPair(pair.id)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Replace Button */}
          <button
            onClick={performReplacement}
            disabled={!inputText || replacementPairs.filter(p => p.enabled).length === 0}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ReplaceIcon size={18} />
            <span>Replace All</span>
          </button>

          {/* Output Panel */}
          <div className="flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-gray-200/50 dark:border-slate-700/50 shadow-xl overflow-hidden">
            <PanelHeader
              title={`Output ${matchCount > 0 ? `(${matchCount} replacements)` : ''}`}
              actions={
                outputText && (
                  <>
                    <button
                      onClick={handleCopyOutput}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 border border-indigo-200/50 dark:border-indigo-500/30 transition-all duration-200 text-xs font-medium"
                    >
                      {copiedOutput ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                      <span>{copiedOutput ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 border border-emerald-200/50 dark:border-emerald-500/30 transition-all duration-200 text-xs font-medium"
                    >
                      <DownloadIcon size={14} />
                      <span>Download</span>
                    </button>
                  </>
                )
              }
            />
            <div className="p-4">
              <div className="w-full h-48 p-4 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200/50 dark:border-slate-700/50 text-gray-900 dark:text-slate-100 font-mono text-sm overflow-auto whitespace-pre-wrap">
                {outputText || (
                  <span className="text-gray-400 dark:text-slate-500">
                    Replaced output will appear here...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center justify-center gap-6 px-4 py-3 rounded-xl bg-gray-50/50 dark:bg-slate-800/30 border border-gray-200/50 dark:border-slate-700/50 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
          <span className="font-medium">Input:</span>
          <span>{stats.inputChars.toLocaleString()} chars</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
          <span className="font-medium">Output:</span>
          <span>{stats.outputChars.toLocaleString()} chars</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
          <span className="font-medium">Pairs:</span>
          <span>{stats.pairsCount}</span>
        </div>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <span className="font-medium">Matches:</span>
          <span>{stats.matchCount}</span>
        </div>
      </div>
    </div>
  );
};

// Additional icons needed for this component
const UploadIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const DownloadIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PlusIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ArrowRightIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const ReplaceIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6" />
    <path d="M9.5 11.5L11 13L21 3" />
  </svg>
);

const SaveIcon: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

export default TextReplacer;
