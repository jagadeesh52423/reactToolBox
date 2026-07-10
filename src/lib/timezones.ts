/**
 * Shared IANA timezone list utilities, used by any tool with a timezone
 * picker (timestampConverter, cronParser).
 */

/**
 * Return a list of common IANA timezone identifiers.
 *
 * Uses Intl.supportedValuesOf when available, otherwise falls back to a
 * curated list covering the most common zones.
 */
export function getTimezones(): string[] {
  try {
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
      return (Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf('timeZone');
    }
  } catch {
    // Fall through to the static list below.
  }

  return [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Asia/Dubai',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];
}

/**
 * Return the user's local IANA timezone identifier.
 */
export function getLocalTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}
