import type { Metadata } from 'next';
import { Suspense } from 'react';
import Base64Tool from './components/Base64Tool';

export const metadata: Metadata = {
  title: 'Base64 Codec',
  description: 'Encode and decode Base64 text and files in your browser.',
};

export default function Base64Page() {
    return (
        <Suspense>
            <Base64Tool />
        </Suspense>
    );
}
