'use client';
import React from 'react';
import TextTransformer from './components/TextTransformer';

export default function TextUtilitiesPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Text Utilities</h1>
      <p className="mb-4">Collection of text transformation tools including case conversion and formatting.</p>
      <TextTransformer />
    </main>
  );
}
