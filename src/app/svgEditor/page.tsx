'use client';
import React from 'react';
import MermaidEditor from './components/MermaidEditor';

export default function SvgEditorPage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">SVG Editor with Mermaid</h1>
      <p className="mb-4">Create diagrams with Mermaid syntax and download them as SVG images.</p>
      <MermaidEditor />
    </main>
  );
}
