'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import InputPanel from './InputPanel';
import ResultsPanel from './ResultsPanel';
import {
  parseInput,
  computeConversions,
  getLocalTimezone,
  ConversionResult,
} from '../utils/timestampUtils';

/**
 * TimestampConverterTool
 *
 * Main orchestrator for the Timestamp Converter.
 * Manages shared state (input, currentTime, timezone, parsed date) and
 * delegates rendering to InputPanel and ResultsPanel.
 */
export default function TimestampConverterTool() {
  const [input, setInput] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [timezone, setTimezone] = useState<string>(getLocalTimezone());
  const [error, setError] = useState<string | null>(null);

  // Live-updating clock
  useEffect(() => {
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

  // Compute conversions from parsedDate
  const conversions = useMemo<ConversionResult[]>(() => {
    if (!parsedDate) return [];
    return computeConversions(parsedDate, timezone);
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

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
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
            <ResultsPanel conversions={conversions} />
          </div>
        </div>
      </main>
    </div>
  );
}
