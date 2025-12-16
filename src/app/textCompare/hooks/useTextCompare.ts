import { useState, useCallback, useMemo } from 'react';
import { TextCompareService } from '../services/TextCompareService';
import { DiffResult, DiffStatistics, DiffOptions } from '../models/DiffModels';

/**
 * Custom hook for text comparison logic
 * Separates business logic from UI components
 */
export const useTextCompare = (defaultLeftText: string = '', defaultRightText: string = '') => {
  const [leftText, setLeftText] = useState<string>(defaultLeftText);
  const [rightText, setRightText] = useState<string>(defaultRightText);
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);
  const [statistics, setStatistics] = useState<DiffStatistics | null>(null);
  const [showDiff, setShowDiff] = useState<boolean>(false);
  const [options, setOptions] = useState<DiffOptions>({
    ignoreWhitespace: false,
    ignoreCase: false,
  });

  // Create service instance once
  const compareService = useMemo(() => new TextCompareService(), []);

  // Compute diff
  const computeDiff = useCallback(() => {
    const result = compareService.compareTexts(leftText, rightText, options);
    const stats = compareService.calculateStatistics(result);

    setDiffResult(result);
    setStatistics(stats);
    setShowDiff(true);
  }, [leftText, rightText, options, compareService]);

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

  // Update options
  const updateOptions = useCallback((newOptions: Partial<DiffOptions>) => {
    setOptions((prev) => ({ ...prev, ...newOptions }));
    // Re-compute diff if it's currently showing
    if (showDiff) {
      const result = compareService.compareTexts(leftText, rightText, { ...options, ...newOptions });
      const stats = compareService.calculateStatistics(result);
      setDiffResult(result);
      setStatistics(stats);
    }
  }, [showDiff, leftText, rightText, options, compareService]);

  // Swap texts
  const swapTexts = useCallback(() => {
    setLeftText(rightText);
    setRightText(leftText);
    clearComparison();
  }, [leftText, rightText, clearComparison]);

  return {
    // State
    leftText,
    rightText,
    diffResult,
    statistics,
    showDiff,
    options,

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
