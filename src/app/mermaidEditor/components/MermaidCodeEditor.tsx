'use client';

import React, { useRef, useCallback, useMemo } from 'react';

interface MermaidCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

/**
 * Mermaid Code Editor with Syntax Highlighting
 *
 * Uses the overlay technique: a transparent textarea overlays a syntax-highlighted <pre><code> element.
 * Both scroll in sync, providing live syntax highlighting for Mermaid diagram code.
 */
export default function MermaidCodeEditor({
  value,
  onChange,
  placeholder = 'Enter Mermaid code here...',
  className = '',
  readOnly = false
}: MermaidCodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);

  const lineCount = value.split('\n').length;
  const lineNumbers = useMemo(
    () => Array.from({ length: lineCount }, (_, i) => i + 1),
    [lineCount]
  );

  // Sync scroll between all three elements
  const handleScroll = useCallback(() => {
    if (editorRef.current && lineNumbersRef.current && highlightRef.current) {
      const scrollTop = editorRef.current.scrollTop;
      const scrollLeft = editorRef.current.scrollLeft;
      lineNumbersRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
    }
  }, []);

  // Escape HTML entities to prevent XSS
  const escapeHtml = (text: string): string => {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
  };

  // Syntax highlighting function
  const highlightMermaidSyntax = useCallback((code: string): string => {
    if (!code) return '';

    // First, escape HTML entities to prevent XSS
    let highlighted = escapeHtml(code);

    // Keywords (graph types, diagram types)
    const keywords = [
      'graph', 'flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram', 'stateDiagram-v2',
      'erDiagram', 'gantt', 'pie', 'journey', 'gitGraph', 'mindmap', 'timeline',
      'subgraph', 'end', 'section', 'title', 'dateFormat', 'axisFormat'
    ];
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b(${keyword})\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="syntax-keyword">$1</span>`);
    });

    // Direction keywords
    const directions = ['TD', 'TB', 'BT', 'RL', 'LR'];
    directions.forEach(dir => {
      const regex = new RegExp(`\\b(${dir})\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="syntax-direction">$1</span>`);
    });

    // Style and classDef declarations
    highlighted = highlighted.replace(
      /\b(style|classDef|class|click)\b/g,
      '<span class="syntax-style">$1</span>'
    );

    // Arrows and connections
    highlighted = highlighted.replace(
      /(-->|---|-\.-|==>|<-->|<--->|<-\.-|<==|\.->|o--o|x--x|\|[^|]+\|)/g,
      '<span class="syntax-arrow">$1</span>'
    );

    // Edge labels with pipes: |text|
    highlighted = highlighted.replace(
      /\|([^|]+)\|/g,
      '<span class="syntax-edge-label">|$1|</span>'
    );

    // Node shapes: [], {}, (), (()), ([]), [[]], [(])
    highlighted = highlighted.replace(
      /(\[\[|\]\]|\[\(|\)\]|\(\[|\]\)|\[|\]|\{|\}|\(\(|\)\)|\(|\))/g,
      '<span class="syntax-node-shape">$1</span>'
    );

    // Comments: %% comment
    highlighted = highlighted.replace(
      /(%%.*$)/gm,
      '<span class="syntax-comment">$1</span>'
    );

    // Strings in quotes
    highlighted = highlighted.replace(
      /"([^"]*)"/g,
      '<span class="syntax-string">"$1"</span>'
    );

    return highlighted;
  }, []);

  const highlightedCode = useMemo(
    () => highlightMermaidSyntax(value),
    [value, highlightMermaidSyntax]
  );

  return (
    <div className={`h-full w-full flex overflow-hidden relative ${className}`}>
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

      {/* Container for overlay and textarea */}
      <div className="flex-1 relative overflow-hidden">
        {/* Syntax Highlighting Overlay */}
        <pre
          ref={highlightRef}
          className="absolute inset-0 px-4 py-4 font-mono text-sm overflow-auto pointer-events-none whitespace-pre-wrap break-words"
          style={{
            lineHeight: '24px',
            tabSize: 2
          }}
          aria-hidden="true"
        >
          <code
            className="mermaid-syntax-highlight"
            dangerouslySetInnerHTML={{ __html: highlightedCode || ' ' }}
          />
        </pre>

        {/* Transparent Textarea */}
        <textarea
          ref={editorRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          readOnly={readOnly}
          className="absolute inset-0 px-4 py-4 font-mono text-sm bg-transparent text-transparent caret-gray-900 dark:caret-slate-100 resize-none outline-none overflow-auto whitespace-pre-wrap break-words"
          placeholder={placeholder}
          spellCheck={false}
          style={{
            tabSize: 2,
            lineHeight: '24px',
            caretColor: 'currentColor',
            color: 'transparent'
          }}
        />
      </div>

      {/* CSS for syntax highlighting */}
      <style jsx>{`
        .mermaid-syntax-highlight .syntax-keyword {
          color: #d73a49; /* Red for keywords */
        }
        :global(.dark) .mermaid-syntax-highlight .syntax-keyword {
          color: #ff7b72;
        }

        .mermaid-syntax-highlight .syntax-direction {
          color: #6f42c1; /* Purple for directions */
        }
        :global(.dark) .mermaid-syntax-highlight .syntax-direction {
          color: #d2a8ff;
        }

        .mermaid-syntax-highlight .syntax-arrow {
          color: #005cc5; /* Blue for arrows */
        }
        :global(.dark) .mermaid-syntax-highlight .syntax-arrow {
          color: #79c0ff;
        }

        .mermaid-syntax-highlight .syntax-edge-label {
          color: #22863a; /* Green for edge labels */
        }
        :global(.dark) .mermaid-syntax-highlight .syntax-edge-label {
          color: #7ee787;
        }

        .mermaid-syntax-highlight .syntax-node-shape {
          color: #6f42c1; /* Purple for node shapes */
        }
        :global(.dark) .mermaid-syntax-highlight .syntax-node-shape {
          color: #d2a8ff;
        }

        .mermaid-syntax-highlight .syntax-style {
          color: #e36209; /* Orange for style declarations */
        }
        :global(.dark) .mermaid-syntax-highlight .syntax-style {
          color: #ffa657;
        }

        .mermaid-syntax-highlight .syntax-comment {
          color: #6a737d; /* Gray for comments */
          font-style: italic;
        }
        :global(.dark) .mermaid-syntax-highlight .syntax-comment {
          color: #8b949e;
        }

        .mermaid-syntax-highlight .syntax-string {
          color: #032f62; /* Dark blue for strings */
        }
        :global(.dark) .mermaid-syntax-highlight .syntax-string {
          color: #a5d6ff;
        }

        /* Make sure text color in light/dark mode for non-highlighted parts */
        .mermaid-syntax-highlight {
          color: #24292e; /* Default text color light mode */
        }
        :global(.dark) .mermaid-syntax-highlight {
          color: #e6edf3; /* Default text color dark mode */
        }
      `}</style>
    </div>
  );
}
