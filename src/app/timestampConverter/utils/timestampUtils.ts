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

const SECONDS_MS_THRESHOLD = 1e12;
const MIN_PLAUSIBLE_YEAR = 1;
const MAX_PLAUSIBLE_YEAR = 9999;

function isPlausibleYear(date: Date): boolean {
  const year = date.getUTCFullYear();
  return year >= MIN_PLAUSIBLE_YEAR && year <= MAX_PLAUSIBLE_YEAR;
}

/**
 * Parse user input into a Date object.
 *
 * Detection order:
 * 1. Numeric input less than 1e12 is treated as Unix seconds, unless that
 *    reading lands outside a plausible year range, in which case it's
 *    almost certainly milliseconds instead (e.g. 999999999999 as seconds
 *    is year 33658; as milliseconds it's a sane 2001 date).
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
    if (num < SECONDS_MS_THRESHOLD) {
      const secondsDate = new Date(num * 1000);
      if (!isNaN(secondsDate.getTime())) {
        if (isPlausibleYear(secondsDate)) return secondsDate;

        const millisecondsDate = new Date(num);
        if (!isNaN(millisecondsDate.getTime()) && isPlausibleYear(millisecondsDate)) {
          return millisecondsDate;
        }
        return secondsDate;
      }
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
 * Formats a value that depends on the user-supplied timezone string, returning
 * an inline error message instead of throwing when the timezone is invalid.
 */
export function formatWithTimezone(timezone: string, format: (tz: string) => string): string {
  try {
    return format(timezone);
  } catch {
    return `Invalid timezone: ${timezone}`;
  }
}

/**
 * Build the full set of conversion results for a parsed date.
 *
 * Timezone-dependent fields (Local Date/Time, Day of Week) are computed
 * independently so an invalid `timezone` string only affects those two
 * fields instead of blanking out the whole result set.
 */
export function computeConversions(date: Date, timezone: string): ConversionResult[] {
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
      value: formatWithTimezone(timezone, (tz) => date.toLocaleString('en-US', { timeZone: tz })),
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
      value: formatWithTimezone(timezone, (tz) =>
        date.toLocaleDateString('en-US', { weekday: 'long', timeZone: tz })
      ),
    },
    {
      label: 'Week of Year',
      value: `Week ${getISOWeekNumber(date)}`,
    },
  ];
}

export { getTimezones, getLocalTimezone } from '@/lib/timezones';

const WEEKDAY_SHORT_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const WEEKDAY_LONG_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
const MONTH_SHORT_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];
const MONTH_LONG_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface DateDisplayParts {
  year: number;
  month: number; // 1-12
  day: number;
  hour24: number;
  hour12: number;
  minute: number;
  second: number;
  weekdayIndex: number; // 0=Sunday..6=Saturday
}

function getDateDisplayParts(date: Date, timezone: string): DateDisplayParts {
  const formatted = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(date);

  const map: Record<string, string> = {};
  for (const part of formatted) {
    map[part.type] = part.value;
  }

  // Some environments render midnight as "24" under hour12: false.
  let hour24 = parseInt(map.hour, 10);
  if (hour24 === 24) hour24 = 0;
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const weekdayIndex = WEEKDAY_SHORT_NAMES.indexOf(map.weekday as (typeof WEEKDAY_SHORT_NAMES)[number]);

  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour24,
    hour12,
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
    weekdayIndex: weekdayIndex === -1 ? 0 : weekdayIndex,
  };
}

/** Documented tokens for `formatWithPattern`, shown to the user as a legend. */
export const FORMAT_TOKENS_HELP =
  'YYYY=2026, YY=26, MMMM=July, MMM=Jul, MM=07, DDD=Thursday, ddd=Thu, DD=10, HH=23 (24h), hh=11 (12h), mm=59, ss=09, A=PM, a=pm';

// Ordered longest-prefix-first so e.g. "YYYY" matches before "YY" and "MMMM" before "MM".
const FORMAT_TOKEN_PATTERN = /YYYY|YY|MMMM|MMM|MM|DDD|ddd|DD|HH|hh|mm|ss|A|a/g;

/**
 * Renders `date` using a strftime/date-fns-style token pattern, projected into
 * the given IANA timezone. Unrecognized characters (punctuation, spaces) pass
 * through unchanged. See FORMAT_TOKENS_HELP for the supported token list.
 */
export function formatWithPattern(date: Date, pattern: string, timezone: string): string {
  let parts: DateDisplayParts;
  try {
    parts = getDateDisplayParts(date, timezone);
  } catch {
    return `Invalid timezone: ${timezone}`;
  }

  const pad2 = (value: number) => String(value).padStart(2, '0');

  return pattern.replace(FORMAT_TOKEN_PATTERN, (token) => {
    switch (token) {
      case 'YYYY': return String(parts.year);
      case 'YY': return String(parts.year).slice(-2);
      case 'MMMM': return MONTH_LONG_NAMES[parts.month - 1];
      case 'MMM': return MONTH_SHORT_NAMES[parts.month - 1];
      case 'MM': return pad2(parts.month);
      case 'DDD': return WEEKDAY_LONG_NAMES[parts.weekdayIndex];
      case 'ddd': return WEEKDAY_SHORT_NAMES[parts.weekdayIndex];
      case 'DD': return pad2(parts.day);
      case 'HH': return pad2(parts.hour24);
      case 'hh': return pad2(parts.hour12);
      case 'mm': return pad2(parts.minute);
      case 'ss': return pad2(parts.second);
      case 'A': return parts.hour24 < 12 ? 'AM' : 'PM';
      case 'a': return parts.hour24 < 12 ? 'am' : 'pm';
      default: return token;
    }
  });
}
