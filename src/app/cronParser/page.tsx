import type { Metadata } from 'next';
import { Suspense } from 'react';
import CronParserTool from './components/CronParserTool';

export const metadata: Metadata = {
  title: 'Cron Parser',
  description: 'Parse cron expressions and preview the next scheduled run times.',
};

export default function CronParserPage() {
  return (
    <Suspense>
      <CronParserTool />
    </Suspense>
  );
}
