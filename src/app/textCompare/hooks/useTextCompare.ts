import { useState, useCallback, useMemo, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { TextCompareService } from '../services/TextCompareService';
import { DiffResult, DiffStatistics, DiffOptions } from '../models/DiffModels';
import { shouldPauseAutoDiff } from '../utils/autoDiffGuard';

const AUTO_DIFF_DEBOUNCE_MS = 250;

/**
 * Custom hook for text comparison logic
 * Separates business logic from UI components
 */
export const useTextCompare = (defaultLeftText: string = '', defaultRightText: string = '') => {
  const [leftText, setLeftText] = useLocalStorage<string>('reactToolBox_textCompare_left', defaultLeftText);
  const [rightText, setRightText] = useLocalStorage<string>('reactToolBox_textCompare_right', defaultRightText);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [statistics, setStatistics] = useState<DiffStatistics | null>(null);
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [isAutoDiffPaused, setIsAutoDiffPaused] = useState<boolean>(false);
  const [options, setOptions] = useState<DiffOptions>({
    ignoreWhitespace: false,
    ignoreCase: false,
    contextLines: 3,
    granularity: 'word',
  });

  // Create service instance once
  const compareService = useMemo(() => new TextCompareService(), []);

  const runDiff = useCallback(() => {
    const result = compareService.compareTexts(leftText, rightText, options);
    const stats = compareService.calculateStatistics(result);
    setDiffResult(result);
    setStatistics(stats);
    setShowDiff(true);
  }, [leftText, rightText, options, compareService]);

  // Manual "Compare" trigger — bypasses the debounce; also the only way to diff while
  // auto-diff is paused for a large input.
  const computeDiff = useCallback(() => {
    runDiff();
  }, [runDiff]);

  // Clear comparison
  const clearComparison = useCallback(() => {
    setDiffResult(null);
    setStatistics(null);
    setShowDiff(false);
  }, []);

  // Reset texts
  const resetTexts = useCallback(() => {
    setLeftText('');
    setRightText('');
    clearComparison();
  }, [clearComparison]);

  // Update options (recompute is picked up by the auto-diff effect below)
  const updateOptions = useCallback((newOptions: Partial<DiffOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }));
  }, []);

  // Swap texts
  const swapTexts = useCallback(() => {
    setLeftText(rightText);
    setRightText(leftText);
    clearComparison();
  }, [leftText, rightText, clearComparison]);

  // Real-time debounced diff: recomputes automatically as text/options change. Large
  // inputs pause auto-diff and leave the last result in place until a manual Compare.
  useEffect(() => {
    if (!leftText && !rightText) {
      setIsAutoDiffPaused(false);
      clearComparison();
      return;
    }

    if (shouldPauseAutoDiff(leftText, rightText)) {
      setIsAutoDiffPaused(true);
      return;
    }
    setIsAutoDiffPaused(false);

    const timeoutId = setTimeout(runDiff, AUTO_DIFF_DEBOUNCE_MS);
    return () => clearTimeout(timeoutId);
  }, [leftText, rightText, runDiff, clearComparison]);

  return {
    // State
    leftText,
    rightText,
    diffResult,
    statistics,
    showDiff,
    options,
    isAutoDiffPaused,

    // Actions
    setLeftText,
    setRightText,
    computeDiff,
    clearComparison,
    resetTexts,
    updateOptions,
    swapTexts,
    compareService, // Exposed for word-level diff
  };
};
