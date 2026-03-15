'use client';

import { Suspense } from 'react';
import RegexTesterTool from './components/RegexTesterTool';

export default function RegexTesterPage() {
    return (
        <Suspense>
            <RegexTesterTool />
        </Suspense>
    );
}
