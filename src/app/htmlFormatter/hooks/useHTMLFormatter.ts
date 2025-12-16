import { useState, useCallback, useMemo } from 'react';
import { HTMLFormattingService } from '../services/HTMLFormattingService';
import { FormatOptions } from '../models/HTMLToken';
import { ValidationResult } from '../validators/HTMLValidator';

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
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);

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

      // First validate
      const validation = formattingService.validateHTML(inputHTML);
      setValidationResult(validation);

      // Then format
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
      setValidationResult(null);
    }
  }, [inputHTML, formatOptions, formattingService]);

  // Validate HTML only (without formatting)
  const validateHTMLOnly = useCallback(() => {
    try {
      const validation = formattingService.validateHTML(inputHTML);
      setValidationResult(validation);
      return validation;
    } catch {
      const errorResult: ValidationResult = {
        valid: false,
        errors: [{ type: 'error', message: 'Failed to validate HTML' }],
        warnings: [],
        info: [],
      };
      setValidationResult(errorResult);
      return errorResult;
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
    setValidationResult(null);
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
    validationResult,

    // Actions
    updateInput,
    updateIndentSize,
    formatHTML,
    validateHTMLOnly,
    copyToClipboard,
    clearInput,
  };
};
