/**
 * Timestamp Converter Utilities
 *
 * Pure functions for parsing timestamps, computing conversions,
 * and calculating relative time strings. No external dependencies.
 */

export interface ConversionResult {
  label: string;
  value: string;
}

/**
 * Parse user input into a Date object.
 *
 * Detection order:
 * 1. Numeric input less than 1e12 is treated as Unix seconds.
 * 2. Numeric input >= 1e12 is treated as Unix milliseconds.
 * 3. Falls back to Date.parse for ISO 8601 and other date strings.
 *
 * Returns null when the input cannot be parsed.
 */
export function parseInput(input: string): Date | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Try numeric (Unix timestamp)
  const num = Number(trimmed);
  if (!isNaN(num) && isFinite(num)) {
    if (num < 1e12) {
      // Treat as Unix seconds
      const d = new Date(num * 1000);
      if (!isNaN(d.getTime())) return d;
    } else {
      // Treat as Unix milliseconds
      const d = new Date(num);
      if (!isNaN(d.getTime())) return d;
    }
  }

  // Try Date.parse (handles ISO 8601, RFC 2822, and common date strings)
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) return parsed;

  return null;
}

/**
 * Compute the ISO week number for a given date.
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number, with Sunday as 7
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Compute a human-readable relative time string such as "3 hours ago" or
 * "in 2 days".
 */
export function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const absDiff = Math.abs(diffMs);
  const suffix = diffMs >= 0 ? 'ago' : 'from now';

  const seconds = Math.floor(absDiff / 1000);
  if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''} ${suffix}`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ${suffix}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ${suffix}`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ${suffix}`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ${suffix}`;

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ${suffix}`;
}

/**
 * Build the full set of conversion results for a parsed date.
 */
export function computeConversions(date: Date, timezone: string): ConversionResult[] {
  try {
    return [
      {
        label: 'Unix Timestamp (seconds)',
        value: String(Math.floor(date.getTime() / 1000)),
      },
      {
        label: 'Unix Timestamp (milliseconds)',
        value: String(date.getTime()),
      },
      {
        label: 'ISO 8601',
        value: date.toISOString(),
      },
      {
        label: 'RFC 2822',
        value: date.toUTCString(),
      },
      {
        label: 'Local Date/Time',
        value: date.toLocaleString('en-US', { timeZone: timezone }),
      },
      {
        label: 'UTC Date/Time',
        value: date.toLocaleString('en-US', { timeZone: 'UTC' }),
      },
      {
        label: 'Relative Time',
        value: getRelativeTime(date),
      },
      {
        label: 'Day of Week',
        value: date.toLocaleDateString('en-US', { weekday: 'long', timeZone: timezone }),
      },
      {
        label: 'Week of Year',
        value: `Week ${getISOWeekNumber(date)}`,
      },
    ];
  } catch {
    return [];
  }
}

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
