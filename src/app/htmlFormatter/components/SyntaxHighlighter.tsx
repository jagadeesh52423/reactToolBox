'use client';
import React from 'react';
import { highlightHtml } from '../utils/htmlUtils';

interface SyntaxHighlighterProps {
  code: string;
  language: 'html' | 'css' | 'javascript';
}

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ code, language }) => {
  // Use a simple syntax highlighting for HTML
  const highlightedCode = highlightHtml(code);

  return (
    <pre className="p-4 whitespace-pre-wrap overflow-auto font-mono text-sm leading-snug">
      <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  );
};

export default SyntaxHighlighter;
