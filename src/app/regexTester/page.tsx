import type { Metadata } from 'next';
import { Suspense } from 'react';
import RegexTesterTool from './components/RegexTesterTool';

export const metadata: Metadata = {
  title: 'Regex Tester',
  description: 'Test and debug regular expressions with live matching and capture group inspection.',
};

export default function RegexTesterPage() {
    return (
        <Suspense>
            <RegexTesterTool />
        </Suspense>
    );
}
