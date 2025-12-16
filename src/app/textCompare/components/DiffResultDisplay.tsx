'use client';
import React from 'react';
import { DiffResult, DiffType } from '../models/DiffModels';
import { DiffLineDisplay } from './DiffLineDisplay';
import { TextCompareService } from '../services/TextCompareService';

interface DiffResultDisplayProps {
  diffResult: DiffResult;
  compareService: TextCompareService;
}

/**
 * Component for displaying the complete diff result
 * Follows Single Responsibility Principle
 */
export const DiffResultDisplay: React.FC<DiffResultDisplayProps> = ({
  diffResult,
  compareService,
}) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Differences</h2>

      <div className="flex flex-col lg:flex-row gap-4 border rounded-lg overflow-hidden shadow-sm">
        {/* Left Side */}
        <div className="w-full lg:w-1/2 border-r">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 font-semibold border-b text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Original Text
          </div>
          <div className="max-h-96 overflow-auto">
            {diffResult.left.map((line, index) => {
              // Compute word-level diff for changed lines
              const rightLine = diffResult.right[index];
              const wordDiff =
                line.type === DiffType.CHANGED && rightLine?.text
                  ? compareService.compareWords(line.text, rightLine.text).left
                  : undefined;

              return (
                <DiffLineDisplay
                  key={`left-${index}`}
                  line={line}
                  wordDiff={wordDiff}
                />
              );
            })}
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-1/2">
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-3 font-semibold border-b text-gray-800 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Modified Text
          </div>
          <div className="max-h-96 overflow-auto">
            {diffResult.right.map((line, index) => {
              // Compute word-level diff for changed lines
              const leftLine = diffResult.left[index];
              const wordDiff =
                line.type === DiffType.CHANGED && leftLine?.text
                  ? compareService.compareWords(leftLine.text, line.text).right
                  : undefined;

              return (
                <DiffLineDisplay
                  key={`right-${index}`}
                  line={line}
                  wordDiff={wordDiff}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-red-100 border border-red-300 rounded"></div>
            <span className="text-sm font-medium text-gray-700">Removed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm font-medium text-gray-700">Added</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span className="text-sm font-medium text-gray-700">Modified</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-300 border border-yellow-400 rounded"></div>
            <span className="text-sm font-medium text-gray-700">Word-level changes</span>
          </div>
        </div>
      </div>
    </div>
  );
};
