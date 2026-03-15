'use client';

import { Suspense } from 'react';
import TimestampConverterTool from './components/TimestampConverterTool';

export default function TimestampConverterPage() {
  return (
    <Suspense>
      <TimestampConverterTool />
    </Suspense>
  );
}
