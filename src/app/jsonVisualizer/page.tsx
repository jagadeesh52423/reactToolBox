import type { Metadata } from 'next';
import JsonVisualizerClient from './JsonVisualizerClient';

export const metadata: Metadata = {
  title: 'JSON Visualizer',
  description: 'Interactive JSON viewer with search, tree navigation, and inline editing.',
};

export default function JsonVisualizerPage() {
  return <JsonVisualizerClient />;
}
