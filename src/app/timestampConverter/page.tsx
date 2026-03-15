'use client';

import TimestampConverterTool from './components/TimestampConverterTool';

/**
 * Timestamp Converter Page
 *
 * Convert between Unix timestamps and human-readable date formats.
 *
 * Features:
 * - Live-updating current time display
 * - Auto-detect Unix seconds, milliseconds, and date strings
 * - Timezone selector with full IANA list
 * - Relative time display
 * - 9 conversion formats with individual copy buttons
 * - Native date/time picker for reverse conversion
 */
export default function TimestampConverterPage() {
  return <TimestampConverterTool />;
}
