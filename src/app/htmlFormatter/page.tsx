'use client';
import React from 'react';
import HtmlFormatterTool from './components/HtmlFormatterTool';

export default function HtmlFormatterPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">HTML Formatter</h1>
      <p className="mb-4">Format and beautify HTML code with syntax highlighting and indentation options.</p>
      <HtmlFormatterTool />
    </main>
  );
}
