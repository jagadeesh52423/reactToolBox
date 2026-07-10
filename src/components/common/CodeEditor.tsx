'use client';

import React, { useRef, useCallback, useMemo, forwardRef } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
  onScroll?: (event: React.UIEvent<HTMLTextAreaElement>) => void;
}

/**
 * Common CodeEditor Component
 *
 * Reusable code editor with line numbers and syntax highlighting support.
 * Used across different tools for consistent editing experience.
 * Forwards its ref to the underlying textarea for callers that need DOM access
 * (e.g. cursor-driven insertions, scroll sync).
 */
const CodeEditor = forwardRef<HTMLTextAreaElement, CodeEditorProps>(function CodeEditor(
  { value, onChange, placeholder = 'Enter code here...', className = '', readOnly = false, onScroll },
  forwardedRef
) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const setTextareaRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      internalRef.current = node;
      if (typeof forwardedRef === 'function') {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef]
  );

  // Calculate line numbers
  const lineCount = value.split('\n').length;
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1),
    [lineCount]
  );

  // Sync scroll between line numbers and textarea
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLTextAreaElement>) => {
      if (internalRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = internalRef.current.scrollTop;
      }
      onScroll?.(event);
    },
    [onScroll]
  );

  return (
    <div className={`h-full w-full flex overflow-hidden ${className}`}>
      {/* Line Numbers */}
      <div
        ref={lineNumbersRef}
        className="w-12 bg-gray-100/50 dark:bg-slate-900/50 border-r border-gray-200/30 dark:border-slate-700/30 overflow-hidden select-none flex-shrink-0"
        style={{ overflowY: 'hidden' }}
      >
        <div className="py-4 pr-3 text-right">
          {lineNumbers.map((num) => (
            <div
              key={num}
              className="font-mono text-xs text-gray-400 dark:text-slate-600 leading-6"
              style={{ height: '24px' }}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Code Editor Textarea */}
      <textarea
        ref={setTextareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        readOnly={readOnly}
        className="flex-1 h-full px-4 py-4 font-mono text-sm bg-transparent text-gray-900 dark:text-slate-100 resize-none outline-none overflow-auto"
        placeholder={placeholder}
        spellCheck={false}
        style={{
          tabSize: 2,
          lineHeight: '24px'
        }}
      />
    </div>
  );
});

export default CodeEditor;
