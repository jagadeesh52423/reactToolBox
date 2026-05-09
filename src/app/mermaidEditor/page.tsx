import type { Metadata } from 'next';
import MermaidEditorClient from './MermaidEditorClient';

export const metadata: Metadata = {
  title: 'Mermaid Editor',
  description: 'Author Mermaid diagrams with live preview and SVG export.',
};

export default function MermaidEditorPage() {
  return <MermaidEditorClient />;
}
