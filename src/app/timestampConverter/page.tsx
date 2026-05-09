import type { Metadata } from 'next';
import { Suspense } from 'react';
import TimestampConverterTool from './components/TimestampConverterTool';

export const metadata: Metadata = {
  title: 'Timestamp Converter',
  description: 'Convert between Unix timestamps and human-readable date formats.',
};

export default function TimestampConverterPage() {
  return (
    <Suspense>
      <TimestampConverterTool />
    </Suspense>
  );
}
