import type { Metadata } from 'next';
import JsonComparer from './components/JsonComparer';

export const metadata: Metadata = {
  title: 'JSON Compare',
  description: 'Compare two JSON documents side-by-side with inline difference highlighting.',
};

export default function JsonComparePage() {
  return <JsonComparer />;
}
