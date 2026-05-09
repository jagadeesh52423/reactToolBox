import type { Metadata } from 'next';
import HomePage from './HomePage';

export const metadata: Metadata = {
  title: {
    absolute: 'React Toolbox — Developer Tools for JSON, Text, Regex & More',
  },
  description:
    'A free collection of fast, privacy-friendly developer tools — JSON visualizer, diff, CSV/YAML, regex, color picker, Mermaid, and more.',
};

export default function Page() {
  return <HomePage />;
}
