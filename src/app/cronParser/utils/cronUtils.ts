/**
 * Cron Expression Parser Utilities
 *
 * Pure functions for parsing cron expressions, generating human-readable
 * descriptions, and calculating next run times. Supports standard 5-field
 * cron format: minute hour day-of-month month day-of-week.
 */

const MONTH_NAMES = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const SHORT_MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

interface FieldRange {
  min: number;
  max: number;
}

const FIELD_RANGES: Record<string, FieldRange> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 6 },
};

export interface CronParseResult {
  isValid: boolean;
  description: string;
  error: string | null;
  fields: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  } | null;
}

/**
 * Expands a single cron field into the set of matching integer values.
 * Supports: *, N, N-M, N/S, N-M/S, and comma-separated combinations.
 */
function expandField(field: string, range: FieldRange): number[] | null {
  const values = new Set<number>();
  const parts = field.split(',');

  for (const part of parts) {
    const trimmed = part.trim();

    // Wildcard with step: */N
    if (/^\*\/\d+$/.test(trimmed)) {
      const step = parseInt(trimmed.split('/')[1], 10);
      if (step <= 0) return null;
      for (let i = range.min; i <= range.max; i += step) {
        values.add(i);
      }
      continue;
    }

    // Wildcard: *
    if (trimmed === '*') {
      for (let i = range.min; i <= range.max; i++) {
        values.add(i);
      }
      continue;
    }

    // Range with step: N-M/S
    if (/^\d+-\d+\/\d+$/.test(trimmed)) {
      const [rangePart, stepStr] = trimmed.split('/');
      const [startStr, endStr] = rangePart.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      const step = parseInt(stepStr, 10);
      if (start < range.min || end > range.max || start > end || step <= 0) return null;
      for (let i = start; i <= end; i += step) {
        values.add(i);
      }
      continue;
    }

    // Range: N-M
    if (/^\d+-\d+$/.test(trimmed)) {
      const [startStr, endStr] = trimmed.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (start < range.min || end > range.max || start > end) return null;
      for (let i = start; i <= end; i++) {
        values.add(i);
      }
      continue;
    }

    // Single value with step: N/S
    if (/^\d+\/\d+$/.test(trimmed)) {
      const [startStr, stepStr] = trimmed.split('/');
      const start = parseInt(startStr, 10);
      const step = parseInt(stepStr, 10);
      if (start < range.min || start > range.max || step <= 0) return null;
      for (let i = start; i <= range.max; i += step) {
        values.add(i);
      }
      continue;
    }

    // Single value: N
    if (/^\d+$/.test(trimmed)) {
      const val = parseInt(trimmed, 10);
      if (val < range.min || val > range.max) return null;
      values.add(val);
      continue;
    }

    // Invalid syntax
    return null;
  }

  if (values.size === 0) return null;
  return Array.from(values).sort((a, b) => a - b);
}

/**
 * Validates a single field token against its allowed range.
 */
function validateField(field: string, range: FieldRange): boolean {
  return expandField(field, range) !== null;
}

/**
 * Parses a cron expression and returns validation result, description, and parsed fields.
 */
export function parseCronExpression(expression: string): CronParseResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { isValid: false, description: '', error: 'Expression is empty', fields: null };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length !== 5) {
    return {
      isValid: false,
      description: '',
      error: `Expected 5 fields but got ${parts.length}. Format: minute hour day-of-month month day-of-week`,
      fields: null,
    };
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  const fields = { minute, hour, dayOfMonth, month, dayOfWeek };

  // Validate each field
  const fieldNames: Array<{ key: keyof typeof FIELD_RANGES; label: string; value: string }> = [
    { key: 'minute', label: 'Minute', value: minute },
    { key: 'hour', label: 'Hour', value: hour },
    { key: 'dayOfMonth', label: 'Day of month', value: dayOfMonth },
    { key: 'month', label: 'Month', value: month },
    { key: 'dayOfWeek', label: 'Day of week', value: dayOfWeek },
  ];

  for (const { key, label, value } of fieldNames) {
    if (!validateField(value, FIELD_RANGES[key])) {
      return {
        isValid: false,
        description: '',
        error: `Invalid ${label} field: "${value}" (allowed: ${FIELD_RANGES[key].min}-${FIELD_RANGES[key].max})`,
        fields,
      };
    }
  }

  const description = generateDescription(fields);

  return { isValid: true, description, error: null, fields };
}

/**
 * Generates a human-readable description of a cron expression.
 */
function generateDescription(fields: {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}): string {
  const parts: string[] = [];

  // Time part
  const timePart = describeTime(fields.minute, fields.hour);
  parts.push(timePart);

  // Day-of-month part
  if (fields.dayOfMonth !== '*') {
    if (/^\*\/\d+$/.test(fields.dayOfMonth)) {
      const step = fields.dayOfMonth.split('/')[1];
      parts.push(`every ${step} days`);
    } else {
      const days = fields.dayOfMonth.split(',').join(', ');
      parts.push(`on day ${days} of the month`);
    }
  }

  // Month part
  if (fields.month !== '*') {
    if (/^\*\/\d+$/.test(fields.month)) {
      const step = fields.month.split('/')[1];
      parts.push(`every ${step} months`);
    } else {
      const months = fields.month.split(',').map(m => {
        const num = parseInt(m, 10);
        return SHORT_MONTH_NAMES[num] || m;
      }).join(', ');
      parts.push(`in ${months}`);
    }
  }

  // Day-of-week part
  if (fields.dayOfWeek !== '*') {
    if (/^\*\/\d+$/.test(fields.dayOfWeek)) {
      const step = fields.dayOfWeek.split('/')[1];
      parts.push(`every ${step} days of the week`);
    } else {
      const days = fields.dayOfWeek.split(',').map(d => {
        const num = parseInt(d, 10);
        return SHORT_DAY_NAMES[num] || d;
      }).join(', ');
      parts.push(`on ${days}`);
    }
  }

  return parts.join(', ');
}

/**
 * Describes the time portion (minute + hour) of a cron expression.
 */
function describeTime(minute: string, hour: string): string {
  // Every minute
  if (minute === '*' && hour === '*') {
    return 'Every minute';
  }

  // Every N minutes, every hour
  if (/^\*\/\d+$/.test(minute) && hour === '*') {
    const step = minute.split('/')[1];
    return `Every ${step} minutes`;
  }

  // Specific minute, every hour
  if (/^\d+$/.test(minute) && hour === '*') {
    return `At minute ${minute} of every hour`;
  }

  // Every minute of specific hour
  if (minute === '*' && /^\d+$/.test(hour)) {
    const h = parseInt(hour, 10);
    return `Every minute from ${formatHour(h)}`;
  }

  // Every N minutes of specific hour
  if (/^\*\/\d+$/.test(minute) && /^\d+$/.test(hour)) {
    const step = minute.split('/')[1];
    const h = parseInt(hour, 10);
    return `Every ${step} minutes starting at ${formatHour(h)}`;
  }

  // Specific minute and hour
  if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    return `At ${formatTime(h, m)}`;
  }

  // Every N hours
  if (/^\d+$/.test(minute) && /^\*\/\d+$/.test(hour)) {
    const m = parseInt(minute, 10);
    const step = hour.split('/')[1];
    return `At minute ${m} every ${step} hours`;
  }

  // Fallback for complex expressions
  const minuteDesc = minute === '*' ? 'every minute' : `minute ${minute}`;
  const hourDesc = hour === '*' ? 'every hour' : `hour ${hour}`;
  return `At ${minuteDesc}, ${hourDesc}`;
}

/**
 * Formats an hour value as 12-hour AM/PM.
 */
function formatHour(h: number): string {
  if (h === 0) return '12:00 AM';
  if (h === 12) return '12:00 PM';
  if (h < 12) return `${h}:00 AM`;
  return `${h - 12}:00 PM`;
}

/**
 * Formats hour and minute as 12-hour time.
 */
function formatTime(h: number, m: number): string {
  const minuteStr = m.toString().padStart(2, '0');
  if (h === 0) return `12:${minuteStr} AM`;
  if (h === 12) return `12:${minuteStr} PM`;
  if (h < 12) return `${h}:${minuteStr} AM`;
  return `${h - 12}:${minuteStr} PM`;
}

/**
 * Calculates the next N run times for a given cron expression.
 * Starting from the current time, iterates minute by minute and checks
 * if each candidate matches all 5 fields.
 *
 * Uses skip-ahead optimization to avoid checking every single minute.
 * Caps search at 366 days to prevent infinite loops.
 */
export function getNextRuns(expression: string, count: number = 10, from?: Date): Date[] {
  const parseResult = parseCronExpression(expression);
  if (!parseResult.isValid || !parseResult.fields) return [];

  const { fields } = parseResult;
  const minuteVals = expandField(fields.minute, FIELD_RANGES.minute)!;
  const hourVals = expandField(fields.hour, FIELD_RANGES.hour)!;
  const dayOfMonthVals = expandField(fields.dayOfMonth, FIELD_RANGES.dayOfMonth)!;
  const monthVals = expandField(fields.month, FIELD_RANGES.month)!;
  const dayOfWeekVals = expandField(fields.dayOfWeek, FIELD_RANGES.dayOfWeek)!;

  const results: Date[] = [];
  const start = from ? new Date(from) : new Date();

  // Round up to the next full minute
  start.setSeconds(0, 0);
  start.setMinutes(start.getMinutes() + 1);

  const candidate = new Date(start);
  const maxDate = new Date(start);
  maxDate.setDate(maxDate.getDate() + 366);

  while (candidate <= maxDate && results.length < count) {
    const month = candidate.getMonth() + 1; // 1-12
    const dayOfMonth = candidate.getDate();
    const dayOfWeek = candidate.getDay(); // 0-6
    const hour = candidate.getHours();
    const minute = candidate.getMinutes();

    // Check month first (biggest skip potential)
    if (!monthVals.includes(month)) {
      // Skip to next matching month
      candidate.setMonth(candidate.getMonth() + 1, 1);
      candidate.setHours(0, 0, 0, 0);
      continue;
    }

    // Check day of month and day of week
    if (!dayOfMonthVals.includes(dayOfMonth) || !dayOfWeekVals.includes(dayOfWeek)) {
      // Skip to next day
      candidate.setDate(candidate.getDate() + 1);
      candidate.setHours(0, 0, 0, 0);
      continue;
    }

    // Check hour
    if (!hourVals.includes(hour)) {
      // Skip to next hour
      candidate.setHours(candidate.getHours() + 1, 0, 0, 0);
      continue;
    }

    // Check minute
    if (!minuteVals.includes(minute)) {
      candidate.setMinutes(candidate.getMinutes() + 1, 0, 0);
      continue;
    }

    // All fields match
    results.push(new Date(candidate));
    candidate.setMinutes(candidate.getMinutes() + 1, 0, 0);
  }

  return results;
}

/**
 * Formats a Date as a human-readable string for display.
 */
export function formatRunDate(date: Date): string {
  const dayName = DAY_NAMES[date.getDay()];
  const monthName = MONTH_NAMES[date.getMonth() + 1];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeStr = formatTime(hours, minutes);

  return `${dayName}, ${monthName} ${day}, ${year} at ${timeStr}`;
}

/**
 * Converts builder values into a cron expression string.
 */
export function builderToExpression(values: {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}): string {
  return `${values.minute} ${values.hour} ${values.dayOfMonth} ${values.month} ${values.dayOfWeek}`;
}

/**
 * Converts a cron expression string into builder-compatible values.
 * Returns null if the expression cannot be split into exactly 5 fields.
 */
export function expressionToBuilder(expression: string): {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
} | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) return null;
  return {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  };
}
