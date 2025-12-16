'use client';
import React, { useState } from 'react';
import { useTextCaseConverter } from '../hooks/useTextCaseConverter';
import { CaseSelector } from './CaseSelector';
import { TextInput } from './TextInput';
import { TextOutput } from './TextOutput';
import { QuickExamples } from './QuickExamples';
import { Notification } from './Notification';

const DEFAULT_TEXT = `Hello World! This is a sample text.
You can convert it to different text cases.`;

/**
 * Main Text Case Converter Component
 * Refactored following SOLID principles and design patterns:
 *
 * - Single Responsibility: Component only orchestrates sub-components
 * - Open/Closed: Easy to extend with new case types without modifying existing code
 * - Dependency Inversion: Depends on abstractions (hook) rather than concrete implementations
 * - Strategy Pattern: Different case conversion strategies
 * - Factory Pattern: Strategy creation encapsulated in factory
 * - Separation of Concerns: Business logic in service layer, UI in components
 */
const TextCaseConverter: React.FC = () => {
  const {
    inputText,
    outputText,
    selectedCase,
    availableOptions,
    inputStats,
    outputStats,
    updateInputText,
    updateSelectedCase,
    copyToClipboard,
    pasteFromClipboard,
    clearInput,
  } = useTextCaseConverter(DEFAULT_TEXT);

  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const handleCopy = async () => {
    const success = await copyToClipboard();
    setNotification({
      message: success ? 'Text copied to clipboard!' : 'Failed to copy text',
      type: success ? 'success' : 'error',
    });
  };

  const handlePaste = async () => {
    const success = await pasteFromClipboard();
    setNotification({
      message: success ? 'Text pasted from clipboard!' : 'Failed to read clipboard',
      type: success ? 'success' : 'error',
    });
  };

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="space-y-6">
        <CaseSelector
          selectedCase={selectedCase}
          options={availableOptions}
          onChange={updateSelectedCase}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TextInput
            value={inputText}
            onChange={updateInputText}
            onPaste={handlePaste}
            onClear={clearInput}
            stats={inputStats}
          />

          <TextOutput
            value={outputText}
            onCopy={handleCopy}
            stats={outputStats}
          />
        </div>

        <QuickExamples options={availableOptions} />
      </div>
    </>
  );
};

export default TextCaseConverter;