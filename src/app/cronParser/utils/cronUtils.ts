/**
 * Cron Expression Parser Utilities
 *
 * Pure functions for parsing cron expressions, generating human-readable
 * descriptions, and calculating next run times.
 *
 * Supports:
 * - 5-field standard: minute hour day-of-month month day-of-week
 * - 6-field with seconds: second minute hour day-of-month month day-of-week
 * - 7-field with seconds+year: second minute hour day-of-month month day-of-week year
 * - Named days (MON-SUN, Mon-Sun) and months (JAN-DEC, Jan-Dec)
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

/** Maps named days to numeric values (case-insensitive). */
const NAMED_DAYS: Record<string, number> = {
  sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6,
};

/** Maps named months to numeric values (case-insensitive). */
const NAMED_MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

interface FieldRange {
  min: number;
  max: number;
}

const FIELD_RANGES: Record<string, FieldRange> = {
  second: { min: 0, max: 59 },
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 6 },
  year: { min: 1970, max: 2099 },
};

export type CronFieldCount = 5 | 6 | 7;

export interface CronFields {
  second: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  year: string;
}

export interface CronParseResult {
  isValid: boolean;
  description: string;
  error: string | null;
  fields: CronFields | null;
  fieldCount: CronFieldCount;
}

/**
 * Replaces named day/month tokens with their numeric equivalents.
 * E.g. "MON-FRI" -> "1-5", "JAN,MAR" -> "1,3"
 */
function replaceNamedValues(field: string, nameMap: Record<string, number>): string {
  return field.replace(/[A-Za-z]{3}/g, (match) => {
    const num = nameMap[match.toLowerCase()];
    return num !== undefined ? String(num) : match;
  });
}

/**
 * Expands a single cron field into the set of matching integer values.
 * Supports: *, N, N-M, N/S, N-M/S, and comma-separated combinations.
 */
export function expandField(field: string, range: FieldRange): number[] | null {
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
 * Detects field count and parses a cron expression.
 * - 5 fields: minute hour dom month dow
 * - 6 fields: second minute hour dom month dow
 * - 7 fields: second minute hour dom month dow year
 */
export function parseCronExpression(expression: string): CronParseResult {
  const trimmed = expression.trim();
  if (!trimmed) {
    return { isValid: false, description: '', error: 'Expression is empty', fields: null, fieldCount: 5 };
  }

  const parts = trimmed.split(/\s+/);
  const count = parts.length;

  if (count < 5 || count > 7) {
    return {
      isValid: false,
      description: '',
      error: `Expected 5, 6, or 7 fields but got ${count}. Formats: [sec] min hour dom month dow [year]`,
      fields: null,
      fieldCount: 5,
    };
  }

  const fieldCount = count as CronFieldCount;

  // Normalize named values before parsing
  let second: string, minute: string, hour: string, dayOfMonth: string, month: string, dayOfWeek: string, year: string;

  if (count === 5) {
    [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    second = '0';
    year = '*';
  } else if (count === 6) {
    [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
    year = '*';
  } else {
    [second, minute, hour, dayOfMonth, month, dayOfWeek, year] = parts;
  }

  // Replace named values
  month = replaceNamedValues(month, NAMED_MONTHS);
  dayOfWeek = replaceNamedValues(dayOfWeek, NAMED_DAYS);

  const fields: CronFields = { second, minute, hour, dayOfMonth, month, dayOfWeek, year };

  // Validate each field
  const fieldChecks: Array<{ key: string; label: string; value: string }> = [
    { key: 'second', label: 'Second', value: second },
    { key: 'minute', label: 'Minute', value: minute },
    { key: 'hour', label: 'Hour', value: hour },
    { key: 'dayOfMonth', label: 'Day of month', value: dayOfMonth },
    { key: 'month', label: 'Month', value: month },
    { key: 'dayOfWeek', label: 'Day of week', value: dayOfWeek },
  ];

  // Only validate year if 7 fields
  if (count === 7) {
    fieldChecks.push({ key: 'year', label: 'Year', value: year });
  }

  for (const { key, label, value } of fieldChecks) {
    if (!validateField(value, FIELD_RANGES[key])) {
      return {
        isValid: false,
        description: '',
        error: `Invalid ${label} field: "${value}" (allowed: ${FIELD_RANGES[key].min}-${FIELD_RANGES[key].max})`,
        fields,
        fieldCount,
      };
    }
  }

  const description = generateDescription(fields, fieldCount);

  return { isValid: true, description, error: null, fields, fieldCount };
}

/**
 * Generates a human-readable description of a cron expression.
 */
function generateDescription(fields: CronFields, fieldCount: CronFieldCount): string {
  const parts: string[] = [];

  // Seconds part (only for 6/7-field)
  if (fieldCount >= 6 && fields.second !== '0') {
    if (fields.second === '*') {
      parts.push('Every second');
    } else if (/^\*\/\d+$/.test(fields.second)) {
      const step = fields.second.split('/')[1];
      parts.push(`Every ${step} seconds`);
    } else {
      parts.push(`At second ${fields.second}`);
    }
  }

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

  // Year part (only for 7-field)
  if (fieldCount === 7 && fields.year !== '*') {
    parts.push(`in year ${fields.year}`);
  }

  return parts.join(', ');
}

/**
 * Describes the time portion (minute + hour) of a cron expression.
 */
function describeTime(minute: string, hour: string): string {
  if (minute === '*' && hour === '*') {
    return 'Every minute';
  }

  if (/^\*\/\d+$/.test(minute) && hour === '*') {
    const step = minute.split('/')[1];
    return `Every ${step} minutes`;
  }

  if (/^\d+$/.test(minute) && hour === '*') {
    return `At minute ${minute} of every hour`;
  }

  if (minute === '*' && /^\d+$/.test(hour)) {
    const h = parseInt(hour, 10);
    return `Every minute from ${formatHour(h)}`;
  }

  if (/^\*\/\d+$/.test(minute) && /^\d+$/.test(hour)) {
    const step = minute.split('/')[1];
    const h = parseInt(hour, 10);
    return `Every ${step} minutes starting at ${formatHour(h)}`;
  }

  if (/^\d+$/.test(minute) && /^\d+$/.test(hour)) {
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    return `At ${formatTime(h, m)}`;
  }

  if (/^\d+$/.test(minute) && /^\*\/\d+$/.test(hour)) {
    const m = parseInt(minute, 10);
    const step = hour.split('/')[1];
    return `At minute ${m} every ${step} hours`;
  }

  const minuteDesc = minute === '*' ? 'every minute' : `minute ${minute}`;
  const hourDesc = hour === '*' ? 'every hour' : `hour ${hour}`;
  return `At ${minuteDesc}, ${hourDesc}`;
}

function formatHour(h: number): string {
  if (h === 0) return '12:00 AM';
  if (h === 12) return '12:00 PM';
  if (h < 12) return `${h}:00 AM`;
  return `${h - 12}:00 PM`;
}

function formatTime(h: number, m: number): string {
  const minuteStr = m.toString().padStart(2, '0');
  if (h === 0) return `12:${minuteStr} AM`;
  if (h === 12) return `12:${minuteStr} PM`;
  if (h < 12) return `${h}:${minuteStr} AM`;
  return `${h - 12}:${minuteStr} PM`;
}

/**
 * Calculates the next N run times for a given cron expression.
 * Supports 5, 6, and 7 field expressions.
 * Uses skip-ahead optimization. Caps search at 366 days.
 */
export function getNextRuns(expression: string, count: number = 10, from?: Date): Date[] {
  const parseResult = parseCronExpression(expression);
  if (!parseResult.isValid || !parseResult.fields) return [];

  const { fields, fieldCount } = parseResult;
  const secondVals = expandField(fields.second, FIELD_RANGES.second)!;
  const minuteVals = expandField(fields.minute, FIELD_RANGES.minute)!;
  const hourVals = expandField(fields.hour, FIELD_RANGES.hour)!;
  const dayOfMonthVals = expandField(fields.dayOfMonth, FIELD_RANGES.dayOfMonth)!;
  const monthVals = expandField(fields.month, FIELD_RANGES.month)!;
  const dayOfWeekVals = expandField(fields.dayOfWeek, FIELD_RANGES.dayOfWeek)!;
  const yearVals = fieldCount === 7 ? expandField(fields.year, FIELD_RANGES.year) : null;

  const hasSeconds = fieldCount >= 6 && !(secondVals.length === 1 && secondVals[0] === 0);

  const results: Date[] = [];
  const start = from ? new Date(from) : new Date();

  if (hasSeconds) {
    // Round up to next second
    start.setMilliseconds(0);
    start.setSeconds(start.getSeconds() + 1);
  } else {
    // Round up to the next full minute
    start.setSeconds(0, 0);
    start.setMinutes(start.getMinutes() + 1);
  }

  const candidate = new Date(start);
  const maxDate = new Date(start);
  maxDate.setDate(maxDate.getDate() + 366);

  while (candidate <= maxDate && results.length < count) {
    const cYear = candidate.getFullYear();
    const cMonth = candidate.getMonth() + 1;
    const cDayOfMonth = candidate.getDate();
    const cDayOfWeek = candidate.getDay();
    const cHour = candidate.getHours();
    const cMinute = candidate.getMinutes();
    const cSecond = candidate.getSeconds();

    // Check year (if 7-field)
    if (yearVals && !yearVals.includes(cYear)) {
      // Skip to next year
      candidate.setFullYear(cYear + 1, 0, 1);
      candidate.setHours(0, 0, 0, 0);
      continue;
    }

    if (!monthVals.includes(cMonth)) {
      candidate.setMonth(candidate.getMonth() + 1, 1);
      candidate.setHours(0, 0, 0, 0);
      continue;
    }

    if (!dayOfMonthVals.includes(cDayOfMonth) || !dayOfWeekVals.includes(cDayOfWeek)) {
      candidate.setDate(candidate.getDate() + 1);
      candidate.setHours(0, 0, 0, 0);
      continue;
    }

    if (!hourVals.includes(cHour)) {
      candidate.setHours(candidate.getHours() + 1, 0, 0, 0);
      continue;
    }

    if (!minuteVals.includes(cMinute)) {
      candidate.setMinutes(candidate.getMinutes() + 1, 0, 0);
      continue;
    }

    if (hasSeconds && !secondVals.includes(cSecond)) {
      candidate.setSeconds(candidate.getSeconds() + 1, 0);
      continue;
    }

    results.push(new Date(candidate));

    if (hasSeconds) {
      candidate.setSeconds(candidate.getSeconds() + 1, 0);
    } else {
      candidate.setMinutes(candidate.getMinutes() + 1, 0, 0);
    }
  }

  return results;
}

/**
 * Formats a Date as a human-readable string for display.
 * Includes seconds if the expression uses seconds.
 */
export function formatRunDate(date: Date, showSeconds: boolean = false): string {
  const dayName = DAY_NAMES[date.getDay()];
  const monthName = MONTH_NAMES[date.getMonth() + 1];
  const day = date.getDate();
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const timeStr = formatTime(hours, minutes);

  if (showSeconds) {
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${dayName}, ${monthName} ${day}, ${year} at ${timeStr}:${seconds}`;
  }

  return `${dayName}, ${monthName} ${day}, ${year} at ${timeStr}`;
}

/**
 * Converts builder values into a cron expression string.
 * Supports 5, 6, and 7 field modes.
 */
export function builderToExpression(values: {
  second?: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  year?: string;
}, fieldCount: CronFieldCount = 5): string {
  if (fieldCount === 7) {
    return `${values.second || '0'} ${values.minute} ${values.hour} ${values.dayOfMonth} ${values.month} ${values.dayOfWeek} ${values.year || '*'}`;
  }
  if (fieldCount === 6) {
    return `${values.second || '0'} ${values.minute} ${values.hour} ${values.dayOfMonth} ${values.month} ${values.dayOfWeek}`;
  }
  return `${values.minute} ${values.hour} ${values.dayOfMonth} ${values.month} ${values.dayOfWeek}`;
}

/**
 * Converts a cron expression string into builder-compatible values.
 * Returns null if the expression cannot be split into 5, 6, or 7 fields.
 */
export function expressionToBuilder(expression: string): {
  second: string;
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
  year: string;
} | null {
  const parts = expression.trim().split(/\s+/);
  if (parts.length === 5) {
    return {
      second: '0',
      minute: parts[0],
      hour: parts[1],
      dayOfMonth: parts[2],
      month: parts[3],
      dayOfWeek: parts[4],
      year: '*',
    };
  }
  if (parts.length === 6) {
    return {
      second: parts[0],
      minute: parts[1],
      hour: parts[2],
      dayOfMonth: parts[3],
      month: parts[4],
      dayOfWeek: parts[5],
      year: '*',
    };
  }
  if (parts.length === 7) {
    return {
      second: parts[0],
      minute: parts[1],
      hour: parts[2],
      dayOfMonth: parts[3],
      month: parts[4],
      dayOfWeek: parts[5],
      year: parts[6],
    };
  }
  return null;
}

/**
 * Detects the field count from an expression string.
 */
export function detectFieldCount(expression: string): CronFieldCount {
  const count = expression.trim().split(/\s+/).length;
  if (count === 6) return 6;
  if (count === 7) return 7;
  return 5;
}
