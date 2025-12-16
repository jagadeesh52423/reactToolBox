'use client';
import React from 'react';
import { useTextCompare } from '../hooks/useTextCompare';
import { TextInputPanel } from './TextInputPanel';
import { CompareControls } from './CompareControls';
import { DiffStatisticsDisplay } from './DiffStatisticsDisplay';
import { DiffResultDisplay } from './DiffResultDisplay';

const DEFAULT_TEXT_LEFT = `This is a sample text.
It has multiple lines.
We will compare this with another text.
This line will be removed.
This line will stay the same.`;

const DEFAULT_TEXT_RIGHT = `This is a sample text.
It has multiple lines with some changes.
We will compare this with another text.
This line will stay the same.
This is a new line added to the right text.`;

/**
 * Main Text Diff Viewer Component (Refactored)
 *
 * Refactored following SOLID principles and design patterns:
 *
 * - Single Responsibility: Component only orchestrates sub-components
 * - Open/Closed: Easy to extend with new diff algorithms
 * - Dependency Inversion: Depends on abstractions (hook, services)
 * - Strategy Pattern: Different diff algorithms (currently LineDiff)
 * - Service Layer: Business logic separated from UI
 * - Separation of Concerns: Algorithm, Service, Hook, Components are separate
 *
 * Architecture:
 * - Algorithm: LineDiffAlgorithm with look-ahead optimization
 * - WordDiffProcessor: LCS-based word-level diff (O(m*n) dynamic programming)
 * - Service: TextCompareService coordinates diff operations
 * - Hook: useTextCompare manages state and business logic
 * - Components: Focused UI components with single responsibilities
 */
const TextDiffViewer: React.FC = () => {
  const {
    leftText,
    rightText,
    diffResult,
    statistics,
    showDiff,
    options,
    setLeftText,
    setRightText,
    computeDiff,
    resetTexts,
    updateOptions,
    swapTexts,
    compareService,
  } = useTextCompare(DEFAULT_TEXT_LEFT, DEFAULT_TEXT_RIGHT);

  return (
    <div className="flex flex-col gap-6">
      {/* Input Panels */}
      <div className="flex flex-col lg:flex-row gap-4">
        <TextInputPanel
          title="Original Text"
          value={leftText}
          onChange={setLeftText}
          placeholder="Enter original text here..."
        />
        <TextInputPanel
          title="Modified Text"
          value={rightText}
          onChange={setRightText}
          placeholder="Enter modified text here..."
        />
      </div>

      {/* Controls */}
      <CompareControls
        onCompare={computeDiff}
        onSwap={swapTexts}
        onReset={resetTexts}
        options={options}
        onOptionsChange={updateOptions}
        disabled={!leftText && !rightText}
      />

      {/* Statistics */}
      {showDiff && statistics && (
        <DiffStatisticsDisplay statistics={statistics} />
      )}

      {/* Diff Result */}
      {showDiff && diffResult && (
        <DiffResultDisplay diffResult={diffResult} compareService={compareService} />
      )}
    </div>
  );
};

export default TextDiffViewer;
