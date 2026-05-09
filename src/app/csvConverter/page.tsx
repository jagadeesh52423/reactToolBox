import type { Metadata } from 'next';
import CsvConverterTool from './components/CsvConverterTool';

export const metadata: Metadata = {
  title: 'CSV Converter',
  description: 'Convert between CSV, JSON, and YAML with configurable delimiters and a table view.',
};

export default function CsvConverterPage() {
    return <CsvConverterTool />;
}
