'use client';
import React from 'react';
import TextDiffViewer from './components/TextDiffViewer';

export default function TextComparePage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Text Compare Tool</h1>
      <p className="mb-4">Compare two text snippets and see their differences highlighted line by line</p>
      <TextDiffViewer />
    </main>
  );
}
