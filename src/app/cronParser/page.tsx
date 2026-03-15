'use client';

import { Suspense } from 'react';
import CronParserTool from './components/CronParserTool';

export default function CronParserPage() {
  return (
    <Suspense>
      <CronParserTool />
    </Suspense>
  );
}
