import { useState, useCallback, useMemo } from 'react';
import { HTMLFormattingService } from '../services/HTMLFormattingService';
import { FormatOptions } from '../models/HTMLToken';

/**
 * Custom hook for HTML formatting logic
 * Separates business logic from UI components
 */
export const useHTMLFormatter = (defaultHTML: string = '') => {
  const [inputHTML, setInputHTML] = useState<string>(defaultHTML);
  const [formattedHTML, setFormattedHTML] = useState<string>('');
  const [highlightedHTML, setHighlightedHTML] = useState<string>('');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [error, setError] = useState<string>('');
  const [showOutput, setShowOutput] = useState<boolean>(false);

  // Create service instance once
  const formattingService = useMemo(() => new HTMLFormattingService(), []);

  // Format options
  const formatOptions = useMemo(
    (): FormatOptions => ({
      indentSize,
      preserveInlineContent: true,
    }),
    [indentSize]
  );

  // Input statistics
  const inputStats = useMemo(() => {
    if (!inputHTML) {
      return { characters: 0, lines: 0, tags: 0, tokens: 0 };
    }
    try {
      return formattingService.getStatistics(inputHTML);
    } catch {
      return { characters: inputHTML.length, lines: 1, tags: 0, tokens: 0 };
    }
  }, [inputHTML, formattingService]);

  // Output statistics
  const outputStats = useMemo(() => {
    if (!formattedHTML) {
      return { characters: 0, lines: 0, tags: 0, tokens: 0 };
    }
    try {
      return formattingService.getStatistics(formattedHTML);
    } catch {
      return { characters: formattedHTML.length, lines: 1, tags: 0, tokens: 0 };
    }
  }, [formattedHTML, formattingService]);

  // Format HTML
  const formatHTML = useCallback(() => {
    try {
      setError('');
      const result = formattingService.formatAndHighlight(inputHTML, formatOptions);
      setFormattedHTML(result.formatted);
      setHighlightedHTML(result.highlighted);
      setShowOutput(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setShowOutput(false);
      setFormattedHTML('');
      setHighlightedHTML('');
    }
  }, [inputHTML, formatOptions, formattingService]);

  // Validate HTML
  const validateHTML = useCallback(() => {
    try {
      return formattingService.validateHTML(inputHTML);
    } catch {
      return { valid: false, errors: ['Failed to validate HTML'] };
    }
  }, [inputHTML, formattingService]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(formattedHTML);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }, [formattedHTML]);

  // Clear input
  const clearInput = useCallback(() => {
    setInputHTML('');
    setFormattedHTML('');
    setHighlightedHTML('');
    setError('');
    setShowOutput(false);
  }, []);

  // Update input
  const updateInput = useCallback((html: string) => {
    setInputHTML(html);
    setError(''); // Clear error when input changes
  }, []);

  // Update indent size
  const updateIndentSize = useCallback((size: number) => {
    setIndentSize(size);
  }, []);

  return {
    // State
    inputHTML,
    formattedHTML,
    highlightedHTML,
    indentSize,
    error,
    showOutput,
    inputStats,
    outputStats,

    // Actions
    updateInput,
    updateIndentSize,
    formatHTML,
    validateHTML,
    copyToClipboard,
    clearInput,
  };
};
