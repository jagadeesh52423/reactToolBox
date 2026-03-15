'use client';

import Base64Tool from './components/Base64Tool';

/**
 * Base64 Encoder/Decoder Page
 *
 * Encode and decode Base64 text and files.
 *
 * Features:
 * - Encode text to Base64 (UTF-8 safe)
 * - Decode Base64 to text (UTF-8 safe)
 * - Auto-detect encode/decode mode
 * - File/image encoding via FileReader
 * - Copy output to clipboard
 */
export default function Base64Page() {
    return <Base64Tool />;
}
