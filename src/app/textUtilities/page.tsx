import type { Metadata } from 'next';
import TextTransformer from './components/TextTransformer';

export const metadata: Metadata = {
  title: 'Text Utilities',
  description: 'Transform text with case conversion, encoding, trimming, and other quick utilities.',
};

export default function TextUtilitiesPage() {
  return <TextTransformer />;
}
