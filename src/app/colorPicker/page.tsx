'use client';
import React from 'react';
import ColorPickerToolRefactored from './components/ColorPickerToolRefactored';

export default function ColorPickerPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Color Picker</h1>
      <p className="mb-4">Advanced color selection tool with hex, RGB, HSL, and HSV conversion.</p>
      <ColorPickerToolRefactored />
    </main>
  );
}
