'use client';

import { Suspense } from 'react';
import Base64Tool from './components/Base64Tool';

export default function Base64Page() {
    return (
        <Suspense>
            <Base64Tool />
        </Suspense>
    );
}
