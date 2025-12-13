'use client';
import React from 'react';
import { highlightHtml } from '../utils/htmlUtils';

interface SyntaxHighlighterProps {
  code: string;
  language: 'html' | 'css' | 'javascript';
}

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ code, language }) => {
  // Only apply syntax highlighting for display purposes
  const highlightedCode = language === 'html' ? highlightHtml(code) : code;

  return (
    <div className="relative">
      <pre className="p-4 whitespace-pre-wrap overflow-auto font-mono text-sm leading-snug bg-gray-50 border rounded">
        <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  );
};

export default SyntaxHighlighter;
