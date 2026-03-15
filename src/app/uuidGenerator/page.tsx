'use client';

import UuidGeneratorTool from './components/UuidGeneratorTool';

/**
 * UUID/ID Generator Page
 *
 * Generate UUIDs, nanoids, and MongoDB ObjectId-style identifiers.
 *
 * Features:
 * - UUID v4 generation via crypto.randomUUID()
 * - Nanoid-compatible URL-safe IDs
 * - MongoDB ObjectId-style hex strings
 * - Bulk generation (1-100 IDs)
 * - Format options (hyphens, uppercase)
 * - Copy individual or all IDs
 * - Generation history
 */
export default function UuidGeneratorPage() {
    return <UuidGeneratorTool />;
}
