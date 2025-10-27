'use client';
import React from 'react';
import JsonComparer from './components/JsonComparer';

export default function JsonComparePage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">JSON Compare Tool</h1>
      <p className="mb-4">Compare two JSON objects and see their differences</p>
      <JsonComparer />
    </main>
  );
}
