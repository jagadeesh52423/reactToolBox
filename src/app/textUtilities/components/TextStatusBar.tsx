'use client';
import React from 'react';

interface TextStats {
  characters: number;
  words: number;
  lines: number;
  sentences: number;
}

interface TextStatusBarProps {
  inputStats: TextStats;
  outputStats: TextStats;
  hasOutput: boolean;
}

const TextStatusBar: React.FC<TextStatusBarProps> = ({ inputStats, outputStats, hasOutput }) => {
  return (
    <footer className="px-6 py-3 border-t border-gray-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
      <div className="flex items-center justify-between text-xs">
        {/* Input Stats */}
        <div className="flex items-center gap-6">
          <span className="font-medium text-gray-500 dark:text-slate-400">Input:</span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 dark:text-slate-500">Characters:</span>
              <span className="font-mono font-medium text-gray-700 dark:text-slate-300">
                {inputStats.characters.toLocaleString()}
              </span>
            </div>
            <div className="w-px h-3 bg-gray-300 dark:bg-slate-600" />
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 dark:text-slate-500">Words:</span>
              <span className="font-mono font-medium text-gray-700 dark:text-slate-300">
                {inputStats.words.toLocaleString()}
              </span>
            </div>
            <div className="w-px h-3 bg-gray-300 dark:bg-slate-600" />
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 dark:text-slate-500">Lines:</span>
              <span className="font-mono font-medium text-gray-700 dark:text-slate-300">
                {inputStats.lines.toLocaleString()}
              </span>
            </div>
            <div className="w-px h-3 bg-gray-300 dark:bg-slate-600" />
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 dark:text-slate-500">Sentences:</span>
              <span className="font-mono font-medium text-gray-700 dark:text-slate-300">
                {inputStats.sentences.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Output Stats */}
        {hasOutput && (
          <div className="flex items-center gap-6">
            <span className="font-medium text-indigo-500 dark:text-indigo-400">Output:</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 dark:text-slate-500">Characters:</span>
                <span className="font-mono font-medium text-indigo-600 dark:text-indigo-300">
                  {outputStats.characters.toLocaleString()}
                </span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-slate-600" />
              <div className="flex items-center gap-1.5">
                <span className="text-gray-400 dark:text-slate-500">Words:</span>
                <span className="font-mono font-medium text-indigo-600 dark:text-indigo-300">
                  {outputStats.words.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

export default TextStatusBar;
