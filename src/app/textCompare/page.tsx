import type { Metadata } from 'next';
import TextDiffViewer from './components/TextDiffViewer';

export const metadata: Metadata = {
  title: 'Text Compare',
  description: 'Compare two text snippets and visualize their differences line by line.',
};

export default function TextComparePage() {
  return <TextDiffViewer />;
}
