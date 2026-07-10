'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import InputPanel from './InputPanel';
import ResultsPanel from './ResultsPanel';
import {
  parseInput,
  computeConversions,
  getLocalTimezone,
  ConversionResult,
} from '../utils/timestampUtils';

const MAX_COMPARISON_TIMEZONES = 8;

/**
 * TimestampConverterTool
 *
 * Main orchestrator for the Timestamp Converter.
 * Manages shared state (input, currentTime, timezone, parsed date) and
 * delegates rendering to InputPanel and ResultsPanel.
 */
export default function TimestampConverterTool() {
  const searchParams = useSearchParams();
  const urlTs = searchParams.get('ts');

  const [storedInput, setStoredInput] = useLocalStorage<string>('reactToolBox_timestamp_input', '');
  // getLocalTimezone() reflects the browser's locale and differs from the SSR/build
  // machine's timezone in production, so it must never be an eager default (it would
  // reintroduce the hydration mismatch this batch of tools fixes). Both this and
  // `timezone` below start at '' and only resolve to a real zone post-mount.
  const [storedTz, setStoredTz] = useLocalStorage<string>('reactToolBox_timestamp_tz', '');

  const [input, setInputRaw] = useState<string>(urlTs || '');
  // Starts null so the SSR-rendered markup and the first client render match exactly;
  // the live value is only populated after mount (see the effect below), which is what
  // avoids the "Current Time" hydration mismatch.
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [timezone, setTimezoneRaw] = useState<string>('');

  const [multiTimezones, setMultiTimezones] = useLocalStorage<string[]>('reactToolBox_timestamp_multiTz', []);
  const [customFormat, setCustomFormat] = useLocalStorage<string>(
    'reactToolBox_timestamp_customFormat',
    'YYYY-MM-DD HH:mm:ss'
  );

  // Restore from localStorage when no URL param is present (after hydration).
  // The timezone resolution re-fires whenever storedTz changes, so it correctly
  // settles on the restored value even though it first runs before storedTz's own
  // localStorage restore has landed (see the identical pattern in CronParserTool).
  useEffect(() => {
    if (!urlTs && storedInput) {
      setInputRaw(storedInput);
    }
    setTimezoneRaw(storedTz || getLocalTimezone());
  }, [storedInput, storedTz, urlTs]);

  // Wrap setters to also persist to localStorage
  const setInput = useCallback((value: string) => {
    setInputRaw(value);
    setStoredInput(value);
  }, [setStoredInput]);

  const setTimezone = useCallback((value: string) => {
    setTimezoneRaw(value);
    setStoredTz(value);
  }, [setStoredTz]);
  const [error, setError] = useState<string | null>(null);

  // Live-updating clock. Runs client-only (post-mount) so the "Current Time" panel
  // never renders a volatile value during SSR.
  useEffect(() => {
    setCurrentTime(new Date());
    const id = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Parse the user input into a Date
  const parsedDate = useMemo<Date | null>(() => {
    if (!input.trim()) return null;
    const result = parseInput(input);
    return result;
  }, [input]);

  // Set or clear error when parsedDate changes
  useEffect(() => {
    if (input.trim() && !parsedDate) {
      setError('Unable to parse input as a valid date or timestamp.');
    } else {
      setError(null);
    }
  }, [input, parsedDate]);

  // Compute conversions from parsedDate. Falls back to UTC during the brief window
  // (only reachable via a preloaded ?ts= URL param) before the post-mount effect
  // above resolves `timezone` from '' to a real zone.
  const conversions = useMemo<ConversionResult[]>(() => {
    if (!parsedDate) return [];
    return computeConversions(parsedDate, timezone || 'UTC');
  }, [parsedDate, timezone, currentTime]); // eslint-disable-line react-hooks/exhaustive-deps
  // currentTime dependency refreshes relative time every second

  const handleUseCurrentTime = useCallback(() => {
    setInput(String(Math.floor(Date.now() / 1000)));
  }, []);

  const handleDatePickerChange = useCallback((value: string) => {
    if (!value) return;
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      setInput(d.toISOString());
    }
  }, []);

  const handleAddTimezone = useCallback((tz: string) => {
    const trimmed = tz.trim();
    if (!trimmed) return;
    setMultiTimezones((prev) => {
      if (prev.includes(trimmed) || prev.length >= MAX_COMPARISON_TIMEZONES) return prev;
      return [...prev, trimmed];
    });
  }, [setMultiTimezones]);

  const handleRemoveTimezone = useCallback((tz: string) => {
    setMultiTimezones((prev) => prev.filter((entry) => entry !== tz));
  }, [setMultiTimezones]);

  return (
    <div className="h-[var(--tool-content-height)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <main className="flex-1 p-6 overflow-hidden min-h-0">
        <div className="w-full h-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Left Panel - Input */}
            <InputPanel
              input={input}
              currentTime={currentTime}
              timezone={timezone}
              error={error}
              onInputChange={setInput}
              onTimezoneChange={setTimezone}
              onUseCurrentTime={handleUseCurrentTime}
              onDatePickerChange={handleDatePickerChange}
            />

            {/* Right Panel - Results */}
            <ResultsPanel
              conversions={conversions}
              parsedDate={parsedDate}
              timezone={timezone}
              multiTimezones={multiTimezones}
              onAddTimezone={handleAddTimezone}
              onRemoveTimezone={handleRemoveTimezone}
              customFormat={customFormat}
              onCustomFormatChange={setCustomFormat}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
