import type { Metadata } from 'next';
import UuidGeneratorTool from './components/UuidGeneratorTool';

export const metadata: Metadata = {
  title: 'UUID Generator',
  description: 'Generate UUIDs, nanoids, and MongoDB ObjectId-style identifiers in bulk.',
};

export default function UuidGeneratorPage() {
    return <UuidGeneratorTool />;
}
