import React from 'react';
import TextCaseConverter from './components/TextCaseConverter';

export default function TextCasePage() {
  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Text Case Converter</h1>
        <p className="text-gray-600">
          Convert your text between different case formats including uppercase, lowercase, camelCase, snake_case, and more.
        </p>
      </div>
      <TextCaseConverter />
    </main>
  );
}