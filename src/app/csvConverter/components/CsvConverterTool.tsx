'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import ControlBar from './ControlBar';
import InputPanel from './InputPanel';
import OutputPanel from './OutputPanel';
import { parseCSV, serializeCSV, type ParsedData } from '../utils/csvParser';
import { parseJSON, serializeJSON } from '../utils/jsonToCsv';
import { parseYAML, serializeYAML } from '../utils/yamlParser';

type Format = 'csv' | 'json' | 'yaml';
type Delimiter = ',' | '\t' | ';' | '|';

const MIME_TYPES: Record<Format, string> = {
  csv: 'text/csv',
  json: 'application/json',
  yaml: 'text/yaml',
};

const FILE_EXTENSIONS: Record<Format, string> = {
  csv: 'csv',
  json: 'json',
  yaml: 'yaml',
};

/**
 * CsvConverterTool Component
 *
 * Main orchestrator for the CSV/JSON/YAML converter tool.
 * Manages format selection, parsing, conversion, and output generation.
 */
export default function CsvConverterTool() {
  const [input, setInput] = useLocalStorage<string>('reactToolBox_csvConverter_input', '');
  const [inputFormat, setInputFormat] = useLocalStorage<Format>('reactToolBox_csvConverter_inputFmt', 'csv');
  const [outputFormat, setOutputFormat] = useLocalStorage<Format>('reactToolBox_csvConverter_outputFmt', 'json');
  const [delimiter, setDelimiter] = useState<Delimiter>(',');

  // Parse input and convert to output
  const { output, parsedData, headers, error } = useMemo(() => {
    if (!input.trim()) {
      return {
        output: '',
        parsedData: [] as Record<string, string>[],
        headers: [] as string[],
        error: null as string | null,
      };
    }

    let parsed: ParsedData;

    try {
      // Parse input based on inputFormat
      switch (inputFormat) {
        case 'csv':
          parsed = parseCSV(input, delimiter);
          break;
        case 'json':
          parsed = parseJSON(input);
          break;
        case 'yaml':
          parsed = parseYAML(input);
          break;
        default:
          parsed = { headers: [], rows: [] };
      }

      if (parsed.headers.length === 0) {
        return {
          output: '',
          parsedData: [],
          headers: [],
          error: 'No data found. Check the input format.',
        };
      }

      // Serialize output based on outputFormat
      let outputText: string;
      switch (outputFormat) {
        case 'csv':
          outputText = serializeCSV(parsed, delimiter);
          break;
        case 'json':
          outputText = serializeJSON(parsed);
          break;
        case 'yaml':
          outputText = serializeYAML(parsed);
          break;
        default:
          outputText = '';
      }

      return {
        output: outputText,
        parsedData: parsed.rows,
        headers: parsed.headers,
        error: null,
      };
    } catch (err) {
      return {
        output: '',
        parsedData: [],
        headers: [],
        error: err instanceof Error ? err.message : 'An unexpected error occurred',
      };
    }
  }, [input, inputFormat, outputFormat, delimiter]);

  const handleCopy = useCallback(() => {
    if (output) {
      navigator.clipboard.writeText(output).catch(() => {
        // Silently fail if clipboard access is denied
      });
    }
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;

    try {
      const blob = new Blob([output], { type: MIME_TYPES[outputFormat] });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted.${FILE_EXTENSIONS[outputFormat]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Silently fail if download fails
    }
  }, [output, outputFormat]);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  return (
    <div className="h-[var(--tool-content-height)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Control Bar */}
      <ControlBar
        inputFormat={inputFormat}
        outputFormat={outputFormat}
        delimiter={delimiter}
        onInputFormatChange={setInputFormat}
        onOutputFormatChange={setOutputFormat}
        onDelimiterChange={setDelimiter}
        onDownload={handleDownload}
        hasOutput={!!output}
      />

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-hidden min-h-0">
        <div className="w-full h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Panel - Input */}
            <InputPanel
              value={input}
              onChange={setInput}
              inputFormat={inputFormat}
              onClear={handleClear}
            />

            {/* Right Panel - Output */}
            <OutputPanel
              value={output}
              headers={headers}
              rows={parsedData}
              error={error}
              onCopy={handleCopy}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
