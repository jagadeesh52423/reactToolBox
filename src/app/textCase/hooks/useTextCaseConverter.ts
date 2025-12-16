import { useState, useEffect, useMemo, useCallback } from 'react';
import { TextCaseService } from '../services/TextCaseService';
import { TextCaseType, TextStats } from '../models/TextCaseType';

/**
 * Custom hook for text case conversion logic
 * Separates business logic from UI components following the Separation of Concerns principle
 *
 * This hook encapsulates:
 * - State management for input/output text
 * - Text conversion logic
 * - Clipboard operations
 * - Text statistics calculation
 */
export const useTextCaseConverter = (defaultText: string = '') => {
  const [inputText, setInputText] = useState<string>(defaultText);
  const [selectedCase, setSelectedCase] = useState<TextCaseType>(TextCaseType.UPPERCASE);
  const [outputText, setOutputText] = useState<string>('');

  // Create service instance once using useMemo
  const textCaseService = useMemo(() => new TextCaseService(), []);

  // Get available options from service
  const availableOptions = useMemo(
    () => textCaseService.getAvailableOptions(),
    [textCaseService]
  );

  // Calculate input stats
  const inputStats = useMemo(
    (): TextStats => textCaseService.calculateStats(inputText),
    [inputText, textCaseService]
  );

  // Calculate output stats
  const outputStats = useMemo(
    (): TextStats => textCaseService.calculateStats(outputText),
    [outputText, textCaseService]
  );

  // Convert text whenever input or selected case changes
  useEffect(() => {
    const converted = textCaseService.convertText(inputText, selectedCase);
    setOutputText(converted);
  }, [inputText, selectedCase, textCaseService]);

  // Handle clipboard copy
  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(outputText);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, [outputText]);

  // Handle clipboard paste
  const pasteFromClipboard = useCallback(async (): Promise<boolean> => {
    try {
      const text = await navigator.clipboard.readText();
      setInputText(text);
      return true;
    } catch (error) {
      console.error('Failed to read from clipboard:', error);
      return false;
    }
  }, []);

  // Clear input
  const clearInput = useCallback(() => {
    setInputText('');
    setOutputText('');
  }, []);

  // Update input text
  const updateInputText = useCallback((text: string) => {
    setInputText(text);
  }, []);

  // Update selected case
  const updateSelectedCase = useCallback((caseType: TextCaseType) => {
    setSelectedCase(caseType);
  }, []);

  return {
    // State
    inputText,
    outputText,
    selectedCase,
    availableOptions,
    inputStats,
    outputStats,

    // Actions
    updateInputText,
    updateSelectedCase,
    copyToClipboard,
    pasteFromClipboard,
    clearInput,
  };
};
