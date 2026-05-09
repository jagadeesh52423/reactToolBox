import type { Metadata } from 'next';
import HtmlFormatterTool from './components/HtmlFormatterTool';

export const metadata: Metadata = {
  title: 'HTML Formatter',
  description: 'Format and beautify HTML with syntax highlighting.',
};

export default function HtmlFormatterPage() {
  return <HtmlFormatterTool />;
}
